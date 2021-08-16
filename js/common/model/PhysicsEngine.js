// Copyright 2019-2021, University of Colorado Boulder

/**
 * Abstract base type for handling physics engines
 *
 * PhysicsEngine.Body represents an opaque object reference type that is specific to the engine it was created from.
 * These can be created with the create* methods, and are passed in to many methods.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class PhysicsEngine {
  constructor() {
    // @public {number} - Engines typically work in fixed-time steps, this is how far we are in the
    // display from the "previous" step (0) to the "next" step (1).
    this.interpolationRatio = 1;
  }

  /**
   * Steps forward in time.
   * @public
   * @abstract
   *
   * @param {number} dt
   */
  step( dt ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Adds a body into the engine, so that it will be tracked during the step.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   */
  addBody( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Removes a body from the engine, so that it will not be tracked during the step anymore.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   */
  removeBody( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Sets the mass of a body (and whether it can rotate, which for some engines needs to be set at the same time).
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {number} mass
   * @param {Object} [options] - {canRotate:boolean}
   */
  bodySetMass( body, mass, options ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Matrix3} matrix
   */
  bodyGetMatrixTransform( body, matrix ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Matrix3} matrix
   */
  bodyGetStepMatrixTransform( body, matrix ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Sets the position of a body.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Vector2} position
   */
  bodySetPosition( body, position ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Sets the rotation of a body.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {number} rotation
   */
  bodySetRotation( body, rotation ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Returns the velocity of a body.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @returns {Vector2}
   */
  bodyGetVelocity( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Sets the velocity of a body.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Vector2} velocity
   */
  bodySetVelocity( body, velocity ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Applies a given force to a body (should be in the post-step listener ideally)
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Vector2} force
   */
  bodyApplyForce( body, force ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Returns the applied contact force computed in the last step.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @returns {Vector2}
   */
  bodyGetContactForces( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Returns the applied contact force computed in the last step (as a force on A from B).
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} bodyA
   * @param {PhysicsEngine.Body} bodyB
   * @returns {Vector2}
   */
  bodyGetContactForceBetween( bodyA, bodyB ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Resets the contact forces that have happened on a body to 0 after measurement.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   */
  resetContactForces( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Returns a serialized form of a body
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @returns {Object}
   */
  bodyToStateObject( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Applies a given state object to a body.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Object} obj
   */
  bodyApplyState( body, obj ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Returns a serialized form of a body
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @returns {Object}
   */
  bodyResetHidden( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Sets the previous position of a body to the current position
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @returns {Object}
   */
  bodySynchronizePrevious( body ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Creates a (static) ground body with the given vertices.
   * @public
   * @abstract
   *
   * @param {Array.<Vector2>} vertices
   * @returns {PhysicsEngine.Body}
   */
  createGround( vertices ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Creates a (static) barrier body with the given vertices.
   * @public
   * @abstract
   *
   * @param {Array.<Vector2>} vertices
   * @returns {PhysicsEngine.Body}
   */
  createBarrier( vertices ) {
     throw new Error( 'unimplemented' );
  }

  /**
   * Creates a (dynamic) box body, with the origin at the center of the box.
   * @public
   * @abstract
   *
   * @param {number} width
   * @param {number} height
   * @param {boolean} [isStatic]
   * @returns {PhysicsEngine.Body}
   */
  createBox( width, height, isStatic ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Updates the width/height of a box body.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {number} width
   * @param {number} height
   */
  updateBox( body, width, height ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Creates a (dynamic) body, with the origin at the centroid.
   * @public
   * @abstract
   *
   * @param {Array.<Vector2>} vertices
   * @param {boolean} workaround
   * @returns {PhysicsEngine.Body}
   */
  createFromVertices( vertices, workaround ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Updates the vertices of a dynamic vertex-based body.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Array.<Vector2>} vertices
   * @param {boolean} workaround
   */
  updateFromVertices( body, vertices, workaround ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Adds a listener to be called after each internal step.
   * @public
   * @abstract
   *
   * @param {function(number)} listener
   */
  addPostStepListener( listener ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Removes a listener to be called after each internal step.
   * @public
   * @abstract
   *
   * @param {function(number)} listener
   */
  removePostStepListener( listener ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Adds in a pointer constraint so that the body's current point at the position will stay at the position
   * (if the body is getting dragged).
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Vector2} position
   */
  addPointerConstraint( body, position ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Updates a pointer constraint so that the body will essentially be dragged to the new position.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   * @param {Vector2} position
   */
  updatePointerConstraint( body, position ) {
    throw new Error( 'unimplemented' );
  }

  /**
   * Removes a pointer constraint.
   * @public
   * @abstract
   *
   * @param {PhysicsEngine.Body} body
   */
  removePointerConstraint( body ) {
    throw new Error( 'unimplemented' );
  }
}

densityBuoyancyCommon.register( 'PhysicsEngine', PhysicsEngine );
export default PhysicsEngine;