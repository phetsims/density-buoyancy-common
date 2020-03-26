// Copyright 2019-2020, University of Colorado Boulder

/**
 * Adapter for the matter.js physics engine
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Util from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import FixedTimestepEngine from './FixedTimestepEngine.js';

// constants
const SCALE = 100;
const BODY_OPTIONS = {
  slop: 0.05, // default 0.05
  restitution: 0, // default 0
  friction: 0.1, // default  0.1
  frictionStatic: 0.5, // default  0.5
  frictionAir: 0.01 // default 0.01
};

class MatterEngine extends FixedTimestepEngine {
  constructor() {
    super();

    // @private {Matter.Engine}
    this.engine = Matter.Engine.create();

    // @private {Emitter}
    this.stepEmitter = new Emitter();

    // Disable gravity (will handle the force manually)
    this.engine.world.gravity.y = 0;

    // @private {Object} - Maps {number} body.id => {Matter.Constraint}
    this.pointerConstraintMap = {};
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
    Matter.Engine.update( this.engine, 1 / 60 );

    this.stepEmitter.emit();

    // TODO:
    this.interpolationRatio = 0;
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
    options = merge( {
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
    return matrix.setToTranslationRotation( body.position.x / SCALE, body.position.y / SCALE, body.angle );
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

    const body = Matter.Body.create( merge( {
      isStatic: true,
      parts: MatterEngine.verticesToParts( vertices, {
        isStatic: true
      } )
    }, BODY_OPTIONS ) );

    // const body = Matter.Bodies.fromVertices( 0, 0, vertices.map( MatterEngine.vectorToMatter ), {
    //   isStatic: true,
    //   position: MatterEngine.vectorToMatter( Vector2.ZERO )
    // } );
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
    const body = Matter.Bodies.fromVertices( 0, 0, MatterEngine.rectangleVerties( width, height ), BODY_OPTIONS );
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
    Matter.Body.setVertices( body, MatterEngine.rectangleVerties( width, height ) );
  }

  /**
   * Creates a (dynamic) body, with the origin at the centroid.
   * @public
   * @override
   *
   * @param {Array.<Vector2>} vertices
   * @param {boolean} workaround
   * @returns {Engine.Body}
   */
  createFromVertices( vertices, workaround ) {
    return Matter.Body.create( merge( {
      parts: MatterEngine.verticesToParts( vertices )
    }, BODY_OPTIONS ) );
  }

  /**
   * Updates the vertices of a dynamic vertex-based body.
   * @public
   * @override
   *
   * @param {Engine.Body}
   * @param {Array.<Vector2>} vertices
   * @param {boolean} workaround
   */
  updateFromVertices( body, vertices, workaround ) {
    const x = body.position.x;
    const y = body.position.y;
    Matter.Body.setParts( body, MatterEngine.verticesToParts( vertices ) );
    Matter.Body.setPosition( body, Matter.Vector.create( x, y ) );
  }

  /**
   * Adds a listener to be called after each internal step.
   * @public
   * @override
   *
   * @param {function} listener
   */
  addPostStepListener( listener ) {
    this.stepEmitter.addListener( listener );
  }

  /**
   * Removes a listener to be called after each internal step.
   * @public
   * @override
   *
   * @param {function} listener
   */
  removePostStepListener( listener ) {
    this.stepEmitter.removeListener( listener );
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
   * Adds in a pointer constraint so that the body's current point at the position will stay at the position
   * (if the body is getting dragged).
   * @public
   * @override
   *
   * @param {Engine.Body} body
   * @param {Vector2} position
   */
  addPointerConstraint( body, position ) {
    const constraint = Matter.Constraint.create( {
      label: 'Pointer Constraint',
      pointA: MatterEngine.vectorToMatter( position ),
      pointB: { x: 0, y: 0 },
      bodyB: body,
      angleB: 0,
      length: 0.01,
      stiffness: 1.1, // TODO: experiment with stiffness?
      angularStiffness: 1,
      render: {
        strokeStyle: '#90EE90',
        lineWidth: 3
      }
    } );
    this.pointerConstraintMap[ body.id ] = constraint;

    // Wake it up?
    Matter.Sleeping.set( body, false );

    Matter.World.add( this.engine.world, constraint );
  }

  /**
   * Updates a pointer constraint so that the body will essentially be dragged to the new position.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   * @param {Vector2} position
   */
  updatePointerConstraint( body, position ) {
    const constraint = this.pointerConstraintMap[ body.id ];

    // Wake it up
    Matter.Sleeping.set( body, false );

    constraint.pointA = MatterEngine.vectorToMatter( position );
  }

  /**
   * Removes a pointer constraint.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   */
  removePointerConstraint( body ) {
    const constraint = this.pointerConstraintMap[ body.id ];

    constraint.bodyB = null;
    constraint.pointB = null;

    Matter.World.remove( this.engine.world, constraint );

    delete this.pointerConstraintMap[ body.id ];
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
    return Matter.Vector.create( vector.x * SCALE, vector.y * SCALE );
  }

  /**
   * Converts a Matter.Vector to a Vector2.
   * @public
   *
   * @param {Matter.Vector} vector
   * @returns {Vector2}
   */
  static matterToVector( vector ) {
    return new Vector2( vector.x / SCALE, vector.y / SCALE );
  }

  /**
   * Returns an array of parts for a matter.js body based on a section of vertices. This seems to be working better than
   * the included Matter.Bodies.fromVertices, as that had a number of quite buggy-seeming qualities.
   * @private
   *
   * @param {Array.<Vector2>} vertices
   * @param {Object} [options] - Passed to the parts
   * @returns {Array.<Matter.Body>}
   */
  static verticesToParts( vertices, options ) {
    const arrayVertices = vertices.map( v => [
      v.x,
      v.y
    ] );
    decomp.makeCCW( arrayVertices );
    return decomp.quickDecomp( arrayVertices ).map( partVertices => {
      const dotVertices = partVertices.map( v => new Vector2( v[ 0 ], v[ 1 ] ) );
      const centroid = Util.centroidOfPolygon( dotVertices );
      const matterVertices = dotVertices.map( v => v.minus( centroid ) ).map( MatterEngine.vectorToMatter );
      return Matter.Body.create( merge( {
        position: MatterEngine.vectorToMatter( centroid ),
        vertices: matterVertices
      }, BODY_OPTIONS, options ) );
    } );
  }
}

densityBuoyancyCommon.register( 'MatterEngine', MatterEngine );
export default MatterEngine;