// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const InterpolatedProperty = require( 'DENSITY_BUOYANCY_COMMON/common/model/InterpolatedProperty' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Shape = require( 'KITE/Shape' );

  class Boat extends Mass {
    /**
     * @param {Engine} engine
     * @param {Bounds3} size
     * @param {number} thickness
     * @param {Object} config
     */
    constructor( engine, size, thickness, config ) {

      // TODO
      const boatVertices = [];
      const volume = 0;

      config = merge( {
        body: engine.createFromVertices( boatVertices ),
        shape: Shape.polygon( boatVertices ),
        volume: volume,
        canRotate: false

        // material
      }, config );

      assert && assert( !config.canRotate );

      super( engine, config );

      // @public {Property.<number>}
      this.liquidVolumeProperty = new NumberProperty( 0 );

      // @public {Property.<number>} - The y coordinate of the main liquid level in the boat (relative to interiorSize.minY)
      this.liquidYProperty = new InterpolatedProperty( 0, {
        interpolate: InterpolatedProperty.interpolateNumber
      } );
    }

    /**
     * Steps forward in time.
     * @public
     * @override
     *
     * @param {number} dt
     * @param {number} interpolationRatio
     */
    step( dt, interpolationRatio ) {
      super.step( dt, interpolationRatio );

      this.liquidYProperty.setRatio( interpolationRatio );
    }
    /**
     * Returns whether this is a boat (as more complicated handling is needed in this case).
     * @public
     * @override
     *
     * @returns {boolean}
     */
    isBoat() {
      return true;
    }

    updateStepInformation() {
      // TODO: see if we can extend cuboid
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      const xOffset = this.stepMatrix.m02();
      const yOffset = this.stepMatrix.m12();

      const TODO = 5;

      this.stepX = xOffset;
      this.stepBottom = yOffset + -TODO;
      this.stepTop = yOffset + TODO;
    }

    /**
     * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
     * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
     * if there is no intersection, null will be returned.
     * @public
     * @override
     *
     * @param {Ray3} ray
     * @param {boolean} isTouch
     * @returns {number|null}
     */
    intersect( ray, isTouch ) {
      // TODO

      return null;
    }

    /**
     * Returns the cumulative displaced volume of this object up to a given y level.
     * @public
     * @override
     *
     * Assumes step information was updated.
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getDisplacedArea( liquidLevel ) {
      return 0; // TODO
    }

    /**
     * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
     * @public
     * @override
     *
     * Assumes step information was updated.
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getDisplacedVolume( liquidLevel ) {
      return 0; // TODO
    }

    /**
     * TODO: doc. Uses liquid compensation
     * @public
     * @override
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getDisplacedBuoyantVolume( liquidLevel ) {
      // TODO: yikes! Imagine boat with liquid with things floating in it. figure out.
      // TODO: NOPE NOPE NOPE NOPE NOPE NOPE NOPE this isn't right
      return 0; // TODO:
    }

    reset() {
      this.liquidVolumeProperty.reset();
      this.liquidYProperty.reset();

      super.reset();
    }
  }

  return densityBuoyancyCommon.register( 'Boat', Boat );
} );
