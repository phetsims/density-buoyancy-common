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
  const Matrix3 = require( 'DOT/Matrix3' );

  /**
   * @constructor
   */
  class Engine {
    constructor() {
    }

    /**
     * Steps forward in time.
     * @public
     *
     * @param {number} dt
     */
    step( dt ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Adds a body into the engine, so that it will be tracked during the step.
     * @public
     *
     * @param {Engine.Body} body
     */
    addBody( body ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Removes a body from the engine, so that it will not be tracked during the step anymore.
     * @public
     *
     * @param {Engine.Body} body
     */
    removeBody( body ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Sets the mass of a body (and whether it can rotate, which for some engines needs to be set at the same time).
     * @public
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

      throw new Error( 'unimplemented' );
    }

    /**
     * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
     * @public
     *
     * @param {Engine.Body} body
     * @param {Matrix3} matrix
     */
    bodyGetMatrixTransform( body, matrix ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Returns the transformation matrix of the given body.
     * @public
     *
     * @param {Engine.Body} body
     * @returns {Matrix3}
     */
    bodyGetMatrix( body ) {
      return this.bodyGetMatrixTransform( body, new Matrix3() );
    }

    /**
     * Sets the position of a body.
     * @public
     *
     * @param {Engine.Body} body
     * @param {Vector2} position
     */
    bodySetPosition( body, position ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Sets the rotation of a body.
     * @public
     *
     * @param {Engine.Body} body
     * @param {number} rotation
     */
    bodySetRotation( body, rotation ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Returns the angular velocity of a body.
     * @public
     *
     * @param {Engine.Body} body
     * @returns {number}
     */
    bodyGetAngularVelocity( body ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Sets the angular velocity of a body.
     * @public
     *
     * @param {Engine.Body} body
     * @param {number} angularVelocity
     */
    bodySetAngularVelocity( body, angularVelocity ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Returns the velocity of a body.
     * @public
     *
     * @param {Engine.Body} body
     * @returns {Vector2}
     */
    bodyGetVelocity( body ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Sets the velocity of a body.
     * @public
     *
     * @param {Engine.Body} body
     * @param {Vector2} velocity
     */
    bodySetVelocity( body, velocity ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Creates a (static) ground body with the given vertices.
     * @public
     *
     * @param {Array.<Vector2>} vertices
     * @returns {Engine.Body}
     */
    createGround( vertices ) {
      throw new Error( 'unimplemented' );
    }

    /**
     * Creates a (dynamic) box body, with the origin at the center of the box.
     * @public
     *
     * @param {number} width
     * @param {number} height
     * @returns {Engine.Body}
     */
    createBox( width, height ) {
      throw new Error( 'unimplemented' );
    }
  }

  return densityBuoyancyCommon.register( 'Engine', Engine );
} );
