// Copyright 2019-2020, University of Colorado Boulder

/**
 * Adapter for the p2.js physics engine
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import Engine from './Engine.js';

// constants
const FIXED_TIME_STEP = DensityBuoyancyCommonQueryParameters.p2FixedTimeStep;
const MAX_SUB_STEPS = DensityBuoyancyCommonQueryParameters.p2MaxSubSteps;
const SIZE_SCALE = DensityBuoyancyCommonQueryParameters.p2SizeScale;
const MASS_SCALE = DensityBuoyancyCommonQueryParameters.p2MassScale;

const groundMaterial = new p2.Material();
const barrierMaterial = new p2.Material();
const dynamicMaterial = new p2.Material();

class P2Engine extends Engine {
  constructor() {
    super();

    // @private {p2.World}
    this.world = new p2.World( {} );

    this.world.applyGravity = false;

    this.world.solver.iterations = DensityBuoyancyCommonQueryParameters.p2Iterations;
    this.world.solver.frictionIterations = DensityBuoyancyCommonQueryParameters.p2FrictionIterations;
    this.world.solver.tolerance = DensityBuoyancyCommonQueryParameters.p2Tolerance;

    // @private {Object} - Maps {number} body.id => {p2.RevoluteConstraint}
    this.pointerConstraintMap = {};

    // @private {Object} - Maps {number} body.id => {p2.Body}
    this.nullBodyMap = {};

    // restitution - no bounce is 0, default is 0
    // stiffness default 1e6, Number.POSITIVE_INFINITy maybe?
    //  Saw comment "We need infinite stiffness to get exact restitution" online
    // relaxation default is 4

    this.world.addContactMaterial( new p2.ContactMaterial( groundMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2GroundStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2GroundRelaxation
    } ) );
    this.world.addContactMaterial( new p2.ContactMaterial( dynamicMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2DynamicStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2DynamicRelaxation
    } ) );
    this.world.addContactMaterial( new p2.ContactMaterial( barrierMaterial, dynamicMaterial, {
      restitution: DensityBuoyancyCommonQueryParameters.p2Restitution,
      stiffness: DensityBuoyancyCommonQueryParameters.p2BarrierStiffness,
      relaxation: DensityBuoyancyCommonQueryParameters.p2BarrierRelaxation
    } ) );

    // @private {TinyEmitter}
    this.internalStepEmitter = new TinyEmitter();

    this.world.on( 'postStep', () => {
      this.internalStepEmitter.emit( this.world.lastTimeStep );
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
    this.interpolationRatio = ( this.world.accumulator % FIXED_TIME_STEP ) / FIXED_TIME_STEP;
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
    options = merge( {
      // {boolean} - optional
      canRotate: false
    }, options );

    body.mass = mass * MASS_SCALE;

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
    return matrix.setToTranslationRotation( body.interpolatedPosition[ 0 ] / SIZE_SCALE, body.interpolatedPosition[ 1 ] / SIZE_SCALE, body.interpolatedAngle );
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
    return matrix.setToTranslationRotation( body.position[ 0 ] / SIZE_SCALE, body.position[ 1 ] / SIZE_SCALE, body.angle );
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
    body.position[ 0 ] = position.x * SIZE_SCALE;
    body.position[ 1 ] = position.y * SIZE_SCALE;
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
    body.velocity[ 0 ] = velocity.x * SIZE_SCALE;
    body.velocity[ 1 ] = velocity.y * SIZE_SCALE;
  }

  /**
   * Applies a given force to a body (should be in the post-step listener ideally)
   * @public
   * @override
   *
   * @param {Engine.Body} body
   * @param {Vector2} force
   */
  bodyApplyForce( body, force ) {
    body.force[ 0 ] += force.x * SIZE_SCALE * MASS_SCALE;
    body.force[ 1 ] += force.y * SIZE_SCALE * MASS_SCALE;
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
    return P2Engine.p2ToVector( body.vlambda ).timesScalar( body.mass / FIXED_TIME_STEP / MASS_SCALE );
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
    const result = Vector2.ZERO.copy();
    const equations = this.world.narrowphase.contactEquations;

    for ( let i = 0; i < equations.length; i++ ) {
      const equation = equations[ i ];

      let sign = 0;
      if ( bodyA === equation.bodyA && bodyB === equation.bodyB ) {
        sign = 1;
      }
      if ( bodyA === equation.bodyB && bodyB === equation.bodyA ) {
        sign = -1;
      }

      if ( sign ) {
        result.add( P2Engine.p2ToVector( equation.normalA ).timesScalar( sign * equation.multiplier / MASS_SCALE ) );
      }
    }

    return result;
  }

  /**
   * Resets the contact forces that have happened on a body to 0 after measurement.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   */
  resetContactForces( body ) {
    body.vlambda[ 0 ] = 0;
    body.vlambda[ 1 ] = 0;
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
    const body = new p2.Body( {
      type: p2.Body.STATIC,
      mass: 0
    } );

    body.fromPolygon( vertices.map( P2Engine.vectorToP2 ) );

    // Workaround, since using Convex wasn't working
    body.shapes.forEach( shape => {
      shape.material = groundMaterial;
    } );

    return body;
  }

  /**
   * Creates a (static) barrier body with the given vertices.
   * @public
   * @override
   *
   * @param {Array.<Vector2>} vertices
   * @returns {Engine.Body}
   */
  createBarrier( vertices ) {
    const body = new p2.Body( {
      type: p2.Body.STATIC,
      mass: 0
    } );

    body.fromPolygon( vertices.map( P2Engine.vectorToP2 ) );

    // Workaround, since using Convex wasn't working
    body.shapes.forEach( shape => {
      shape.material = barrierMaterial;
    } );

    return body;
  }

  /**
   * Creates a (dynamic) box body, with the origin at the center of the box.
   * @public
   * @override
   *
   * @param {number} width
   * @param {number} height
   * @param {boolean} [isStatic]
   * @returns {Engine.Body}
   */
  createBox( width, height, isStatic ) {
    const body = new p2.Body( {
      type: isStatic ? p2.Body.STATIC : p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateBox( body, width, height );

    return body;
  }

  /**
   * Updates the width/height of a box body.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   * @param {number} width
   * @param {number} height
   */
  updateBox( body, width, height ) {
    P2Engine.removeShapes( body );

    const box = new p2.Box( {
      width: width * SIZE_SCALE,
      height: height * SIZE_SCALE,
      material: dynamicMaterial
    } );

    body.addShape( box );
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
    const body = new p2.Body( {
      type: p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateFromVertices( body, vertices, workaround );

    return body;
  }

  /**
   * Updates the vertices of a dynamic vertex-based body.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   * @param {Array.<Vector2>} vertices
   * @param {boolean} workaround
   */
  updateFromVertices( body, vertices, workaround ) {
    P2Engine.removeShapes( body );

    if ( workaround ) {
      body.fromPolygon( vertices.map( v => p2.vec2.fromValues( v.x * SIZE_SCALE, v.y * SIZE_SCALE ) ) );

      // Workaround, since using Convex wasn't working
      body.shapes.forEach( shape => {
        shape.material = groundMaterial;
      } );
    }
    else {
      const shape = new p2.Convex( {
        vertices: vertices.map( P2Engine.vectorToP2 )
      } );

      shape.material = dynamicMaterial;

      body.addShape( shape );
    }
  }

  /**
   * Adds a listener to be called after each internal step.
   * @public
   * @override
   *
   * @param {function(number)} listener
   */
  addPostStepListener( listener ) {
    this.internalStepEmitter.addListener( listener );
  }

  /**
   * Removes a listener to be called after each internal step.
   * @public
   * @override
   *
   * @param {function(number)} listener
   */
  removePostStepListener( listener ) {
    this.internalStepEmitter.removeListener( listener );
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
    const nullBody = new p2.Body();
    this.nullBodyMap[ body.id ] = nullBody;

    const globalPoint = P2Engine.vectorToP2( position );
    const localPoint = p2.vec2.create();
    body.toLocalFrame( localPoint, globalPoint );
    this.world.addBody( nullBody );

    body.wakeUp();

    const pointerConstraint = new p2.RevoluteConstraint( nullBody, body, {
      localPivotA: globalPoint,
      localPivotB: localPoint,
      maxForce: DensityBuoyancyCommonQueryParameters.p2PointerMassForce * body.mass + DensityBuoyancyCommonQueryParameters.p2PointerBaseForce
    } );
    this.pointerConstraintMap[ body.id ] = pointerConstraint;
    this.world.addConstraint( pointerConstraint );
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
    const pointerConstraint = this.pointerConstraintMap[ body.id ];
    assert && assert( pointerConstraint );

    p2.vec2.copy( pointerConstraint.pivotA, P2Engine.vectorToP2( position ) );
    pointerConstraint.bodyA.wakeUp();
    pointerConstraint.bodyB.wakeUp();
  }

  /**
   * Removes a pointer constraint.
   * @public
   * @override
   *
   * @param {Engine.Body} body
   */
  removePointerConstraint( body ) {
    const nullBody = this.nullBodyMap[ body.id ];
    const pointerConstraint = this.pointerConstraintMap[ body.id ];

    this.world.removeConstraint( pointerConstraint );
    this.world.removeBody( nullBody );

    delete this.nullBodyMap[ body.id ];
    delete this.pointerConstraintMap[ body.id ];
  }

  /**
   * Converts a Vector2 to a p2.vec2, for use with p2.js
   * @private
   *
   * @param {Vector2} vector
   * @returns {p2.vec2}
   */
  static vectorToP2( vector ) {
    return p2.vec2.fromValues( vector.x * SIZE_SCALE, vector.y * SIZE_SCALE );
  }

  /**
   * Converts a p2.vec2 to a Vector2
   * @private
   *
   * @param {p2.vec2} vector
   * @returns {Vector2}
   */
  static p2ToVector( vector ) {
    return new Vector2( vector[ 0 ] / SIZE_SCALE, vector[ 1 ] / SIZE_SCALE );
  }

  /**
   * Helper method that removes all shapes from a given body.
   * @private
   *
   * @param {Engine.Body} body
   */
  static removeShapes( body ) {
    while ( body.shapes.length ) {
      body.removeShape( body.shapes[ body.shapes.length - 1 ] );
    }
  }
}

densityBuoyancyCommon.register( 'P2Engine', P2Engine );
export default P2Engine;