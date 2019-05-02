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
  const Engine = require( 'DENSITY_BUOYANCY_COMMON/common/model/Engine' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const FIXED_TIME_STEP = 1 / 60;
  const MAX_SUB_STEPS = 10;

  /**
   * @constructor
   */
  class P2Engine extends Engine {
    constructor() {
      super();

      // @private {p2.World}
      this.world = new p2.World( {
        gravity: [ 0, -9.82 ]
      } );
    }

    /**
     * Steps forward in time.
     * @public
     * @override
     *
     * @param {number} dt
     */
    step( dt ) {
      this.world.step( FIXED_TIME_STEP, dt, MAX_SUB_STEPS );
    }

    /**
     * Adds a body into the engine, so that it will be tracked during the step.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     */
    addBody( body ) {
      this.world.addBody( body );
    }

    /**
     * Removes a body from the engine, so that it will not be tracked during the step anymore.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     */
    removeBody( body ) {
      this.world.removeBody( body );
    }

    /**
     * Sets the mass of a body (and whether it can rotate, which for some engines needs to be set at the same time).
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {number} mass
     * @param {Object} [options]
     */
    bodySetMass( body, mass, options ) {
      options = _.extend( {
        // {boolean} - optional
        canRotate: false
      }, options );

      body.mass = mass;

      if ( !options.canRotate ) {
        body.fixedRotation = true;
      }

      body.updateMassProperties();
    }

    /**
     * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {Matrix3} matrix
     */
    bodyGetMatrixTransform( body, matrix ) {
      return matrix.setToTranslationRotation( body.interpolatedPosition[ 0 ], body.interpolatedPosition[ 1 ], body.interpolatedAngle );
    }

    /**
     * Sets the position of a body.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {Vector2} position
     */
    bodySetPosition( body, position ) {
      body.position[ 0 ] = position.x;
      body.position[ 1 ] = position.y;
    }

    /**
     * Sets the rotation of a body.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {number} rotation
     */
    bodySetRotation( body, rotation ) {
      body.angle = rotation;
    }

    /**
     * Returns the angular velocity of a body.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @returns {number}
     */
    bodyGetAngularVelocity( body ) {
      return body.angularVelocity;
    }

    /**
     * Sets the angular velocity of a body.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {number} angularVelocity
     */
    bodySetAngularVelocity( body, angularVelocity ) {
      body.angularVelocity = angularVelocity;
    }

    /**
     * Returns the velocity of a body.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @returns {Vector2}
     */
    bodyGetVelocity( body ) {
      return P2Engine.p2ToVector( body.velocity );
    }

    /**
     * Sets the velocity of a body.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {Vector2} velocity
     */
    bodySetVelocity( body, velocity ) {
      body.velocity[ 0 ] = velocity.x;
      body.velocity[ 1 ] = velocity.y;
    }

    /**
     * Creates a rectangular body from the given bounds.
     * @public
     * @override
     *
     * @param {Bounds2} bounds
     * @param {Object} [options]
     * @returns {Engine.Body}
     */
    createBoundsBody( bounds, options ) {
      options = _.extend( {
        isStatic: false
      }, options );

      const body = new p2.Body( {
        type: options.isStatic ? p2.Body.STATIC : p2.Body.DYNAMIC
      } );

      const rectangularShape = new p2.Convex( {
        vertices: [
          p2.vec2.fromValues( bounds.minX, bounds.minY ),
          p2.vec2.fromValues( bounds.maxX, bounds.minY ),
          p2.vec2.fromValues( bounds.maxX, bounds.maxY ),
          p2.vec2.fromValues( bounds.minX, bounds.maxY )
        ],
        axes: [
          p2.vec2.fromValues( 1, 0 ),
          p2.vec2.fromValues( 0, 1 )
        ]
      } );

      body.addShape( rectangularShape );

      return body;
    }

    static vectorToP2( vector ) {
      return p2.vec2.fromValues( vector.x, vector.y );
    }

    static p2ToVector( vector ) {
      return new Vector2( vector[ 0 ], vector[ 1 ] );
    }
  }

  return densityBuoyancyCommon.register( 'P2Engine', P2Engine );
} );
