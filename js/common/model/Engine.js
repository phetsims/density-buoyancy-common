// Copyright 2019-2020, University of Colorado Boulder

/**
 * Abstract base type for handling physics engines
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';

const logging = assert && DensityBuoyancyCommonQueryParameters.engineLog;

class Engine {
  constructor() {
    // @public {number} - TODO: doc
    this.interpolationRatio = 1;
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
    options = merge( {
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
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   * @public
   *
   * @param {Engine.Body} body
   * @param {Matrix3} matrix
   */
  bodyGetStepMatrixTransform( body, matrix ) {
    throw new Error( 'unimplemented' );
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
   * Applies a given force to a body (should be in the post-step listener ideally)
   * @public
   *
   * @param {Engine.Body} body
   * @param {Vector2} velocity
   */
  bodyApplyForce( body, force ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Returns the applied contact force computed in the last step.
   * @public
   *
   * @param {Engine.Body} body
   * @returns {Vector2}
   */
  bodyGetContactForces( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Returns the applied contact force computed in the last step (as a force on A from B).
   * @public
   *
   * @param {Engine.Body} bodyA
   * @param {Engine.Body} bodyB
   * @returns {Vector2}
   */
  bodyGetContactForceBetween( bodyA, bodyB ) {
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
   * @param {boolean} [isStatic]
   * @returns {Engine.Body}
   */
  createBox( width, height, isStatic ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Updates the width/height of a box body.
   * @public
   *
   * @param {Engine.Body}
   * @param {number} width
   * @param {number} height
   */
  updateBox( body, width, height ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Creates a (dynamic) body, with the origin at the centroid.
   * @public
   *
   * @param {Array.<Vector2>} vertices
   * @param {boolean} workaround
   * @returns {Engine.Body}
   */
  createFromVertices( vertices, workaround ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Updates the vertices of a dynamic vertex-based body.
   * @public
   *
   * @param {Engine.Body}
   * @param {Array.<Vector2>} vertices
   * @param {boolean} workaround
   */
  updateFromVertices( body, vertices ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Adds a listener to be called after each internal step.
   * @public
   *
   * @param {function} listener
   */
  addPostStepListener( listener ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Removes a listener to be called after each internal step.
   * @public
   *
   * @param {function} listener
   */
  removePostStepListener( listener ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Adds in a pointer constraint so that the body's current point at the position will stay at the position
   * (if the body is getting dragged).
   * @public
   *
   * @param {Engine.Body} body
   * @param {Vector2} position
   */
  addPointerConstraint( body, position ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Updates a pointer constraint so that the body will essentially be dragged to the new position.
   * @public
   *
   * @param {Engine.Body} body
   * @param {Vector2} position
   */
  updatePointerConstraint( body, position ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Removes a pointer constraint.
   * @public
   *
   * @param {Engine.Body} body
   */
  removePointerConstraint( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Logs an engine message if desired.
   * @public
   *
   * @param {string} str
   */
  static log( str ) {
    logging && console.log( str );
  }
}

densityBuoyancyCommon.register( 'Engine', Engine );
export default Engine;