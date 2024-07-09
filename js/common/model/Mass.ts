// Copyright 2019-2024, University of Colorado Boulder

/**
 * Represents a mass that interacts in the scene, and can potentially float or displace liquid.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import BooleanProperty, { BooleanPropertyOptions } from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import Matrix3, { Matrix3StateObject } from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Color, ColorProperty, GatedVisibleProperty, PDOMValueType } from '../../../../scenery/js/imports.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Material, { CreateCustomMaterialOptions, CUSTOM_MATERIAL_NAME, CustomMaterialName } from './Material.js';
import PhysicsEngine, { PhysicsEngineBody } from './PhysicsEngine.js';
import Basin from './Basin.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { MassShape } from './MassShape.js';
import { BodyStateObject } from './P2Engine.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import MassTag, { MassTagStateObject } from './MassTag.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import BlendedVector2Property from './BlendedVector2Property.js';
import MaterialEnumeration from './MaterialEnumeration.js';
import { GuardedNumberProperty, GuardedNumberPropertyOptions } from './GuardedNumberProperty.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';

// TODO: https://github.com/phetsims/density-buoyancy-common/issues/176: How do these relate to MaterialName which is the type of material.identifier?
// TODO: https://github.com/phetsims/density-buoyancy-common/issues/176 MK: I don't know how to say this type must be a subset of "keyof Material". Do you?
type MaterialNonCustomIdentifier = 'ALUMINUM' | 'BRICK' | 'COPPER' | 'ICE' | 'PLATINUM' | 'STEEL' | 'STYROFOAM' | 'WOOD' | 'PVC';
type MaterialIdentifier = MaterialNonCustomIdentifier | CustomMaterialName;

const materialToEnum = ( material: Material ): MaterialEnumeration => {
  const enumerationValue = MaterialEnumeration[ ( ( material.identifier as MaterialIdentifier | null ) || CUSTOM_MATERIAL_NAME ) ];

  assert && assert( enumerationValue, 'Unexpected material identifier: ' + material.identifier );
  return enumerationValue;
};

// For the Buoyancy Shapes screen, but needed here because setRatios is included in each core type
// See https://github.com/phetsims/buoyancy/issues/29
export const MASS_MIN_SHAPES_DIMENSION = 0.1; // 10cm => 1L square
export const MASS_MAX_SHAPES_DIMENSION = Math.pow( 0.01, 1 / 3 ); // 10L square

type SelfOptions = {

  // Required
  body: PhysicsEngineBody;
  shape: Shape;
  material: Material;
  volume: number;
  massShape: MassShape;

  visible?: boolean;
  matrix?: Matrix3;
  canRotate?: boolean;
  canMove?: boolean;

  // Allow Customization of the material beyond initial value, this includes PhET-iO support for changing the density
  // and color, as well as support for some screens to adjust density instead of mass/volume as is most typical, see https://github.com/phetsims/density/issues/101
  adjustableMaterial?: boolean;

  // Only used when adjustableMaterial:true. Set to true to support a PhET-iO instrumented Property to set the color
  // of the block. Set to false in order to calculate the color based on the current density + the density range.
  adjustableColor?: boolean;
  tag?: MassTag;
  accessibleName?: PDOMValueType | null;
  inputEnabledPropertyOptions?: BooleanPropertyOptions;
  materialPropertyOptions?: PropertyOptions<Material>;
  volumePropertyOptions?: NumberPropertyOptions;
  massPropertyOptions?: NumberPropertyOptions;

  // Accepted values for the Material Combo Box
  materialEnumPropertyValidValues?: MaterialEnumeration[];

  minVolume?: number;
  maxVolume?: number;
};

export type MassOptions = SelfOptions & PhetioObjectOptions;
export type InstrumentedMassOptions = MassOptions & PickRequired<MassOptions, 'tandem'>;

export type MassIOStateObject = {
  matrix: Matrix3StateObject;
  stepMatrix: Matrix3StateObject;
  originalMatrix: Matrix3StateObject;
  canRotate: boolean;
  canMove: boolean;
  tag: MassTagStateObject;
  massShape: string;
} & BodyStateObject;

export default abstract class Mass extends PhetioObject {

  protected readonly engine: PhysicsEngine;
  public readonly body: PhysicsEngineBody;

  private readonly massShape: MassShape;

  // Without the matrix applied (effectively in "local" model coordinates)
  public readonly shapeProperty: Property<Shape>;

  public readonly userControlledProperty: Property<boolean>;
  public readonly inputEnabledProperty: Property<boolean>;

  // This property is like a model value, indicating whether it should be shown
  public readonly internalVisibleProperty: Property<boolean>;

  // There is a gated visibility property that is accessible to PhET-iO. Combined with the above internalVisibleProperty
  // it yields this overall visibleProperty which is respected in the view.
  public readonly visibleProperty: TReadOnlyProperty<boolean>;

  public readonly materialProperty: Property<Material>;

  // for phet-io support (to control the materialProperty)
  public readonly materialEnumProperty?: Property<MaterialEnumeration>;

  // for phet-io support (to control the materialProperty)
  public readonly customDensityProperty?: NumberProperty;

  // for phet-io support (to control the materialProperty)
  private readonly customColorProperty?: Property<Color>;

  // In m^3 (cubic meters)
  public readonly volumeProperty: NumberProperty;

  // Percentage of submerged mass, if any
  public readonly percentSubmergedProperty: NumberProperty;

  // In kg (kilograms), added to the normal mass (computed from density and volume)
  protected readonly containedMassProperty: Property<number>;

  // In kg (kilograms) - written to by other processes
  public readonly massProperty: Property<number>;

  // The following offset will be added onto the body's position to determine ours. This value will not be applied to
  // the physics engine positional data, but instead appended here to this.matrix.
  protected readonly bodyOffsetProperty: Property<Vector2>;

  public readonly gravityForceInterpolatedProperty: InterpolatedProperty<Vector2>;
  public readonly buoyancyForceInterpolatedProperty: InterpolatedProperty<Vector2>;
  public readonly contactForceInterpolatedProperty: InterpolatedProperty<Vector2>;

  // A force with an interpolation to blend new values with old ones to avoid flickering
  public readonly contactForceBlendedProperty: BlendedVector2Property;

  public readonly forceOffsetProperty: Property<Vector3>;

  // The 3D offset from the center-of-mass where the mass-label should be shown from.
  // The mass label will use this position (plus the masses' position) to determine a view point, then will use the
  // massLabelOffsetOrientationProperty to position based on that point.
  public readonly massLabelOffsetProperty: Property<Vector3>;

  // Orientation multiplied by 1/2 width,height of the MassLabelNode for an offset in view space
  public readonly massLabelOffsetOrientationProperty: Property<Vector2>;

  // Transform matrix set before/after all the physics engine steps in a simulation step, to be used to adjust/read
  // the mass's position/transform.
  public readonly matrix: Matrix3;

  // Transform matrix set in the internal physics engine steps, used by masses to determine their per-physics-step information.
  protected readonly stepMatrix: Matrix3;

  public readonly transformedEmitter: TEmitter;
  public readonly stepEmitter = new Emitter();

  // Fired when this mass's input (drag) should be interrupted.
  public readonly interruptedEmitter: TEmitter;

  private canRotate: boolean;
  public canMove: boolean;
  public tag: MassTag;

  public readonly nameProperty: TReadOnlyProperty<string>;

  public readonly accessibleName: PDOMValueType;

  // Set by the model
  public containingBasin: Basin | null;

  private originalMatrix: Matrix3;

  // Required internal-physics-step properties that should be set by subtypes in
  // updateStepInformation(). There may exist more set by the subtype (that will be used for e.g. volume/area
  // calculations). These are updated more often than simulation steps. These specific values will be used by external
  // code for determining liquid height.
  public stepX: number; // x-value of the position
  public stepBottom: number; // minimum y value of the mass
  public stepTop: number; // maximum y value of the mass

  public readonly adjustableMaterial: boolean;

  protected constructor( engine: PhysicsEngine, providedOptions: MassOptions ) {

    const options = optionize<MassOptions, SelfOptions, PhetioObjectOptions>()( {
      visible: true,
      matrix: new Matrix3(),
      canRotate: false,
      canMove: true,
      adjustableMaterial: false,
      adjustableColor: true,
      tag: MassTag.NONE,
      accessibleName: null,
      phetioType: Mass.MassIO,
      inputEnabledPropertyOptions: {},
      materialPropertyOptions: {},
      volumePropertyOptions: {},
      massPropertyOptions: {},

      materialEnumPropertyValidValues: MaterialEnumeration.enumeration.values,

      minVolume: 0,
      maxVolume: Number.POSITIVE_INFINITY
    }, providedOptions );

    assert && assert( options.body, 'options.body required' );
    assert && assert( options.volume > 0, 'non-zero options.volume required' );

    super( options );

    // TODO: Why did the question mark disappear? See https://github.com/phetsims/density-buoyancy-common/issues/243
    const tandem: Tandem = options.tandem;

    this.engine = engine;
    this.body = options.body;
    this.massShape = options.massShape;

    this.shapeProperty = new Property( options.shape, {
      valueType: Shape
    } );

    this.userControlledProperty = new BooleanProperty( false, {
      tandem: tandem?.createTandem( 'userControlledProperty' ),
      phetioDocumentation: 'For internal use only',
      phetioReadOnly: true,
      phetioState: false
    } );

    this.inputEnabledProperty = new BooleanProperty( true, combineOptions<BooleanPropertyOptions>( {
      tandem: tandem?.createTandem( 'inputEnabledProperty' ),
      phetioDocumentation: 'Sets whether the element will have input enabled, and hence be interactive',
      phetioFeatured: true
    }, options.inputEnabledPropertyOptions ) );

    this.internalVisibleProperty = new BooleanProperty( options.visible, {
      phetioDocumentation: 'For internal use only',

      // instrumentation is needed for PhET-iO State only, not customizable.
      tandem: tandem.createTandem( 'internalVisibleProperty' ),
      phetioReadOnly: true
    } );

    this.visibleProperty = new GatedVisibleProperty( this.internalVisibleProperty, tandem );

    this.materialProperty = new Property( options.material, combineOptions<PropertyOptions<Material>>( {
      valueType: Material,
      reentrant: true,
      tandem: tandem?.createTandem( 'materialProperty' ),
      phetioValueType: Material.MaterialIO,
      phetioFeatured: true
    }, options.materialPropertyOptions ) );

    this.adjustableMaterial = options.adjustableMaterial;

    if ( options.adjustableMaterial ) {
      this.materialEnumProperty = new EnumerationProperty( materialToEnum( options.material ), {
        tandem: tandem?.createTandem( 'materialEnumProperty' ),
        validValues: options.materialEnumPropertyValidValues,
        phetioFeatured: true,
        phetioDocumentation: 'Current material of the object. Changing the material will result in changes to the mass, but the volume will remain the same.'
      } );
      this.customDensityProperty = new NumberProperty( options.material.density, {
        tandem: tandem?.createTandem( 'customDensityProperty' ),
        phetioFeatured: true,
        phetioDocumentation: 'Density of the objet when the material is set to “CUSTOM”.',
        range: new Range( 150, 23000 ),
        units: 'kg/m^3'
      } );
      this.customColorProperty = new ColorProperty( options.material.customColor ? options.material.customColor.value : Color.WHITE, {
        tandem: options.adjustableColor ? tandem?.createTandem( 'customColorProperty' ) : Tandem.OPT_OUT,
        phetioFeatured: true
      } );

      this.materialProperty.addPhetioStateDependencies( [ this.materialEnumProperty, this.customDensityProperty, this.customColorProperty ] );

      // Hook up phet-io Properties for interoperation with the normal ones
      let enumLock = false;
      let densityLock = false;
      let colorLock = false;
      const colorListener = ( color: Color ) => {
        if ( !colorLock ) {
          colorLock = true;
          this.customColorProperty!.value = color;
          colorLock = false;
        }
      };
      this.materialProperty.link( ( material, oldMaterial ) => {
        if ( !enumLock ) {
          enumLock = true;
          this.materialEnumProperty!.value = materialToEnum( material );
          enumLock = false;
        }
        if ( !densityLock ) {
          densityLock = true;
          this.customDensityProperty!.value = material.density;
          densityLock = false;
        }
        if ( oldMaterial && oldMaterial.customColor ) {
          oldMaterial.customColor.unlink( colorListener );
        }
        if ( material && material.customColor ) {
          material.customColor.link( colorListener );
        }
      } );
      Multilink.lazyMultilink( [ this.materialEnumProperty, this.customDensityProperty, this.customColorProperty ], ( materialEnum, density, color ) => {
        // See if it's an external change
        if ( !enumLock && !densityLock && !colorLock ) {
          enumLock = true;
          densityLock = true;
          colorLock = true;
          if ( materialEnum === MaterialEnumeration.CUSTOM ) {
            const createMaterialOptions: CreateCustomMaterialOptions = {
              density: this.customDensityProperty!.value
            };
            if ( options.adjustableColor ) {
              createMaterialOptions.customColor = this.customColorProperty;
            }
            else {
              createMaterialOptions.densityRange = this.customDensityProperty!.range;
            }

            this.materialProperty.value = Material.createCustomSolidMaterial( createMaterialOptions );
          }
          else {
            assert && assert( Material.hasOwnProperty( materialEnum.name ), `unexpected material enum: ${materialEnum.name}` );
            this.materialProperty.value = Material[ materialEnum.name as MaterialNonCustomIdentifier ];
          }
          enumLock = false;
          densityLock = false;
          colorLock = false;
        }
      } );
    }

    this.volumeProperty = new NumberProperty( options.volume, combineOptions<NumberPropertyOptions>( {
      tandem: tandem?.createTandem( 'volumeProperty' ),
      phetioFeatured: true,
      range: new Range( options.minVolume, options.maxVolume ),
      phetioReadOnly: true,
      phetioDocumentation: 'Current volume of the object. Changing the volume will result in changes to the mass, but will not change the material or density.',
      units: 'm^3',
      reentrant: true
    }, options.volumePropertyOptions ) );

    this.percentSubmergedProperty = new NumberProperty( 0, {
      range: new Range( 0, 100 ),
      units: '%',
      tandem: tandem?.createTandem( 'percentSubmergedProperty' ),
      phetioReadOnly: true
    } );

    this.containedMassProperty = new NumberProperty( 0, {
      range: new Range( 0, Number.POSITIVE_INFINITY ),
      tandem: Tandem.OPT_OUT
    } );

    this.massProperty = new GuardedNumberProperty( this.materialProperty.value.density * this.volumeProperty.value + this.containedMassProperty.value, combineOptions<GuardedNumberPropertyOptions>( {
      tandem: tandem?.createTandem( 'massProperty' ),
      phetioReadOnly: true,
      phetioState: false,
      phetioFeatured: true,
      phetioDocumentation: 'Current mass of the object',
      units: 'kg',
      reentrant: true,
      range: new Range( Number.MIN_VALUE, Number.POSITIVE_INFINITY ),

      getPhetioSpecificValidationError: proposedMass => {

        // density = mass/ volume
        const proposedVolume = proposedMass / this.materialProperty.value.density;
        const isProposedVolumeInRange = this.volumeProperty.range.contains( proposedVolume );

        const maxAllowedMass = this.materialProperty.value.density * this.volumeProperty.range.max;
        const minAllowedMass = this.materialProperty.value.density * this.volumeProperty.range.min;

        return isProposedVolumeInRange ? null :
               `The proposed mass ${proposedMass} kg would result in a volume ${proposedVolume} m^3 that is out of range. At the current density, the allowed range is [${minAllowedMass}, ${maxAllowedMass}] kg.`;
      }
    }, options.massPropertyOptions ) );

    Multilink.multilink( [ this.materialProperty, this.volumeProperty, this.containedMassProperty ], ( material, volume, containedMass ) => {

      const selfMass = Utils.roundToInterval( material.density * volume, DensityBuoyancyCommonConstants.TOLERANCE );
      this.massProperty.value = selfMass + containedMass;

    } );

    this.bodyOffsetProperty = new Vector2Property( Vector2.ZERO, {
      tandem: Tandem.OPT_OUT
    } );

    this.gravityForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem?.createTandem( 'gravityForceInterpolatedProperty' ),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.buoyancyForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem?.createTandem( 'buoyancyForceInterpolatedProperty' ),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.contactForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem?.createTandem( 'contactForceInterpolatedProperty' ),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.contactForceBlendedProperty = new BlendedVector2Property( this.contactForceInterpolatedProperty.value );
    this.stepEmitter.addListener( () => this.contactForceBlendedProperty.step( this.contactForceInterpolatedProperty.value ) );

    this.forceOffsetProperty = new Property( Vector3.ZERO, {
      valueType: Vector3,
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    } );

    this.massLabelOffsetProperty = new Property( Vector3.ZERO, {
      valueType: Vector3,
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    } );

    this.massLabelOffsetOrientationProperty = new Vector2Property( Vector2.ZERO, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    } );

    this.matrix = options.matrix;
    this.stepMatrix = new Matrix3();

    this.transformedEmitter = new Emitter();
    this.interruptedEmitter = new Emitter();

    this.canRotate = options.canRotate;
    this.canMove = options.canMove;
    this.tag = options.tag;

    this.nameProperty = options.tag.nameProperty;
    if ( options.tag !== MassTag.NONE && this.nameProperty instanceof PhetioObject ) {
      this.addLinkedElement( this.nameProperty, {
        tandemName: 'nameProperty'
      } );
    }

    this.accessibleName = options.accessibleName || new DerivedProperty( [ options.tag.nameProperty ],
      ( tagName: string ) => {
        const suffix = tagName !== 'NONE' ? tagName : '';
        return 'Mass ' + suffix;
      } );

    this.containingBasin = null;

    this.originalMatrix = this.matrix.copy();

    Multilink.multilink( [
      this.shapeProperty,
      this.massProperty
    ], () => {
      // Don't allow a fully-zero value for the physics engines
      engine.bodySetMass( this.body, Math.max( this.massProperty.value, 0.01 ), {
        canRotate: options.canRotate
      } );
    } );

    this.writeData();
    this.engine.bodySynchronizePrevious( this.body );
    // TODO: why not call transformedEmitter()? https://github.com/phetsims/density-buoyancy-common/issues/231

    this.stepX = 0; // x-value of the position
    this.stepBottom = 0; // minimum y value of the mass
    this.stepTop = 0; // maximum y value of the mass
  }

  /**
   * Returns the bounds of this mass.
   */
  protected abstract getLocalBounds(): Bounds3;

  /**
   * Get the bounds of this mass in parent coordinates.
   */
  public getBounds(): Bounds3 {
    return this.getLocalBounds().shifted( this.matrix.translation.toVector3() );
  }

  /**
   * Returns the cross-sectional area of this object at a given y level.
   */
  public abstract getDisplacedArea( fluidLevel: number ): number;

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   */
  public abstract getDisplacedVolume( fluidLevel: number ): number;

  /**
   * Returns the fraction of the mass that is submerged in a liquid at a given level. From 0 to 1.
   */
  public updateSubmergedMassFraction( gravityMagnitude: number, fluidDensity: number ): void {
    assert && assert( gravityMagnitude > 0, 'gravityMagnitude should be positive' );

    const buoyancy = this.buoyancyForceInterpolatedProperty.currentValue;
    const volume = this.volumeProperty.value;
    const submergedFraction = 100 * buoyancy.magnitude / ( volume * gravityMagnitude * fluidDensity );
    const range = this.percentSubmergedProperty.range;
    this.percentSubmergedProperty.value = range.constrainValue( submergedFraction );
  }

  /**
   * Sets the current location to be the proper position for the mass when it is reset.
   */
  public setResetLocation(): void {
    this.originalMatrix = this.matrix.copy();
  }

  /**
   * Reads transform/velocity from the physics model engine and set.
   */
  private readData(): void {
    this.engine.bodyGetMatrixTransform( this.body, this.matrix );

    // Apply the body offset
    this.matrix.set02( this.matrix.m02() + this.bodyOffsetProperty.value.x );
    this.matrix.set12( this.matrix.m12() + this.bodyOffsetProperty.value.y );

    this.transformedEmitter.emit();
  }

  /**
   * Writes position/velocity/etc. to the physics model engine.
   */
  public writeData(): void {
    this.engine.bodySetPosition( this.body, this.matrix.translation.minus( this.bodyOffsetProperty.value ) );
    this.engine.bodySetRotation( this.body, this.matrix.rotation );
  }

  /**
   * Starts a physics model engine drag at the given 2d (x,y) model position.
   */
  public startDrag( position: Vector2 ): void {
    assert && assert( !this.userControlledProperty.value, 'cannot start a drag when already userControlled' );
    this.userControlledProperty.value = true;
    this.engine.addPointerConstraint( this.body, position );
  }

  /**
   * Updates a current drag with a new 2d (x,y) model position.
   */
  public updateDrag( position: Vector2 ): void {
    this.engine.updatePointerConstraint( this.body, position );
  }

  /**
   * Ends a physics model engine drag.
   */
  public endDrag(): void {
    if ( this.userControlledProperty.value ) {
      this.engine.removePointerConstraint( this.body );
      this.userControlledProperty.value = false;
    }
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public abstract setRatios( widthRatio: number, heightRatio: number ): void;

  /**
   * Called after the engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop (as those are
   * used for determining basin volumes and cross-sections)
   */
  public updateStepInformation(): void {
    this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

    // Apply the body offset
    this.stepMatrix.set02( this.stepMatrix.m02() + this.bodyOffsetProperty.value.x );
    this.stepMatrix.set12( this.stepMatrix.m12() + this.bodyOffsetProperty.value.y );
  }

  public setPosition( x: number, y: number ): void {
    this.matrix.setToTranslation( x, y );
    this.writeData();
    this.transformedEmitter.emit();
  }

  /**
   * Steps forward in time.
   *
   * @param dt - In seconds
   * @param interpolationRatio
   */
  public step( dt: number, interpolationRatio: number ): void {
    this.readData();

    this.transformedEmitter.emit();

    this.contactForceInterpolatedProperty.setRatio( interpolationRatio );
    this.buoyancyForceInterpolatedProperty.setRatio( interpolationRatio );
    this.gravityForceInterpolatedProperty.setRatio( interpolationRatio );

    this.stepEmitter.emit();
  }

  /**
   * Moves the mass to its initial position
   */
  public resetPosition(): void {
    this.matrix.set( this.originalMatrix );
    this.writeData();
    this.engine.bodySynchronizePrevious( this.body );
    this.transformedEmitter.emit();
  }

  /**
   * Resets things to their original values.
   */
  public reset(): void {
    this.engine.bodyResetHidden( this.body );

    this.internalVisibleProperty.reset();
    this.shapeProperty.reset();
    this.materialProperty.reset();
    this.volumeProperty.reset();
    this.containedMassProperty.reset();
    this.userControlledProperty.reset();

    this.gravityForceInterpolatedProperty.reset();
    this.buoyancyForceInterpolatedProperty.reset();
    this.contactForceInterpolatedProperty.reset();

    // NOTE: NOT resetting bodyOffsetProperty/forceOffsetProperty/massLabelOffsetProperty/massLabelOffsetOrientationProperty on
    // purpose, it will be adjusted by subtypes whenever necessary, and a reset may break things here.

    this.resetPosition();
  }

  /**
   * Releases references
   */
  public override dispose(): void {

    assert && assert( !this.isDisposed );

    this.userControlledProperty.dispose();
    this.inputEnabledProperty.dispose();
    this.materialProperty.dispose();
    this.volumeProperty.dispose();
    this.massProperty.dispose();
    this.gravityForceInterpolatedProperty.dispose();
    this.buoyancyForceInterpolatedProperty.dispose();
    this.contactForceInterpolatedProperty.dispose();
    this.internalVisibleProperty.dispose();
    this.visibleProperty.dispose();
    super.dispose();
  }

  /**
   * Given a list of values and a ratio from 0 (the start) to 1 (the end), return an interpolated value.
   * REVIEW: See if this and other occurrences should use dot piecewise linear functions.
   */
  protected static evaluatePiecewiseLinear( values: number[], ratio: number ): number {
    const logicalIndex = ratio * ( values.length - 1 );
    if ( logicalIndex % 1 === 0 ) {
      return values[ logicalIndex ];
    }
    else {
      const a = values[ Math.floor( logicalIndex ) ];
      const b = values[ Math.ceil( logicalIndex ) ];
      return Utils.linear( Math.floor( logicalIndex ), Math.ceil( logicalIndex ), a, b, logicalIndex );
    }
  }

  public static readonly MassIO = new IOType<Mass, MassIOStateObject>( 'MassIO', {
    valueType: Mass,
    documentation: 'Represents a mass that interacts in the scene, and can potentially float or displace liquid.',
    stateSchema: {
      matrix: Matrix3.Matrix3IO,
      stepMatrix: Matrix3.Matrix3IO,
      originalMatrix: Matrix3.Matrix3IO,
      canRotate: BooleanIO,
      canMove: BooleanIO,
      tag: MassTag.MassTagIO,
      massShape: EnumerationIO( MassShape ),

      // engine.bodyToStateObject
      position: Vector2.Vector2IO,
      velocity: Vector2.Vector2IO,
      force: Vector2.Vector2IO
    },
    toStateObject( mass: Mass ): MassIOStateObject {
      return combineOptions<MassIOStateObject>( {
        matrix: Matrix3.toStateObject( mass.matrix ),
        stepMatrix: Matrix3.toStateObject( mass.stepMatrix ),
        originalMatrix: Matrix3.toStateObject( mass.originalMatrix ),
        canRotate: mass.canRotate,
        canMove: mass.canMove,
        tag: MassTag.MassTagIO.toStateObject( mass.tag ),
        massShape: EnumerationIO( MassShape ).toStateObject( mass.massShape )
      }, mass.engine.bodyToStateObject( mass.body ) );
    },
    applyState( mass: Mass, obj: MassIOStateObject ) {
      mass.matrix.set( Matrix3.fromStateObject( obj.matrix ) );
      mass.stepMatrix.set( Matrix3.fromStateObject( obj.stepMatrix ) );
      mass.originalMatrix.set( Matrix3.fromStateObject( obj.originalMatrix ) );
      mass.canRotate = obj.canRotate;
      mass.canMove = obj.canMove;
      MassTag.MassTagIO.applyState( mass.tag, obj.tag );
      mass.engine.bodyApplyState( mass.body, obj );
      mass.transformedEmitter.emit();
    },
    stateObjectToCreateElementArguments: ( stateObject: MassIOStateObject ) => [ EnumerationIO( MassShape ).fromStateObject( stateObject.massShape ) ]
  } );
}

densityBuoyancyCommon.register( 'Mass', Mass );