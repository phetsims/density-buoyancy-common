// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Emitter = require( 'AXON/Emitter' );
  const InterpolatedProperty = require( 'DENSITY_BUOYANCY_COMMON/common/model/InterpolatedProperty' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class Mass {
    /**
     * @param {Engine} engine
     * @param {Object} config
     */
    constructor( engine, config ) {

      config = _.extend( {
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
      this.materialProperty = new Property( config.material );

      // @public {Property.<number>} - In m^3 (cubic meters)
      this.volumeProperty = new NumberProperty( config.volume );

      // @public {Property.<number>} - In kg (kilograms)
      this.massProperty = new DerivedProperty( [ this.materialProperty, this.volumeProperty ], ( material, volume ) => {
        return material.density * volume;
      } );

      // @public {Property.<Vector2>}
      this.contactForceProperty = new InterpolatedProperty( Vector2.ZERO, {
        interpolate: InterpolatedProperty.interpolateVector2,
        useDeepEquality: true
      } );

      // @public {Property.<Vector2>}
      this.buoyancyForceProperty = new InterpolatedProperty( Vector2.ZERO, {
        interpolate: InterpolatedProperty.interpolateVector2,
        useDeepEquality: true
      } );

      // @public {Property.<Vector2>}
      this.gravityForceProperty = new InterpolatedProperty( Vector2.ZERO, {
        interpolate: InterpolatedProperty.interpolateVector2,
        useDeepEquality: true
      } );

      // @public {Matrix}
      this.matrix = config.matrix;

      // @public {Matrix}
      this.stepMatrix = new Matrix3();

      // @public {Emitter}
      this.transformedEmitter = new Emitter();

      // @public {boolean}
      this.canRotate = config.canRotate;

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
      this.angularVelocityProperty.value = this.engine.bodyGetAngularVelocity( this.body );
      this.velocityProperty.value = this.engine.bodyGetVelocity( this.body );
    }

    writeData() {
      this.engine.bodySetPosition( this.body, this.matrix.translation );
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
  }

  return densityBuoyancyCommon.register( 'Mass', Mass );
} );
