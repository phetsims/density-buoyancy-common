// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import InterpolatedProperty from './InterpolatedProperty.js';

// constants
const MassTag = Enumeration.byKeys( [
  'PRIMARY',
  'SECONDARY',
  'NONE'
] );

class Mass {
  /**
   * @param {Engine} engine
   * @param {Object} config
   */
  constructor( engine, config ) {

    config = merge( {
      // {Engine.Body}
      body: null,

      // {Shape}
      shape: null,

      // {Material}
      material: null,

      // {number}
      volume: 0,

      // {Matrix3} - optional
      matrix: new Matrix3(),

      // {boolean} - optional
      canRotate: false,

      // {boolean} - optional
      canMove: true,

      // {MassTag} - optional
      tag: MassTag.NONE,

      // {Tandem}
      tandem: null
    }, config );

    // @public {Engine}
    this.engine = engine;

    // @public {Engine.Body}
    this.body = config.body;

    // @public {Property.<Shape>}
    this.shapeProperty = new Property( config.shape );

    // @public {Property.<boolean>}
    this.userControlledProperty = new BooleanProperty( false );

    // @public {Property.<Material>}
    this.materialProperty = new Property( config.material, {
      reentrant: true
    } );

    // @public {Property.<number>} - In m^3 (cubic meters)
    this.volumeProperty = new NumberProperty( config.volume );

    // @public {Property.<number>} - In kg (kilograms)
    this.massProperty = new DerivedProperty( [ this.materialProperty, this.volumeProperty ], ( material, volume ) => {
      return material.density * volume;
    } );

    // @public {Property.<Vector2>} - The following offset will be added onto the body's position to determine ours.
    this.bodyOffsetProperty = new Property( Vector2.ZERO );

    // @public {Property.<Vector2>}
    this.gravityForceProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true
    } );

    // @public {Property.<Vector2>}
    this.buoyancyForceProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true
    } );

    // @public {Property.<Vector2>}
    this.contactForceProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      useDeepEquality: true
    } );

    // @public {Property.<Vector3>}
    this.forceOffsetProperty = new Property( Vector3.ZERO, {
      useDeepEquality: true
    } );

    // @public {Property.<Vector3>}
    this.massOffsetProperty = new Property( Vector3.ZERO, {
      useDeepEquality: true
    } );

    // @public {Property.<Vector3>} - Orientation multiplied by 1/2 width,height for an offset in view space
    this.massOffsetOrientationProperty = new Property( Vector2.ZERO, {
      useDeepEquality: true
    } );

    // @public {Matrix3}
    this.matrix = config.matrix;

    // @public {Matrix}
    this.stepMatrix = new Matrix3();

    // @public {Emitter}
    this.transformedEmitter = new Emitter();

    // @public {boolean}
    this.canRotate = config.canRotate;

    // @public {boolean}
    this.canMove = config.canMove;

    // @public {MassTag}
    this.tag = config.tag;

    // @public {Property.<Vector2>}
    this.velocityProperty = new Vector2Property( Vector2.ZERO );

    // @public {Property.<number>}
    this.angularVelocityProperty = new NumberProperty( 0 );

    // @private {Matrix3}
    this.originalMatrix = this.matrix.copy();

    Property.multilink( [
      this.shapeProperty,
      this.massProperty
    ], () => {
      engine.bodySetMass( this.body, this.massProperty.value, {
        canRotate: config.canRotate
      } );
    } );

    this.writeData();

    // @public {number}
    this.stepX = 0;
    this.stepBottom = 0;
    this.stepTop = 0;

    // @public {boolean}
    this.alignedWithBoat = false;
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
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getDisplacedVolume( liquidLevel ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * TODO: doc. Uses liquid compensation
   * @public
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getDisplacedBuoyantVolume( liquidLevel ) {
    return this.getDisplacedVolume( liquidLevel );
  }

  readData() {
    this.engine.bodyGetMatrixTransform( this.body, this.matrix );

    // Apply the body offset
    this.matrix.set02( this.matrix.m02() + this.bodyOffsetProperty.value.x );
    this.matrix.set12( this.matrix.m12() + this.bodyOffsetProperty.value.y );

    this.angularVelocityProperty.value = this.engine.bodyGetAngularVelocity( this.body );
    this.velocityProperty.value = this.engine.bodyGetVelocity( this.body );
  }

  writeData() {
    this.engine.bodySetPosition( this.body, this.matrix.translation.minus( this.bodyOffsetProperty.value ) );
    this.engine.bodySetRotation( this.body, this.matrix.rotation );
    this.engine.bodySetAngularVelocity( this.body, this.angularVelocityProperty.value );
    this.engine.bodySetVelocity( this.body, this.velocityProperty.value );
  }

  startDrag( position ) {
    this.userControlledProperty.value = true;
    this.engine.addPointerConstraint( this.body, position );
  }

  updateDrag( position ) {
    this.engine.updatePointerConstraint( this.body, position );
  }

  endDrag() {
    this.engine.removePointerConstraint( this.body );
    this.userControlledProperty.value = false;
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   * @public
   *
   * @param {number} widthRatio
   * @param {number} heightRatio
   */
  setRatios( widthRatio, heightRatio ) {
    throw new Error( 'unimplemented' );
  }

  updateStepInformation() {
    throw new Error( 'unimplemented' );
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
   * @param {number} dt
   * @param {number} interpolationRatio
   */
  step( dt, interpolationRatio ) {
    this.readData();

    this.transformedEmitter.emit();

    this.contactForceProperty.setRatio( interpolationRatio );
    this.buoyancyForceProperty.setRatio( interpolationRatio );
    this.gravityForceProperty.setRatio( interpolationRatio );
  }

  /**
   * Resets things to their original values.
   * @public
   */
  reset() {
    // TODO: check everything to reset
    this.shapeProperty.reset();
    this.materialProperty.reset();
    this.volumeProperty.reset();
    this.velocityProperty.reset();
    this.angularVelocityProperty.reset();

    this.matrix.set( this.originalMatrix );
    this.writeData();

    this.transformedEmitter.emit();
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
    const logicalIndex = ratio * values.length;
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

// @public {Enumeration}
Mass.MassTag = MassTag;

densityBuoyancyCommon.register( 'Mass', Mass );
export default Mass;