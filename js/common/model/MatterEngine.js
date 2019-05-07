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

  class MatterEngine extends FixedTimestepEngine {
    constructor() {
      super();

      // @private {Matter.Engine}
      this.engine = Matter.Engine.create();

      // Disable gravity (will handle the force manually)
      this.engine.world.gravity.y = 0;
    }

    /**
     * Steps forward in time.
     * @public
     * @override
     *
     * @param {number} dt
     */
    step( dt ) {
      // TODO variable DT testing!!!
      Matter.Engine.update( this.engine, 1000 / 60 );
    }

    /**
     * Adds a body into the engine, so that it will be tracked during the step.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     */
    addBody( body ) {
      Matter.World.add( this.engine.world, body );
    }

    /**
     * Removes a body from the engine, so that it will not be tracked during the step anymore.
     * @public
     * @override
     *
     * @param {Engine.Body} body
     */
    removeBody( body ) {
      Matter.World.remove( this.engine.world, body );
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

      Matter.Body.setMass( body, mass );

      if ( !options.canRotate ) {
        Matter.Body.setInertia( body, Number.POSITIVE_INFINITY );
      }
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
      return matrix.setToTranslationRotation( body.position.x / MATTER_SCALE, body.position.y / MATTER_SCALE, body.angle );
    }

    /**
     * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {Matrix3} matrix
     */
    bodyGetStepMatrixTransform( body, matrix ) {
      return this.bodyGetMatrixTransform( body, matrix );
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
      Matter.Body.setPosition( body, MatterEngine.vectorToMatter( position ) );
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
      Matter.Body.setAngle( body, rotation );
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
      Matter.Body.setAngularVelocity( body, angularVelocity );
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
      return MatterEngine.matterToVector( body.velocity );
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
      Matter.Body.setVelocity( body, MatterEngine.vectorToMatter( velocity ) );
    }

    /**
     * Applies a given force to a body (should be in the post-step listener ideally)
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {Vector2} velocity
     */
    bodyApplyForce( body, force ) {
      Matter.Body.applyForce( body, body.position, MatterEngine.vectorToMatter( force ) );
    }

    /**
     * Creates a (static) ground body with the given vertices.
     * @public
     * @override
     *
     * @param {Array.<Vector2>} vertices
     * @returns {Engine.Body}
     */
    createGround( vertices ) {
      return Matter.Bodies.fromVertices( 0, 0, vertices.map( MatterEngine.vectorToMatter ), {
        isStatic: true,
        position: MatterEngine.vectorToMatter( Vector2.ZERO )
      } );
    }

    /**
     * Creates a (dynamic) box body, with the origin at the center of the box.
     * @public
     * @override
     *
     * @param {number} width
     * @param {number} height
     * @returns {Engine.Body}
     */
    createBox( width, height ) {
      // For composites: Matter.Body.create({ parts: [partA, partB] });
      return Matter.Bodies.rectangle( 0, 0, width * MATTER_SCALE, height * MATTER_SCALE );
    }

    /**
     * Adds a listener to be called after each internal step.
     * @public
     * @override
     *
     * @param {function} listener
     */
    addPostStepListener( listener ) {
      Matter.Events.on( this.engine, 'afterUpdate', listener );
    }

    /**
     * Removes a listener to be called after each internal step.
     * @public
     * @override
     *
     * @param {function} listener
     */
    removePostStepListener( listener ) {
      Matter.Events.off( this.engine, 'afterUpdate', listener );
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
  }

  return densityBuoyancyCommon.register( 'MatterEngine', MatterEngine );
} );
