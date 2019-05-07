// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Emitter = require( 'AXON/Emitter' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
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

      // @public {Property.<Material>}
      this.materialProperty = new Property( config.material );

      // @public {Property.<number>} - In m^3 (cubic meters)
      this.volumeProperty = new NumberProperty( config.volume );

      // @public {Property.<number>} - In kg (kilograms)
      this.massProperty = new DerivedProperty( [ this.materialProperty, this.volumeProperty ], ( material, volume ) => {
        return material.density * volume;
      } );

      // TODO: computation of submerged volume

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

      this.massProperty.link( mass => {
        engine.bodySetMass( this.body, mass, {
          canRotate: config.canRotate
        } );
      } );

      this.writeData();
    }

    /**
     * Returns the submerged volume of this object, assuming a y value for the given liquid level.
     * @public
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getSubmergedVolume( liquidLevel ) {
      return this.computeGeneralSubmergedArea( liquidLevel );
    }

    // TODO: do this based on liquid shapes? or is this enough?
    computeGeneralSubmergedArea( liquidLevel ) {
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      const transformedShape = this.shapeProperty.value.transformed( this.stepMatrix );
      const liquidShape = Shape.bounds( new Bounds2(
        transformedShape.bounds.left - 1,
        Math.min( liquidLevel, transformedShape.bounds.minY ) - 1,
        transformedShape.bounds.right + 1,
        liquidLevel
      ) );
      const submergedShape = transformedShape.shapeIntersection( liquidShape );
      return submergedShape.getArea();
    }

    /**
     * Pushes area markers for this mass onto the array.
     * @public
     *
     * @param {Array.<AreaMarker>} areaMarkers
     */
    pushAreaMarkers( areaMarkers ) {
      throw new Error( 'unimplemented' );
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

    /**
     * Steps forward in time.
     * @public
     *
     * @param {number} dt
     */
    step( dt ) {
      this.readData();

      this.transformedEmitter.emit();
    }

    /**
     * Resets things to their original values.
     * @public
     */
    reset() {
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
