// Copyright 2019-2020, University of Colorado Boulder

/**
 * Adapter for the planck.js physics engine
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Engine from './Engine.js';

// constants
const SCALE = 5;
const FIXED_TIME_STEP = 1 / 60;

let globalBodyId = 0;

class PlanckEngine extends Engine {
  constructor() {
    super();

    // @private {planck.World}
    this.world = planck.World( {
      gravity: PlanckEngine.vectorToPlanck( Vector2.ZERO )

      // allowSleep: true,
      // warmStarting: true,
      // continuousPhysics: true,
      // subStepping: false,
      // blockSolve: true,
      // velocityIterations: 8,
      // positionIterations: 3
    } );

    // @private {Emitter}
    this.stepEmitter = new Emitter();

    // @private {Object} - Maps {number} body.id => {planck.Body}
    this.nullBodyMap = {};

    // @private {Object} - Maps {number} body.id => {planck.MouseJoint}
    this.mouseJointMap = {};
  }

  /**
   * Steps forward in time.
   * @public
   * @override
   *
   * @param {number} dt
   */
  step( dt ) {
    // TODO: interpolate this
    this.world.step( FIXED_TIME_STEP, 8, 3 );
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
    body.setActive( true );
  }

  /**
   * Removes a body from the engine, so that it will not be tracked during the step anymore.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   */
  removeBody( body ) {
    body.setActive( false );

    // TODO: destroy!! add a disposeBody
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

    body.setMassData( {
      mass: mass,
      center: PlanckEngine.vectorToPlanck( Vector2.ZERO ),
      I: options.canRotate ? 1 : Number.POSITIVE_INFINITY
    } );
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
    // TODO: do we need to handle interpolation ourself?
    const position = body.getPosition();
    return matrix.setToTranslationRotation( position.x / SCALE, position.y / SCALE, body.getAngle() );
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
    const position = body.getPosition();
    return matrix.setToTranslationRotation( position.x / SCALE, position.y / SCALE, body.getAngle() );
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
    body.setPosition( PlanckEngine.vectorToPlanck( position ) );
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
    body.setAngle( rotation );
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
    return body.getAngularVelocity();
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
    body.setAngularVelocity( angularVelocity );
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
    return PlanckEngine.planckToVector( body.getLinearVelocity() );
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
    body.setLinearVelocity( PlanckEngine.vectorToPlanck( velocity ) );
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
    body.applyForceToCenter( PlanckEngine.vectorToPlanck( force ) );
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
    return Vector2.ZERO; // TODO
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
    return Vector2.ZERO; // TODO
  }

  // TODO: doc
  resetContactForces( body ) {
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
    const body = this.world.createBody( {
      type: 'static',
      fixedRotation: false,
      userData: {
        id: globalBodyId++
      }

      // type: staticBody,
      // position: Vec2.zero(),
      // angle: 0,
      // linearVelocity: Vec2.zero(),
      // angularVelocity: 0,
      // linearDamping: 0,
      // angularDamping: 0,
      // bullet: false,
      // gravityScale: 1,
      // allowSleep: true,
      // awake: true,
      // active: true,
    } );

    PlanckEngine.decompToPlank( vertices ).forEach( convexVertices => {
      body.createFixture( planck.Polygon( convexVertices ), {
        // userData: null,
        // friction: .2,
        // restitution: 0,
        // density: 0,
        // isSensor: false,
        // filterGroupIndex: 0,
        // filterCategoryBits: 1,
        // filterMaskBits: 65535
      } );
    } );

    body.setActive( false );

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
    const body = this.world.createBody( {
      type : 'dynamic',
      fixedRotation: true,
      userData: {
        id: globalBodyId++
      }
    } );

    this.updateBox( body, width, height );

    body.setActive( false );

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
    while ( body.getFixtureList() ) {
      body.destroyFixture( body.getFixtureList() );
    }

    // body.createFixture( planck.Polygon( [
    //   -width * SCALE / 2, -height * SCALE / 2,
    //   width * SCALE / 2, -height * SCALE / 2,
    //   width * SCALE / 2, height * SCALE / 2,
    //   -width * SCALE / 2, height * SCALE / 2
    // ].map( PlanckEngine.vectorToPlanck ) ), {
    body.createFixture( planck.Box( width * SCALE / 2, height * SCALE / 2 ), {
      // TODO: eek, what happensthere?
      // density: 1

      // userData: null,
      // friction: .2,
      // restitution: 0,
      // isSensor: false,
      // filterGroupIndex: 0,
      // filterCategoryBits: 1,
      // filterMaskBits: 65535
    } );
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
    const body = this.world.createBody( {
      type : 'dynamic',
      fixedRotation: true,
      userData: {
        id: globalBodyId++
      }
    } );

    this.updateFromVertices( body, vertices, workaround );

    body.setActive( false );

    return body;
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
    while ( body.getFixtureList() ) {
      body.destroyFixture( body.getFixtureList() );
    }

    PlanckEngine.decompToPlank( vertices ).forEach( convexVertices => {
      body.createFixture( planck.Polygon( convexVertices ), {
        // TODO: eek, what happensthere?
        // density: 1

        // userData: null,
        // friction: .2,
        // restitution: 0,
        // isSensor: false,
        // filterGroupIndex: 0,
        // filterCategoryBits: 1,
        // filterMaskBits: 65535
      } );
    } );
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
   * Adds in a pointer constraint so that the body's current point at the position will stay at the position
   * (if the body is getting dragged).
   * @public
   * @override
   *
   * @param {Engine.Body} body
   * @param {Vector2} position
   */
  addPointerConstraint( body, position ) {

    const nullBody = this.world.createBody();
    this.nullBodyMap[ body.getUserData().id ] = nullBody;

    const mouseJoint = planck.MouseJoint( { maxForce: 10000 }, nullBody, body, PlanckEngine.vectorToPlanck( position ) );
    this.world.createJoint( mouseJoint );
    this.mouseJointMap[ body.getUserData().id ] = mouseJoint;
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
    this.mouseJointMap[ body.getUserData().id ].setTarget( PlanckEngine.vectorToPlanck( position ) );
  }

  /**
   * Removes a pointer constraint.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   */
  removePointerConstraint( body ) {
    this.world.destroyJoint( this.mouseJointMap[ body.getUserData().id ] );
    delete[ this.mouseJointMap[ body.getUserData().id ] ];

    this.world.destroyBody( this.nullBodyMap[ body.getUserData().id ] );
    delete[ this.nullBodyMap[ body.getUserData().id ] ];
  }

  /**
   * Converts a Vector2 to a planck.Vec2, for use with planck.js
   * @private
   *
   * @param {Vector2} vector
   * @returns {planck.Vec2}
   */
  static vectorToPlanck( vector ) {
    return planck.Vec2( vector.x * SCALE, vector.y * SCALE );
  }

  /**
   * Converts a planck.Vec2 to a Vector2
   * @private
   *
   * @param {planck.Vec2} vector
   * @returns {Vector2}
   */
  static planckToVector( vector ) {
    return new Vector2( vector.x / SCALE, vector.x / SCALE );
  }

  static decompToPlank( vertices ) {
    return decomp.quickDecomp( vertices.map( v => [
      v.x * SCALE,
      v.y * SCALE
    ] ) ).map( list => list.map( v => planck.Vec2( v[ 0 ], v[ 1 ] ) ));
  }
}

densityBuoyancyCommon.register( 'PlanckEngine', PlanckEngine );
export default PlanckEngine;