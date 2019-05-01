// Copyright 2019, University of Colorado Boulder

/**
 * Interoperation utilities with Matter.js.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const MATTER_SIZE_SCALE = DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE;

  const MatterUtil = {
    /**
     * Converts a Vector2 to a Matter.Vector.
     * @public
     *
     * @param {Vector2} vector
     * @returns {Matter.Vector}
     */
    vectorToMatter( vector ) {
      return Matter.Vector.create( vector.x * MATTER_SIZE_SCALE, vector.y * MATTER_SIZE_SCALE );
    },

    /**
     * Converts a Matter.Vector to a Vector2.
     * @public
     *
     * @param {Matter.Vector} vector
     * @returns {Vector2}
     */
    matterToVector( vector ) {
      return new Vector2( vector.x / MATTER_SIZE_SCALE, vector.y / MATTER_SIZE_SCALE );
    },

    bodyFromRectangle( centerX, centerY, width, height ) {
      return Matter.Bodies.rectangle(
        centerX * MATTER_SIZE_SCALE,
        centerY * MATTER_SIZE_SCALE,
        width * MATTER_SIZE_SCALE,
        height * MATTER_SIZE_SCALE
      );
    },

    staticBodyFromBounds( bounds ) {
      return Matter.Bodies.rectangle(
        bounds.centerX * MATTER_SIZE_SCALE,
        bounds.centerY * MATTER_SIZE_SCALE,
        bounds.width * MATTER_SIZE_SCALE,
        bounds.height * MATTER_SIZE_SCALE,
        {
          isStatic: true
        }
      );
      // return Matter.Bodies.fromVertices( 0, 0, [
      //   Matter.Vector.create( bounds.minX, bounds.minY ),
      //   Matter.Vector.create( bounds.minX, bounds.maxY ),
      //   Matter.Vector.create( bounds.maxX, bounds.maxY ),
      //   Matter.Vector.create( bounds.maxX, bounds.minY )
      // ], {
      //   isStatic: true
      // } );
    }
  };

  densityBuoyancyCommon.register( 'MatterUtil', MatterUtil );

  return MatterUtil;
} );
