// Copyright 2019-2022, University of Colorado Boulder

/**
 * Represents a mass that interacts in the scene, and can potentially float or displace liquid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty, { BooleanPropertyOptions } from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Color, ColorProperty } from '../../../../scenery/js/imports.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Material from './Material.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import PhysicsEngine, { PhysicsEngineBody } from './PhysicsEngine.js';
import Basin from './Basin.js';
import Ray3 from '../../../../dot/js/Ray3.js';

// constants
export class MassTag extends EnumerationValue {
  static PRIMARY = new MassTag();
  static SECONDARY = new MassTag();
  static NONE = new MassTag();
  static ONE_A = new MassTag();
  static ONE_B = new MassTag();
  static ONE_C = new MassTag();
  static ONE_D = new MassTag();
  static ONE_E = new MassTag();
  static TWO_A = new MassTag();
  static TWO_B = new MassTag();
  static TWO_C = new MassTag();
  static TWO_D = new MassTag();
  static TWO_E = new MassTag();
  static THREE_A = new MassTag();
  static THREE_B = new MassTag();
  static THREE_C = new MassTag();
  static THREE_D = new MassTag();
  static THREE_E = new MassTag();
  static A = new MassTag();
  static B = new MassTag();
  static C = new MassTag();
  static D = new MassTag();
  static E = new MassTag();

  static enumeration = new Enumeration( MassTag, {
    phetioDocumentation: 'Label for a mass'
  } );
}

const blockStringMap = {
  [ MassTag.ONE_A.name! ]: densityBuoyancyCommonStrings.massLabel[ '1a' ],
  [ MassTag.ONE_B.name! ]: densityBuoyancyCommonStrings.massLabel[ '1b' ],
  [ MassTag.ONE_C.name! ]: densityBuoyancyCommonStrings.massLabel[ '1c' ],
  [ MassTag.ONE_D.name! ]: densityBuoyancyCommonStrings.massLabel[ '1d' ],
  [ MassTag.ONE_E.name! ]: densityBuoyancyCommonStrings.massLabel[ '1e' ],
  [ MassTag.TWO_A.name! ]: densityBuoyancyCommonStrings.massLabel[ '2a' ],
  [ MassTag.TWO_B.name! ]: densityBuoyancyCommonStrings.massLabel[ '2b' ],
  [ MassTag.TWO_C.name! ]: densityBuoyancyCommonStrings.massLabel[ '2c' ],
  [ MassTag.TWO_D.name! ]: densityBuoyancyCommonStrings.massLabel[ '2d' ],
  [ MassTag.TWO_E.name! ]: densityBuoyancyCommonStrings.massLabel[ '2e' ],
  [ MassTag.THREE_A.name! ]: densityBuoyancyCommonStrings.massLabel[ '3a' ],
  [ MassTag.THREE_B.name! ]: densityBuoyancyCommonStrings.massLabel[ '3b' ],
  [ MassTag.THREE_C.name! ]: densityBuoyancyCommonStrings.massLabel[ '3c' ],
  [ MassTag.THREE_D.name! ]: densityBuoyancyCommonStrings.massLabel[ '3d' ],
  [ MassTag.THREE_E.name! ]: densityBuoyancyCommonStrings.massLabel[ '3e' ],
  [ MassTag.A.name! ]: densityBuoyancyCommonStrings.massLabel.a,
  [ MassTag.B.name! ]: densityBuoyancyCommonStrings.massLabel.b,
  [ MassTag.C.name! ]: densityBuoyancyCommonStrings.massLabel.c,
  [ MassTag.D.name! ]: densityBuoyancyCommonStrings.massLabel.d,
  [ MassTag.E.name! ]: densityBuoyancyCommonStrings.massLabel.e
};

class MaterialEnumeration extends EnumerationValue {
  static ALUMINUM = new MaterialEnumeration();
  static BRICK = new MaterialEnumeration();
  static COPPER = new MaterialEnumeration();
  static ICE = new MaterialEnumeration();
  static PLATINUM = new MaterialEnumeration();
  static STEEL = new MaterialEnumeration();
  static STYROFOAM = new MaterialEnumeration();
  static WOOD = new MaterialEnumeration();
  static CUSTOM = new MaterialEnumeration();

  static enumeration = new Enumeration( MaterialEnumeration, {
    phetioDocumentation: 'Material values'
  } );
}
type MaterialNonCustomIdentifier = 'ALUMINUM' | 'BRICK' | 'COPPER' | 'ICE' | 'PLATINUM' | 'STEEL' | 'STYROFOAM' | 'WOOD';
type MaterialIdentifier = MaterialNonCustomIdentifier | 'CUSTOM';

const materialToEnum = ( material: Material ): MaterialEnumeration => MaterialEnumeration[ ( ( material.identifier as MaterialIdentifier | null ) || 'CUSTOM' ) ];

type SelfOptions = {
  // Required
  body: PhysicsEngineBody;
  shape: Shape;
  material: Material;
  volume: number;

  visible?: boolean;
  matrix?: Matrix3;
  canRotate?: boolean;
  canMove?: boolean;
  adjustableMaterial?: boolean;
  tag?: MassTag;
  tandem?: Tandem;
  phetioType?: IOType;
  inputEnabledPropertyOptions?: BooleanPropertyOptions;
  materialPropertyOptions?: PropertyOptions<Material>;
  volumePropertyOptions?: NumberPropertyOptions;
  massPropertyOptions?: NumberPropertyOptions;
};

export type MassOptions = SelfOptions & PhetioObjectOptions;
export type InstrumentedMassOptions = MassOptions & { tandem: Tandem };

export default abstract class Mass extends PhetioObject {

  engine: PhysicsEngine;
  body: PhysicsEngineBody;

  // Without the matrix applied (effectively in "local" model coordinates)
  shapeProperty: Property<Shape>;

  userControlledProperty: Property<boolean>;
  inputEnabledProperty: Property<boolean>;
  visibleProperty: Property<boolean>;
  internalVisibleProperty: Property<boolean>;

  // Here just for instrumentation, see https://github.com/phetsims/density/issues/112
  // This can only hide it, but won't make it visible.
  studioVisibleProperty: Property<boolean>;

  materialProperty: Property<Material>;

  // for phet-io support (to control the materialProperty)
  materialEnumProperty?: Property<MaterialEnumeration>;

  // for phet-io support (to control the materialProperty)
  customDensityProperty?: Property<number>;

  // for phet-io support (to control the materialProperty)
  customColorProperty?: Property<Color>;

  // Whether we are modifying the volumeProperty directly
  protected volumeLock: boolean;

  // Whether we are modifying the massProperty directly
  protected massLock: boolean;

  // In m^3 (cubic meters)
  volumeProperty: Property<number>;

  // In kg (kilograms), added to the normal mass (computed from density and volume)
  containedMassProperty: Property<number>;

  // (read-only) In kg (kilograms) - written to by other processes
  massProperty: Property<number>;

  // The following offset will be added onto the body's position to determine ours.
  bodyOffsetProperty: Property<Vector2>;

  gravityForceInterpolatedProperty: InterpolatedProperty<Vector2>;
  buoyancyForceInterpolatedProperty: InterpolatedProperty<Vector2>;
  contactForceInterpolatedProperty: InterpolatedProperty<Vector2>;

  forceOffsetProperty: Property<Vector3>;

  // The 3D offset from the center-of-mass where the mass-label should be shown from.
  // The mass label will use this position (plus the masses' position) to determine a view point, then will use the
  // massOffsetOrientationProperty to position based on that point.
  massOffsetProperty: Property<Vector3>;

  // Orientation multiplied by 1/2 width,height for an offset in view space
  massOffsetOrientationProperty: Property<Vector2>;

  // Transform matrix set before/after the physics engine steps, to be used to adjust/read the mass's position/transform.
  matrix: Matrix3;

  // Transform matrix set in the internal physics engine steps, used by masses to determine their per-step information.
  stepMatrix: Matrix3;

  transformedEmitter: Emitter<[]>;

  // Fired when this mass's input (drag) should be interrupted.
  interruptedEmitter: Emitter<[]>;

  canRotate: boolean;
  canMove: boolean;
  tag: MassTag;

  nameProperty: Property<string>;

  // Set by the model
  containingBasin: Basin | null;

  originalMatrix: Matrix3;

  // Required internal-physics-step properties that should be set by subtypes in
  // updateStepInformation(). There may exist more set by the subtype (that will be used for e.g. volume/area
  // calculations). These are updated more often than simulation steps. These specific values will be used by external
  // code for determining liquid height.
  stepX: number; // x-value of the position
  stepBottom: number; // minimum y value of the mass
  stepTop: number; // maximum y value of the mass

  constructor( engine: PhysicsEngine, providedConfig: MassOptions ) {

    const config = optionize<MassOptions, SelfOptions, PhetioObjectOptions>( {
      visible: true,
      matrix: new Matrix3(),
      canRotate: false,
      canMove: true,
      adjustableMaterial: false,
      tag: MassTag.NONE,
      tandem: Tandem.OPTIONAL,
      phetioType: Mass.MassIO,
      inputEnabledPropertyOptions: {},
      materialPropertyOptions: {},
      volumePropertyOptions: {},
      massPropertyOptions: {}
    }, providedConfig );

    assert && assert( config.body, 'config.body required' );
    assert && assert( config.shape instanceof Shape, 'config.shape required as a Shape' );
    assert && assert( config.material instanceof Material, 'config.material required as a Material' );
    assert && assert( config.volume > 0, 'non-zero config.volume required' );

    super( config );

    const tandem = config.tandem;

    this.engine = engine;
    this.body = config.body;

    this.shapeProperty = new Property( config.shape, {
      valueType: Shape
    } );

    this.userControlledProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'userControlledProperty' ),
      phetioReadOnly: true
    } );

    this.inputEnabledProperty = new BooleanProperty( true, merge( {
      tandem: tandem.createTandem( 'inputEnabledProperty' ),
      phetioDocumentation: 'Sets whether the element will have input enabled, and hence be interactive'
    }, config.inputEnabledPropertyOptions ) );

    this.internalVisibleProperty = new BooleanProperty( config.visible, {
      tandem: Tandem.OPT_OUT
    } );

    this.studioVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'visibleProperty' )
    } );

    this.visibleProperty = DerivedProperty.and( [ this.internalVisibleProperty, this.studioVisibleProperty ], {
      tandem: Tandem.OPT_OUT
    } );

    this.materialProperty = new Property( config.material, merge( {
      valueType: Material,
      reentrant: true,
      tandem: tandem.createTandem( 'materialProperty' ),
      phetioType: Property.PropertyIO( Material.MaterialIO )
    }, config.materialPropertyOptions ) );

    if ( config.adjustableMaterial ) {
      this.materialEnumProperty = new EnumerationProperty( materialToEnum( config.material ), {
        tandem: tandem.createTandem( 'materialEnumProperty' ),
        phetioDocumentation: 'Current material of the block. Changing the material will result in changes to the mass, but the volume will remain the same.'
      } );
      this.customDensityProperty = new NumberProperty( config.material.density, {
        tandem: tandem.createTandem( 'customDensityProperty' ),
        phetioDocumentation: 'Density of the block when the material is set to “CUSTOM”.',
        range: new Range( Number.MIN_VALUE, Number.POSITIVE_INFINITY )
      } );
      this.customColorProperty = new ColorProperty( config.material.customColor ? config.material.customColor.value : Color.WHITE, {
        tandem: tandem.createTandem( 'customColorProperty' )
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
      Property.lazyMultilink<[ MaterialEnumeration, number, Color ]>( [ this.materialEnumProperty, this.customDensityProperty, this.customColorProperty ], ( materialEnum, density, color ) => {
        // See if it's an external change
        if ( !enumLock && !densityLock && !colorLock ) {
          enumLock = true;
          densityLock = true;
          colorLock = true;
          if ( materialEnum === MaterialEnumeration.CUSTOM ) {
            this.materialProperty.value = Material.createCustomSolidMaterial( {
              density: this.customDensityProperty!.value,
              customColor: this.customColorProperty
            } );
          }
          else {
            this.materialProperty.value = Material[ materialEnum.name as MaterialNonCustomIdentifier ];
          }
          enumLock = false;
          densityLock = false;
          colorLock = false;
        }
      } );
    }

    this.volumeLock = false;

    this.volumeProperty = new NumberProperty( config.volume, merge( {
      tandem: tandem.createTandem( 'volumeProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY ),
      phetioReadOnly: true,
      phetioDocumentation: 'Current volume of the block. Changing the volume will result in changes to the mass, but will not change the material or density.',
      units: 'm^3',
      reentrant: true
    }, config.volumePropertyOptions ) );

    this.containedMassProperty = new NumberProperty( 0, {
      range: new Range( 0, Number.POSITIVE_INFINITY ),
      tandem: Tandem.OPT_OUT
    } );

    this.massLock = false;

    this.massProperty = new NumberProperty( this.materialProperty.value.density * this.volumeProperty.value + this.containedMassProperty.value, merge( {
      tandem: tandem.createTandem( 'massProperty' ),
      phetioReadOnly: true,
      phetioState: false,
      phetioDocumentation: 'Current mass of the block. Changing the mass will result in changes to the material (and therefore density), but the volume will remain the same.',
      units: 'kg',
      reentrant: true,
      range: new Range( Number.MIN_VALUE, Number.POSITIVE_INFINITY )
    }, config.massPropertyOptions ) );

    Property.multilink<[Material, number, number]>( [ this.materialProperty, this.volumeProperty, this.containedMassProperty ], ( material, volume, containedMass ) => {
      this.massLock = true;
      this.massProperty.value = material.density * volume + containedMass;
      this.massLock = false;
    } );

    this.bodyOffsetProperty = new Vector2Property( Vector2.ZERO, {
      tandem: Tandem.OPT_OUT
    } );

    this.gravityForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true,
      tandem: tandem.createTandem( 'gravityForceInterpolatedProperty' ),
      phetioType: InterpolatedProperty.InterpolatedPropertyIO( Vector2.Vector2IO ),
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.buoyancyForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true,
      tandem: tandem.createTandem( 'buoyancyForceInterpolatedProperty' ),
      phetioType: InterpolatedProperty.InterpolatedPropertyIO( Vector2.Vector2IO ),
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.contactForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true,
      tandem: tandem.createTandem( 'contactForceInterpolatedProperty' ),
      phetioType: InterpolatedProperty.InterpolatedPropertyIO( Vector2.Vector2IO ),
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.forceOffsetProperty = new Property( Vector3.ZERO, {
      valueType: Vector3,
      useDeepEquality: true,
      tandem: Tandem.OPT_OUT
    } );

    this.massOffsetProperty = new Property( Vector3.ZERO, {
      valueType: Vector3,
      useDeepEquality: true,
      tandem: Tandem.OPT_OUT
    } );

    this.massOffsetOrientationProperty = new Vector2Property( Vector2.ZERO, {
      useDeepEquality: true,
      tandem: Tandem.OPT_OUT
    } );

    this.matrix = config.matrix;
    this.stepMatrix = new Matrix3();

    this.transformedEmitter = new Emitter();
    this.interruptedEmitter = new Emitter();

    this.canRotate = config.canRotate;
    this.canMove = config.canMove;
    this.tag = config.tag;

    this.nameProperty = new StringProperty( blockStringMap[ config.tag.name! ] || '', {
      tandem: config.tandem.createTandem( 'nameProperty' )
    } );

    this.containingBasin = null;

    this.originalMatrix = this.matrix.copy();

    Property.multilink<[Shape, number]>( [
      this.shapeProperty,
      this.massProperty
    ], () => {
      // Don't allow a fully-zero value for the physics engines
      engine.bodySetMass( this.body, Math.max( this.massProperty.value, 0.01 ), {
        canRotate: config.canRotate
      } );
    } );

    this.writeData();
    this.engine.bodySynchronizePrevious( this.body );

    // @public (read-only) {number} - Required internal-physics-step properties that should be set by subtypes in
    // updateStepInformation(). There may exist more set by the subtype (that will be used for e.g. volume/area
    // calculations). These are updated more often than simulation steps. These specific values will be used by external
    // code for determining liquid height.
    this.stepX = 0; // x-value of the position
    this.stepBottom = 0; // minimum y value of the mass
    this.stepTop = 0; // maxmimum y value of the mass
  }

  /**
   * Returns whether this is a boat (as more complicated handling is needed in this case).
   */
  isBoat(): boolean {
    return false;
  }

  /**
   * Returns the cross-sectional area of this object at a given y level.
   */
  abstract getDisplacedArea( liquidLevel: number ): number;

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   */
  abstract getDisplacedVolume( liquidLevel: number ): number;

  /**
   * Sets the current location to be the proper position for the mass when it is reset.
   */
  setResetLocation() {
    this.originalMatrix = this.matrix.copy();
  }

  /**
   * Reads transform/velocity from the physics model engine.
   */
  private readData() {
    this.engine.bodyGetMatrixTransform( this.body, this.matrix );

    // Apply the body offset
    this.matrix.set02( this.matrix.m02() + this.bodyOffsetProperty.value.x );
    this.matrix.set12( this.matrix.m12() + this.bodyOffsetProperty.value.y );

    this.transformedEmitter.emit();
  }

  /**
   * Writes position/velocity/etc. to the physics model engine.
   */
  writeData() {
    this.engine.bodySetPosition( this.body, this.matrix.translation.minus( this.bodyOffsetProperty.value ) );
    this.engine.bodySetRotation( this.body, this.matrix.rotation );
  }

  /**
   * Starts a physics model engine drag at the given 2d (x,y) model position.
   */
  startDrag( position: Vector2 ) {
    this.userControlledProperty.value = true;
    this.engine.addPointerConstraint( this.body, position );
  }

  /**
   * Updates a current drag with a new 2d (x,y) model position.
   */
  updateDrag( position: Vector2 ) {
    this.engine.updatePointerConstraint( this.body, position );
  }

  /**
   * Ends a physics model engine drag.
   */
  endDrag() {
    this.engine.removePointerConstraint( this.body );
    this.userControlledProperty.value = false;
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  abstract setRatios( widthRatio: number, heightRatio: number ): void;

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop (as those are
   * used for determining basin volumes and cross sections)
   */
  updateStepInformation() {
    this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

    // Apply the body offset
    this.stepMatrix.set02( this.stepMatrix.m02() + this.bodyOffsetProperty.value.x );
    this.stepMatrix.set12( this.stepMatrix.m12() + this.bodyOffsetProperty.value.y );
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  intersect( ray: Ray3, isTouch: boolean ): number | null {
    // TODO: should this be abstract
    return null;
  }

  /**
   * Steps forward in time.
   *
   * @param dt - In seconds
   * @param interpolationRatio
   */
  step( dt: number, interpolationRatio: number ) {
    this.readData();

    this.transformedEmitter.emit();

    this.contactForceInterpolatedProperty.setRatio( interpolationRatio );
    this.buoyancyForceInterpolatedProperty.setRatio( interpolationRatio );
    this.gravityForceInterpolatedProperty.setRatio( interpolationRatio );
  }

  /**
   * Moves the mass to its initial position
   */
  resetPosition() {
    this.matrix.set( this.originalMatrix );
    this.writeData();
    this.engine.bodySynchronizePrevious( this.body );
    this.transformedEmitter.emit();
  }

  /**
   * Resets things to their original values.
   */
  reset() {
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

    // NOTE: NOT resetting bodyOffsetProperty/forceOffsetProperty/massOffsetProperty/massOffsetOrientationProperty on
    // purpose, it will be adjusted by subtypes whenever necessary, and a reset may break things here.

    this.resetPosition();
  }

  /**
   * Releases references
   */
  override dispose() {

    assert && assert( !this.isDisposed );

    this.userControlledProperty.dispose();
    this.inputEnabledProperty.dispose();
    this.studioVisibleProperty.dispose();
    this.materialProperty.dispose();
    this.volumeProperty.dispose();
    this.massProperty.dispose();
    this.nameProperty.dispose();
    this.gravityForceInterpolatedProperty.dispose();
    this.buoyancyForceInterpolatedProperty.dispose();
    this.contactForceInterpolatedProperty.dispose();

    super.dispose();
  }

  /**
   * Given a list of values and a ratio from 0 (the start) to 1 (the end), return an interpolated value.
   */
  static evaluatePiecewiseLinear( values: number[], ratio: number ): number {
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

  static MassIO: IOType;
}

// @public (read-only) {IOType}
Mass.MassIO = new IOType( 'MassIO', {
  valueType: Mass,
  documentation: 'Represents a mass that interacts in the scene, and can potentially float or displace liquid.',
  stateSchema: {
    matrix: Matrix3.Matrix3IO,
    stepMatrix: Matrix3.Matrix3IO,
    originalMatrix: Matrix3.Matrix3IO,
    canRotate: BooleanIO,
    canMove: BooleanIO,
    tag: EnumerationIO( MassTag ),

    // engine.bodyToStateObject
    position: Vector2.Vector2IO,
    velocity: Vector2.Vector2IO,
    force: Vector2.Vector2IO
  },
  toStateObject( mass: Mass ) {
    return merge( {
      matrix: Matrix3.toStateObject( mass.matrix ),
      stepMatrix: Matrix3.toStateObject( mass.stepMatrix ),
      originalMatrix: Matrix3.toStateObject( mass.originalMatrix ),
      canRotate: BooleanIO.toStateObject( mass.canRotate ),
      canMove: BooleanIO.toStateObject( mass.canMove ),
      tag: EnumerationIO( MassTag ).toStateObject( mass.tag )
    }, mass.engine.bodyToStateObject( mass.body ) );
  },
  applyState( mass: Mass, obj: any ) {
    mass.matrix.set( Matrix3.fromStateObject( obj.matrix ) );
    mass.stepMatrix.set( Matrix3.fromStateObject( obj.stepMatrix ) );
    mass.originalMatrix.set( Matrix3.fromStateObject( obj.originalMatrix ) );
    mass.canRotate = BooleanIO.fromStateObject( obj.canRotate );
    mass.canMove = BooleanIO.fromStateObject( obj.canMove );
    mass.tag = EnumerationIO( MassTag ).fromStateObject( obj.tag );
    mass.engine.bodyApplyState( mass.body, obj );
    mass.transformedEmitter.emit();
  }
} );

densityBuoyancyCommon.register( 'Mass', Mass );
