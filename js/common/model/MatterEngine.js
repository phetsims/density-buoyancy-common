// Copyright 2019, University of Colorado Boulder

/**
 * Abstract base type for handling physics engines
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const FixedTimestepEngine = require( 'DENSITY_BUOYANCY_COMMON/common/model/FixedTimestepEngine' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const MATTER_SCALE = 100;

  /**
   * @constructor
   */
  class MatterEngine extends FixedTimestepEngine {
    constructor() {
      super();

      // @private {Matter.Engine}
      this.engine = Matter.Engine.create();
      this.engine.world.gravity.y = -1; // So that it's physical with positive y up
      this.engine.world.gravity.scale = 1 / ( MATTER_SCALE * 9.8 );
    }

    createRectangularBody( width, height, options ) {
      options = _.extend( {
        isStatic: false
      }, options );

      return Matter.Bodies.rectangle(
        0,
        0,
        width * MATTER_SCALE,
        height * MATTER_SCALE,
        {
          isStatic: options.isStatic
        }
      );
    }

    /**
     * Converts a Vector2 to a Matter.Vector.
     * @public
     *
     * @param {Vector2} vector
     * @returns {Matter.Vector}
     */
    static vectorToMatter( vector ) {
      return Matter.Vector.create( vector.x * MATTER_SCALE, vector.y * MATTER_SCALE );
    }

    /**
     * Converts a Matter.Vector to a Vector2.
     * @public
     *
     * @param {Matter.Vector} vector
     * @returns {Vector2}
     */
    static matterToVector( vector ) {
      return new Vector2( vector.x / MATTER_SCALE, vector.y / MATTER_SCALE );
    }

    static bodyFromRectangle( centerX, centerY, width, height ) {
      return Matter.Bodies.rectangle(
        centerX * MATTER_SCALE,
        centerY * MATTER_SCALE,
        width * MATTER_SCALE,
        height * MATTER_SCALE
      );
    }

    static staticBodyFromBounds( bounds ) {
      return Matter.Bodies.rectangle(
        bounds.centerX * MATTER_SCALE,
        bounds.centerY * MATTER_SCALE,
        bounds.width * MATTER_SCALE,
        bounds.height * MATTER_SCALE,
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
  }

  return densityBuoyancyCommon.register( 'MatterEngine', MatterEngine );
} );
