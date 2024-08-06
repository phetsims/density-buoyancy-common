// Copyright 2019-2024, University of Colorado Boulder

/**
 * Represents a mass that interacts in the scene, and can potentially float or displace fluid.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import BooleanProperty, { BooleanPropertyOptions } from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3, { Matrix3StateObject } from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2, { Vector2StateObject } from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { GatedVisibleProperty, PDOMValueType } from '../../../../scenery/js/imports.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Material, { CustomSolidMaterial, MaterialOptions } from './Material.js';
import PhysicsEngine, { PhysicsEngineBody } from './PhysicsEngine.js';
import Basin from './Basin.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { MassShape } from './MassShape.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import MassTag from './MassTag.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import BlendedVector2Property from './BlendedVector2Property.js';
import { GuardedNumberProperty, GuardedNumberPropertyOptions } from './GuardedNumberProperty.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import MaterialProperty, { MaterialPropertyOptions } from './MaterialProperty.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';

// For the Buoyancy Shapes screen, but needed here because setRatios is included in each core type
// See https://github.com/phetsims/buoyancy/issues/29
export const MASS_MIN_SHAPES_DIMENSION = 0.1; // 10cm => 1L square
export const MASS_MAX_SHAPES_DIMENSION = Math.pow( 0.01, 1 / 3 ); // 10L square

export type MaterialSchema = Material | 'CUSTOM'; // We pass 'CUSTOM' so materialProperty can create the customMaterial

type SelfOptions = {

  // Required
  body: PhysicsEngineBody;
  shape: Shape;

  material: MaterialSchema;
  availableMassMaterials: MaterialSchema[];
  volume: number;
  massShape: MassShape;

  visible?: boolean;
  matrix?: Matrix3;
  canMove?: boolean;

  tag?: MassTag;
  accessibleName?: PDOMValueType | null;
  inputEnabledPropertyOptions?: BooleanPropertyOptions;
  materialPropertyOptions?: Partial<MaterialPropertyOptions>;
  customMaterialOptions?: MaterialOptions;
  volumePropertyOptions?: NumberPropertyOptions;
  massPropertyOptions?: NumberPropertyOptions;

  minVolume?: number;
  maxVolume?: number;
};

export type MassOptions = SelfOptions & PhetioObjectOptions;
export type InstrumentedMassOptions = MassOptions & PickRequired<MassOptions, 'tandem'>;

export type MassIOStateObject = {
  matrix: Matrix3StateObject;
  stepMatrix: Matrix3StateObject;
  originalMatrix: Matrix3StateObject;
  position: Vector2StateObject;
  velocity: Vector2StateObject;
  force: Vector2StateObject;
};

export default abstract class Mass extends PhetioObject {

  protected readonly engine: PhysicsEngine;
  public readonly body: PhysicsEngineBody;

  // Without the matrix applied (effectively in "local" model coordinates)
  public readonly shapeProperty: Property<Shape>;

  public readonly userControlledProperty: Property<boolean>;
  public readonly inputEnabledProperty: Property<boolean>;

  // This property is like a model value, indicating whether it should be shown
  public readonly internalVisibleProperty: Property<boolean>;

  // There is a gated visibility property that is accessible to PhET-iO. Combined with the above internalVisibleProperty
  // it yields this overall visibleProperty which is respected in the view.
  public readonly visibleProperty: TReadOnlyProperty<boolean>;

  public readonly materialProperty: MaterialProperty;

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

  public readonly canMove: boolean;
  public readonly tag: MassTag;

  public readonly nameProperty: TReadOnlyProperty<string>;

  public readonly accessibleName: PDOMValueType;

  // Set by the model
  public containingBasin: Basin | null;

  private originalMatrix: Matrix3;

  // Required internal-physics-step properties that should be set by subtypes in
  // updateStepInformation(). There may exist more set by the subtype (that will be used for e.g. volume/area
  // calculations). These are updated more often than simulation steps. These specific values will be used by external
  // code for determining fluid height.
  public stepX: number; // x-value of the position
  public stepBottom: number; // minimum y value of the mass
  public stepTop: number; // maximum y value of the mass

  protected constructor( engine: PhysicsEngine, providedOptions: MassOptions ) {

    const options = optionize<MassOptions, SelfOptions, PhetioObjectOptions>()( {
      visible: true,
      matrix: new Matrix3(),
      canMove: true,
      tag: MassTag.NONE,
      accessibleName: null,
      phetioType: Mass.MassIO,
      inputEnabledPropertyOptions: {},
      materialPropertyOptions: {
        reentrant: true
      },
      customMaterialOptions: {},
      volumePropertyOptions: {},
      massPropertyOptions: {},
      minVolume: 0,
      maxVolume: Number.POSITIVE_INFINITY
    }, providedOptions );

    assert && assert( options.body, 'options.body required' );
    assert && assert( options.volume > 0, 'non-zero options.volume required' );

    super( options );

    this.engine = engine;
    this.body = options.body;

    this.shapeProperty = new Property( options.shape, {
      valueType: Shape
    } );

    const tandem = options.tandem;
    this.userControlledProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'userControlledProperty' ),
      phetioDocumentation: 'For internal use only',
      phetioReadOnly: true,
      phetioState: false
    } );

    this.inputEnabledProperty = new BooleanProperty( options.canMove, combineOptions<BooleanPropertyOptions>( {
      tandem: options.canMove ? tandem.createTandem( 'inputEnabledProperty' ) : Tandem.OPT_OUT,
      phetioDocumentation: 'Sets whether the element will have input enabled, and hence be interactive',
      phetioFeatured: true
    }, options.inputEnabledPropertyOptions ) );

    // This Property is determined by the model, such as "is the boat scene selected" or "has the user selected the 2nd block"
    // It does not need to be independently phet-io instrumented because the upstream Property (like selected scene)
    // is instrumented.
    this.internalVisibleProperty = new BooleanProperty( options.visible );

    // Provide additional control for PhET-iO studio users to hide/show the mass, independently of whether the model wants to show it
    this.visibleProperty = new GatedVisibleProperty( this.internalVisibleProperty, tandem );

    options.materialPropertyOptions.tandem = options.materialPropertyOptions.tandem || tandem.createTandem( 'materialProperty' );
    const customSolidMaterial = new CustomSolidMaterial(
      options.availableMassMaterials.includes( 'CUSTOM' ) ? options.materialPropertyOptions.tandem.createTandem( 'customMaterial' ) : Tandem.OPT_OUT,
      combineOptions<MaterialOptions>( {
        density: options.material === 'CUSTOM' ? undefined : options.material.density // The undefined makes sure we don't override the default
      }, options.customMaterialOptions ) );

    const initialMaterial = options.material === 'CUSTOM' ? customSolidMaterial : options.material;
    let availableMaterials = options.availableMassMaterials.map( x => x === 'CUSTOM' ? customSolidMaterial : x );

    // If there is at least one hidden item, add all other other hidden items that we didn't already have
    if ( _.some( availableMaterials, material => material.hidden ) ) {

      const visibleHiddenMaterials = availableMaterials.filter( x => x.hidden );
      const invisibleHiddenMaterials = Material.ALL_MYSTERY_SOLID_MATERIALS.filter( x => !visibleHiddenMaterials.includes( x ) );

      availableMaterials = availableMaterials.filter( x => !x.hidden );
      availableMaterials.push( ...Material.ALL_MYSTERY_SOLID_MATERIALS );

      options.materialPropertyOptions.invisibleMaterials = invisibleHiddenMaterials;
    }
    this.materialProperty = new MaterialProperty( initialMaterial, customSolidMaterial,
      availableMaterials,
      options.materialPropertyOptions as MaterialPropertyOptions );

    this.volumeProperty = new NumberProperty( options.volume, combineOptions<NumberPropertyOptions>( {
      tandem: tandem.createTandem( 'volumeProperty' ),
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
      tandem: tandem.createTandem( 'percentSubmergedProperty' ),
      phetioReadOnly: true
    } );

    this.containedMassProperty = new NumberProperty( 0, {
      range: new Range( 0, Number.POSITIVE_INFINITY ),
      tandem: Tandem.OPT_OUT
    } );

    this.massProperty = new GuardedNumberProperty( this.materialProperty.value.density * this.volumeProperty.value + this.containedMassProperty.value, combineOptions<GuardedNumberPropertyOptions>( {
      tandem: tandem.createTandem( 'massProperty' ),
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

    // TODO: It looks like massProperty behaves like a DerivedProperty, can it be implemented like one? If not, please document, see https://github.com/phetsims/density-buoyancy-common/issues/317
    Multilink.multilink( [
      this.materialProperty.densityProperty,
      this.volumeProperty,
      this.containedMassProperty
    ], ( density, volume, containedMass ) => {
      const selfMass = Utils.roundToInterval( density * volume, DensityBuoyancyCommonConstants.TOLERANCE );
      this.massProperty.value = selfMass + containedMass;
    } );

    this.bodyOffsetProperty = new Vector2Property( Vector2.ZERO, {
      tandem: Tandem.OPT_OUT
    } );

    this.gravityForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem( 'gravityForceInterpolatedProperty' ),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.buoyancyForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem( 'buoyancyForceInterpolatedProperty' ),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.contactForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem( 'contactForceInterpolatedProperty' ),
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
      PhysicsEngine.bodySetMass( this.body, Math.max( this.massProperty.value, 0.01 ) );
    } );


    PhysicsEngine.bodySynchronizePrevious( this.body );

    this.stepX = 0; // x-value of the position
    this.stepBottom = 0; // minimum y value of the mass
    this.stepTop = 0; // maximum y value of the mass

    this.writeData();
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
   * Returns the fraction of the mass that is submerged in a fluid at a given level. From 0 to 1.
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
    PhysicsEngine.bodyGetMatrixTransform( this.body, this.matrix );

    // Apply the body offset
    this.matrix.set02( this.matrix.m02() + this.bodyOffsetProperty.value.x );
    this.matrix.set12( this.matrix.m12() + this.bodyOffsetProperty.value.y );

    this.transformedEmitter.emit();
  }

  /**
   * Writes position/velocity/etc. to the physics model engine.
   */
  public writeData(): void {
    PhysicsEngine.bodySetPosition( this.body, this.matrix.translation.minus( this.bodyOffsetProperty.value ) );
    PhysicsEngine.bodySetRotation( this.body, this.matrix.rotation );

    this.transformedEmitter.emit();
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
    PhysicsEngine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

    // Apply the body offset
    this.stepMatrix.set02( this.stepMatrix.m02() + this.bodyOffsetProperty.value.x );
    this.stepMatrix.set12( this.stepMatrix.m12() + this.bodyOffsetProperty.value.y );
  }

  public setPosition( x: number, y: number ): void {
    this.matrix.setToTranslation( x, y );
    this.writeData();
  }

  /**
   * Steps forward in time.
   */
  public step( dt: number, interpolationRatio: number ): void {
    this.readData();

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
    PhysicsEngine.bodySynchronizePrevious( this.body );
  }

  /**
   * Resets things to their original values.
   */
  public reset(): void {
    PhysicsEngine.bodyResetHidden( this.body );

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
   * TODO: See if this and other occurrences should use dot piecewise linear functions, see https://github.com/phetsims/density-buoyancy-common/issues/317
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
    documentation: 'Represents a mass that interacts in the scene, and can potentially float or displace fluid.',
    stateSchema: {
      matrix: Matrix3.Matrix3IO,
      stepMatrix: Matrix3.Matrix3IO,
      originalMatrix: Matrix3.Matrix3IO,
      position: Vector2.Vector2IO,
      velocity: Vector2.Vector2IO,
      force: Vector2.Vector2IO
    },
    toStateObject( mass: Mass ): MassIOStateObject {
      return combineOptions<MassIOStateObject>( {
        matrix: Matrix3.toStateObject( mass.matrix ),
        stepMatrix: Matrix3.toStateObject( mass.stepMatrix ),
        originalMatrix: Matrix3.toStateObject( mass.originalMatrix ),

        // Applies SIZE_SCALE
        position: PhysicsEngine.p2ToVector( mass.body.position ).toStateObject(),
        velocity: PhysicsEngine.p2ToVector( mass.body.velocity ).toStateObject(),
        force: PhysicsEngine.p2ToVector( mass.body.force ).toStateObject() // we applied forces after the step
      } );
    },
    applyState( mass: Mass, stateObject: MassIOStateObject ) {

      // Some of the following attributes are not public, but are settable since this IOType is declared as a static
      // class member. This is preferable to making the attributes public everywhere.
      const SIZE_SCALE = DensityBuoyancyCommonQueryParameters.p2SizeScale;

      mass.matrix.set( Matrix3.fromStateObject( stateObject.matrix ) );
      mass.stepMatrix.set( Matrix3.fromStateObject( stateObject.stepMatrix ) );
      mass.originalMatrix.set( Matrix3.fromStateObject( stateObject.originalMatrix ) );

      // We will ignore infinities
      mass.body.position[ 0 ] = stateObject.position.x * SIZE_SCALE;
      mass.body.position[ 1 ] = stateObject.position.y * SIZE_SCALE;

      mass.body.velocity[ 0 ] = stateObject.velocity.x * SIZE_SCALE;
      mass.body.velocity[ 1 ] = stateObject.velocity.y * SIZE_SCALE;

      mass.body.force[ 0 ] = stateObject.force.x * SIZE_SCALE;
      mass.body.force[ 1 ] = stateObject.force.y * SIZE_SCALE;

      PhysicsEngine.bodySynchronizePrevious( mass.body );

      mass.writeData();
    }
  } );
}

densityBuoyancyCommon.register( 'Mass', Mass );