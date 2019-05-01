// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Emitter = require( 'AXON/Emitter' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  /**
   * @constructor
   */
  class Mass {
    /**
     * @param {Object} config
     */
    constructor( config ) {

      config = _.extend( {
        // {Matter.Body}
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

      // @public {Matter.Body}
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
        Matter.Body.setMass( this.body, mass );

        if ( !config.canRotate ) {
          Matter.Body.setInertia( this.body, Number.POSITIVE_INFINITY );
        }
      } );

      this.writeData();

      // Matter.Body.create({ parts: [partA, partB] });
    }

    /**
     * Returns the submerged volume of this object, assuming a y value for the given liquid level.
     * @public
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getSubmergedVolume( liquidLevel ) {
      throw new Error( 'abstract method' );
    }

    // TODO: do this based on liquid shapes? or is this enough?
    computeGeneralSubmergedArea( liquidLevel ) {
      const transformedShape = this.shapeProperty.value.transformed( this.matrix );
      const liquidShape = Shape.bounds( new Bounds2(
        transformedShape.bounds.left - 1,
        Math.min( liquidLevel, transformedShape.minY ) - 1,
        transformedShape.bounds.right + 1,
        liquidLevel
      ) );
      const submergedShape = transformedShape.shapeIntersection( liquidShape );
      return submergedShape.getArea();
    }

    readData() {
      this.matrix.setToTranslationRotation(
        this.body.position.x / DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE,
        this.body.position.y / DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE,
        this.body.angle
      );
      this.angularVelocityProperty.value = this.body.angularVelocity;
      this.velocityProperty.value = new Vector2(
        this.body.velocity.x / DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE,
        this.body.velocity.y / DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE
      );
    }

    writeData() {
      const translation = this.matrix.translation;
      const rotation = this.matrix.rotation;
      const velocity = this.velocityProperty.value;
      Matter.Body.setPosition( this.body, Matter.Vector.create(
        translation.x * DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE,
        translation.y * DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE
      ) );
      Matter.Body.setAngle( this.body, rotation );
      Matter.Body.setAngularVelocity( this.body, this.angularVelocityProperty.value );
      Matter.Body.setVelocity( this.body, Matter.Vector.create(
        velocity.x * DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE,
        velocity.y * DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE
      ) );
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
