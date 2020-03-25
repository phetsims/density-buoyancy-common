// Copyright 2019-2020, University of Colorado Boulder

/**
 * Adapter for the matter.js physics engine
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import FixedTimestepEngine from './FixedTimestepEngine.js';

// constants
const MATTER_SCALE = 100;

const log = message => console.log( message );
const mvecToString = vector => `(${vector.x},${vector.y})`;

class MatterEngine extends FixedTimestepEngine {
  constructor() {
    super();

    // @private {Matter.Engine}
    assert && log( 'Matter.Engine.create()' );
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
    assert && log( 'Matter.Engine.update( ..., 1000 / 60 )' );
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
    assert && log( `Matter.World.add( this.engine.world, #${body.id} )` );
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
    assert && log( `Matter.World.remove( this.engine.world, #${body.id} )` );
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
    options = merge( {
      // {boolean} - optional
      canRotate: false
    }, options );

    assert && log( `Matter.Body.setMass( #${body.id}, ${mass} )` );
    Matter.Body.setMass( body, mass );

    if ( !options.canRotate ) {
      assert && log( `Matter.Body.setInertia( #${body.id}, Number.POSITIVE_INFINITY )` );
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
    assert && log( `bodyGetMatrixTransform: #${body.id}: position: ${body.position.x}, ${body.position.y}, angle: ${body.angle}` );
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
    assert && log( `Matter.Body.setPosition( #${body.id}, ${mvecToString( MatterEngine.vectorToMatter( position ) )} )` );
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
    assert && log( `Matter.Body.setAngle( #${body.id}, ${rotation} )` );
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
    assert && log( `Matter.Body.setAngularVelocity( #${body.id}, ${angularVelocity} )` );
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
    assert && log( `body.velocity #${body.id}: ${mvecToString( body.velocity )}` );
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
    assert && log( `Matter.Body.setVelocity( #${body.id}, ${mvecToString( MatterEngine.vectorToMatter( velocity ) )} )` );
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
    assert && log( `Matter.Body.applyForce( #${body.id}, ${mvecToString( body.position )}, ${mvecToString( MatterEngine.vectorToMatter( force ) )} )` );
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
    assert && log( `createGround: Matter.Bodies.fromVertices( 0, 0, ${vertices.map( MatterEngine.vectorToMatter ).map( mvecToString ).join( ',' )} )` );
    const body = Matter.Bodies.fromVertices( 0, 0, vertices.map( MatterEngine.vectorToMatter ), {
      isStatic: true,
      position: MatterEngine.vectorToMatter( Vector2.ZERO )
    } );
    assert && log( `created #${body.id}` );
    return body;
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
    assert && log( `createBox: Matter.Bodies.fromVertices( 0, 0, ${MatterEngine.rectangleVerties( width, height ).map( mvecToString ).join( ',' )} )` );
    const body = Matter.Bodies.fromVertices( 0, 0, MatterEngine.rectangleVerties( width, height ) );
    assert && log( `created #${body.id}` );
    return body;
  }

  /**
   * Updates the width/height of a box body.
   * @public
   * @override
   *
   * @param {Engine.Body}
   * @param {number} width
   * @param {number} height
   */
  updateBox( body, width, height ) {
    assert && log( `updateBox: Matter.Body.setVertices( #${body.id}, ${MatterEngine.rectangleVerties( width, height ).map( mvecToString ).join( ',' )} )` );
    Matter.Body.setVertices( body, MatterEngine.rectangleVerties( width, height ) );
  }

  /**
   * Adds a listener to be called after each internal step.
   * @public
   * @override
   *
   * @param {function} listener
   */
  addPostStepListener( listener ) {
    assert && log( 'Matter.Events.on( this.engine, \'afterUpdate\', ... )' );
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
    assert && log( 'Matter.Events.off( this.engine, \'afterUpdate\', ... )' );
    Matter.Events.off( this.engine, 'afterUpdate', listener );
  }

  /**
   * Returns the applied contact force computed in the last step.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   * @returns {Vector2}
   */
  bodyGetContactForces( body ) {
    return new Vector2( 0, 0 ); // TODO
  }

  /**
   * Returns the applied contact force computed in the last step (as a force on A from B).
   * @public
   * @override
   *
   * @param {Engine.Body} bodyA
   * @param {Engine.Body} bodyB
   * @returns {Vector2}
   */
  bodyGetContactForceBetween( bodyA, bodyB ) {
    return new Vector2( 0, 0 ); // TODO
  }

  // TODO: doc
  resetContactForces( body ) {
    // TODO
  }

  /**
   * Returns matter.js vertices for a given rectangle width and height.
   * @private
   *
   * @param {number} width
   * @param {number} height
   * @returns {Array.<Matter.Vector>}
   */
  static rectangleVerties( width, height ) {
    return [
      MatterEngine.vectorToMatter( new Vector2( -width / 2, -height / 2 ) ),
      MatterEngine.vectorToMatter( new Vector2( width / 2, -height / 2 ) ),
      MatterEngine.vectorToMatter( new Vector2( width / 2, height / 2 ) ),
      MatterEngine.vectorToMatter( new Vector2( -width / 2, height / 2 ) )
    ];
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

densityBuoyancyCommon.register( 'MatterEngine', MatterEngine );
export default MatterEngine;