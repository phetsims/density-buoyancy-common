// Copyright 2019-2021, University of Colorado Boulder

/**
 * Represents a mass that interacts in the scene, and can potentially float or displace liquid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Shape from '../../../../kite/js/Shape.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationIO from '../../../../phet-core/js/EnumerationIO.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Material from './Material.js';

// constants
const MassTag = Enumeration.byKeys( [
  'PRIMARY',
  'SECONDARY',
  'NONE',
  'ONE_A',
  'ONE_B',
  'ONE_C',
  'ONE_D',
  'ONE_E',
  'TWO_A',
  'TWO_B',
  'TWO_C',
  'TWO_D',
  'TWO_E',
  'THREE_A',
  'THREE_B',
  'THREE_C',
  'THREE_D',
  'THREE_E',
  'A',
  'B',
  'C',
  'D',
  'E'
] );

class Mass extends PhetioObject {
  /**
   * @param {PhysicsEngine} engine
   * @param {Object} config
   */
  constructor( engine, config ) {

    config = merge( {
      // {PhysicsEngine.Body} - required
      body: null,

      // {Shape} - required
      shape: null,

      // {Material} - required
      material: null,

      // {number} - required
      volume: 0,

      // {boolean} - optional
      visible: true,

      // {Matrix3} - optional
      matrix: new Matrix3(),

      // {boolean} - optional
      canRotate: false,

      // {boolean} - optional
      canMove: true,

      // {MassTag} - optional
      tag: MassTag.NONE,

      // {Tandem} - optional
      tandem: Tandem.OPTIONAL,

      // {IOType} - optional
      phetioType: Mass.MassIO,

      // optional
      inputEnabledPropertyOptions: {},
      materialPropertyOptions: {}
    }, config );

    assert && assert( config.body, 'config.body required' );
    assert && assert( config.shape instanceof Shape, 'config.shape required as a Shape' );
    assert && assert( config.material instanceof Material, 'config.material required as a Material' );
    assert && assert( config.volume > 0, 'non-zero config.volume required' );

    super( config );

    const tandem = config.tandem;

    // @public {PhysicsEngine}
    this.engine = engine;

    // @public {PhysicsEngine.Body}
    this.body = config.body;

    // @public {Property.<Shape>} - Without the matrix applied (effectively in "local" model coordinates)
    this.shapeProperty = new Property( config.shape, {
      valueType: Shape
    } );

    // @public {Property.<boolean>}
    this.userControlledProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'userControlledProperty' ),
      phetioReadOnly: true
    } );

    // @public {Property.<boolean>}
    this.inputEnabledProperty = new BooleanProperty( true, merge( {
      tandem: tandem.createTandem( 'inputEnabledProperty' ),
      phetioDocumenation: 'Sets whether the element will have input enabled, and hence be interactive'
    }, config.inputEnabledPropertyOptions ) );

    // @public {Property.<boolean>}
    this.visibleProperty = new BooleanProperty( config.visible, {
      tandem: tandem.createTandem( 'visibleProperty' )
    } );

    // @public {Property.<Material>}
    this.materialProperty = new Property( config.material, merge( {
      valueType: Material,
      reentrant: true,
      tandem: tandem.createTandem( 'materialProperty' ),
      phetioType: Property.PropertyIO( Material.MaterialIO )
    }, config.materialPropertyOptions ) );

    // @public {Property.<number>} - In m^3 (cubic meters)
    this.volumeProperty = new NumberProperty( config.volume, {
      tandem: tandem.createTandem( 'volumeProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY ),
      phetioReadOnly: true,
      units: 'm^3'
    } );

    // @public {Property.<number>} - In kg (kilograms), added to the normal mass (computed from density and volume)
    this.containedMassProperty = new NumberProperty( 0, {
      range: new Range( 0, Number.POSITIVE_INFINITY ),
      tandem: Tandem.OPT_OUT
    } );

    // @public (read-only) {Property.<number>} - In kg (kilograms)
    this.massProperty = new DerivedProperty( [ this.materialProperty, this.volumeProperty, this.containedMassProperty ], ( material, volume, containedMass ) => {
      return material.density * volume + containedMass;
    }, {
      tandem: tandem.createTandem( 'massProperty' ),
      phetioType: DerivedProperty.DerivedPropertyIO( NumberIO ),
      units: 'kg'
    } );

    // @public {Property.<Vector2>} - The following offset will be added onto the body's position to determine ours.
    this.bodyOffsetProperty = new Vector2Property( Vector2.ZERO, {
      tandem: Tandem.OPT_OUT
    } );

    // @public {Property.<Vector2>}
    this.gravityForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true,
      tandem: tandem.createTandem( 'gravityForceInterpolatedProperty' ),
      phetioType: InterpolatedProperty.InterpolatedPropertyIO( Vector2.Vector2IO ),
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    // @public {Property.<Vector2>}
    this.buoyancyForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true,
      tandem: tandem.createTandem( 'buoyancyForceInterpolatedProperty' ),
      phetioType: InterpolatedProperty.InterpolatedPropertyIO( Vector2.Vector2IO ),
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    // @public {Property.<Vector2>}
    this.contactForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true,
      tandem: tandem.createTandem( 'contactForceInterpolatedProperty' ),
      phetioType: InterpolatedProperty.InterpolatedPropertyIO( Vector2.Vector2IO ),
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    // @public {Property.<Vector3>}
    this.forceOffsetProperty = new Property( Vector3.ZERO, {
      valueType: Vector3,
      useDeepEquality: true,
      tandem: Tandem.OPT_OUT
    } );

    // @public {Property.<Vector3>} - The 3D offset from the center-of-mass where the mass-label should be shown from.
    // The mass label will use this position (plus the masses' position) to determine a view point, then will use the
    // massOffsetOrientationProperty to position based on that point.
    this.massOffsetProperty = new Property( Vector3.ZERO, {
      valueType: Vector3,
      useDeepEquality: true,
      tandem: Tandem.OPT_OUT
    } );

    // @public {Property.<Vector3>} - Orientation multiplied by 1/2 width,height for an offset in view space
    this.massOffsetOrientationProperty = new Vector2Property( Vector2.ZERO, {
      useDeepEquality: true,
      tandem: Tandem.OPT_OUT
    } );

    // @public {Matrix3} - Transform matrix set before/after the physics engine steps, to be used to adjust/read the
    // mass's position/transform.
    this.matrix = config.matrix;

    // @public {Matrix3} - Transform matrix set in the internal physics engine steps, used by masses to determine their
    // per-step information.
    this.stepMatrix = new Matrix3();

    // @public (read-only) {Emitter}
    this.transformedEmitter = new Emitter();

    // @public (read-only) {boolean}
    this.canRotate = config.canRotate;

    // @public (read-only) {boolean}
    this.canMove = config.canMove;

    // @public (read-only) {MassTag}
    this.tag = config.tag;

    // @public {Basin|null} - Set by the model
    this.containingBasin = null;

    // @private {Matrix3}
    this.originalMatrix = this.matrix.copy();

    Property.multilink( [
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
   * @public
   *
   * @returns {boolean}
   */
  isBoat() {
    return false;
  }

  /**
   * Returns the cross-sectional area of this object at a given y level.
   * @public
   * @abstract
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getDisplacedArea( liquidLevel ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   * @public
   * @abstract
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getDisplacedVolume( liquidLevel ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Reads transform/velocity from the physics model engine.
   * @private
   */
  readData() {
    this.engine.bodyGetMatrixTransform( this.body, this.matrix );

    // Apply the body offset
    this.matrix.set02( this.matrix.m02() + this.bodyOffsetProperty.value.x );
    this.matrix.set12( this.matrix.m12() + this.bodyOffsetProperty.value.y );
  }

  /**
   * Writes position/velocity/etc. to the physics model engine.
   * @public
   */
  writeData() {
    this.engine.bodySetPosition( this.body, this.matrix.translation.minus( this.bodyOffsetProperty.value ) );
    this.engine.bodySetRotation( this.body, this.matrix.rotation );
  }

  /**
   * Starts a physics model engine drag at the given 2d (x,y) model position.
   * @public
   *
   * @param {Vector2} position
   */
  startDrag( position ) {
    this.userControlledProperty.value = true;
    this.engine.addPointerConstraint( this.body, position );
  }

  /**
   * Updates a current drag with a new 2d (x,y) model position.
   * @public
   *
   * @param {Vector2} position
   */
  updateDrag( position ) {
    this.engine.updatePointerConstraint( this.body, position );
  }

  /**
   * Ends a physics model engine drag.
   * @public
   */
  endDrag() {
    this.engine.removePointerConstraint( this.body );
    this.userControlledProperty.value = false;
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   * @public
   * @abstract
   *
   * @param {number} widthRatio
   * @param {number} heightRatio
   */
  setRatios( widthRatio, heightRatio ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   * @public
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
   * @public
   *
   * @param {Ray3} ray
   * @param {boolean} isTouch
   * @returns {number|null}
   */
  intersect( ray, isTouch ) {
    return null;
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt - In seconds
   * @param {number} interpolationRatio
   */
  step( dt, interpolationRatio ) {
    this.readData();

    this.transformedEmitter.emit();

    this.contactForceInterpolatedProperty.setRatio( interpolationRatio );
    this.buoyancyForceInterpolatedProperty.setRatio( interpolationRatio );
    this.gravityForceInterpolatedProperty.setRatio( interpolationRatio );
  }

  /**
   * Resets things to their original values.
   * @public
   */
  reset() {
    this.engine.bodyResetHidden( this.body );

    this.visibleProperty.reset();
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

    this.matrix.set( this.originalMatrix );
    this.writeData();

    this.transformedEmitter.emit();

    this.engine.bodySynchronizePrevious( this.body );
  }

  /**
   * Releases references
   * @public
   * @override
   */
  dispose() {
    this.userControlledProperty.dispose();
    this.materialProperty.dispose();
    this.volumeProperty.dispose();
    this.massProperty.dispose();
    this.gravityForceInterpolatedProperty.dispose();
    this.buoyancyForceInterpolatedProperty.dispose();
    this.contactForceInterpolatedProperty.dispose();

    super.dispose();
  }

  /**
   * Given a list of values and a ratio from 0 (the start) to 1 (the end), return an interpolated value.
   * @public
   *
   * @param {Array.<number>} values
   * @param {number} ratio
   * @returns {number}
   */
  static evaluatePiecewiseLinear( values, ratio ) {
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
}

// @public (read-only) {Enumeration}
Mass.MassTag = MassTag;

// @public (read-only) {IOType}
Mass.MassIO = new IOType( 'MassIO', {
  valueType: Mass,
  documentation: 'Represents a mass that interacts in the scene, and can potentially float or displace liquid.',
  stateSchema: {
    matrix: Matrix3.Matrix3IO,
    stepMatrix: Matrix3.Matrix3IO,
    canRotate: BooleanIO,
    canMove: BooleanIO,
    tag: EnumerationIO( Mass.MassTag ),

    // engine.bodyToStateObject
    position: Vector2.Vector2IO,
    velocity: Vector2.Vector2IO,
    force: Vector2.Vector2IO
  },
  toStateObject( mass ) {
    mass.readData();

    return merge( {
      matrix: Matrix3.toStateObject( mass.matrix ),
      stepMatrix: Matrix3.toStateObject( mass.stepMatrix ),
      canRotate: BooleanIO.toStateObject( mass.canRotate ),
      canMove: BooleanIO.toStateObject( mass.canMove ),
      tag: EnumerationIO( MassTag ).toStateObject( mass.tag )
    }, mass.engine.bodyToStateObject( mass.body ) );
  },
  applyState( mass, obj ) {
    mass.matrix.set( Matrix3.fromStateObject( obj.matrix ) );
    mass.stepMatrix.set( Matrix3.fromStateObject( obj.stepMatrix ) );
    mass.canRotate = BooleanIO.fromStateObject( obj.canRotate );
    mass.canMove = BooleanIO.fromStateObject( obj.canMove );
    mass.tag = EnumerationIO( MassTag ).fromStateObject( obj.tag );
    mass.engine.bodyApplyState( mass.body, obj );
  }
} );

densityBuoyancyCommon.register( 'Mass', Mass );
export default Mass;
