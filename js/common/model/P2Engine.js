// Copyright 2019, University of Colorado Boulder

/**
 * Abstract base type for handling physics engines
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Engine from './Engine.js';

// constants
const FIXED_TIME_STEP = 1 / 60;
const MAX_SUB_STEPS = 10;
const SCALE = 5;

const groundMaterial = new p2.Material();
const dynamicMaterial = new p2.Material();

class P2Engine extends Engine {
  constructor() {
    super();

    // @private {p2.World}
    this.world = new p2.World( {
      // TODO: can we remove this line?
    } );

    this.world.applyGravity = false;

    this.world.solver.iterations = 40;
    this.world.solver.tolerance = 0.000001;
    this.world.solver.frictionIterations = 10;
    this.world.solver.tolerance = 1e-10;

    // @private {Object} - Maps {number} body.id => {p2.RevoluteConstraint}
    this.pointerConstraintMap = {};

    // @private {Object} - Maps {number} body.id => {p2.Body}
    this.nullBodyMap = {};

    this.world.addContactMaterial( new p2.ContactMaterial( groundMaterial, dynamicMaterial, {
      restitution: 0,
      stiffness: Number.POSITIVE_INFINITY,
      relaxation: 0.5
    } ) );
    this.world.addContactMaterial( new p2.ContactMaterial( dynamicMaterial, dynamicMaterial, {
      restitution: 0,
      stiffness: Number.POSITIVE_INFINITY,
      relaxation: 0.5
    } ) );
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
    return matrix.setToTranslationRotation( body.interpolatedPosition[ 0 ] / SCALE, body.interpolatedPosition[ 1 ] / SCALE, body.interpolatedAngle );
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
    return matrix.setToTranslationRotation( body.position[ 0 ] / SCALE, body.position[ 1 ] / SCALE, body.angle );
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
    body.position[ 0 ] = position.x * SCALE;
    body.position[ 1 ] = position.y * SCALE;
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
    body.velocity[ 0 ] = velocity.x * SCALE;
    body.velocity[ 1 ] = velocity.y * SCALE;
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
    body.force[ 0 ] += force.x * SCALE;
    body.force[ 1 ] += force.y * SCALE;
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
    // TODO: yikes! we are including the timestep bit here?
    return P2Engine.p2ToVector( body.vlambda ).timesScalar( body.mass / FIXED_TIME_STEP );
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
        result.add( P2Engine.p2ToVector( equation.normalA ).timesScalar( sign * equation.multiplier ) );
      }
    }

    return result;
  }

  // TODO: doc
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

    body.fromPolygon( vertices.map( v => p2.vec2.fromValues( v.x * SCALE, v.y * SCALE ) ) );

    // Workaround, since using Convex wasn't working
    body.shapes[ 0 ].material = groundMaterial;

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
    const body = new p2.Body( {
      type: p2.Body.DYNAMIC,
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
   * @param {Engine.Body}
   * @param {number} width
   * @param {number} height
   */
  updateBox( body, width, height ) {
    P2Engine.removeShapes( body );

    const box = new p2.Box( {
      width: width * SCALE,
      height: height * SCALE,
      material: dynamicMaterial
    } );

    body.addShape( box );
  }

  /**
   * Creates a (dynamic) ellipsoid body, with the origin at the center of the ellipsoid (bounded by the width/height)
   * @public
   * @override
   *
   * @param {number} width
   * @param {number} height
   * @returns {Engine.Body}
   */
  createEllipsoid( width, height ) {
    const body = new p2.Body( {
      type: p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateEllipsoid( body, width, height );

    return body;
  }

  /**
   * Updates the width/height of a ellipsoid body.
   * @public
   * @override
   *
   * @param {Engine.Body}
   * @param {number} width
   * @param {number} height
   */
  updateEllipsoid( body, width, height ) {
    P2Engine.removeShapes( body );

    const segments = 80;
    const vertices = [];
    for ( let i = 0; i < segments; i++ ) {
      const theta = i / segments * 2 * Math.PI;

      vertices.push( P2Engine.vectorToP2( new Vector2( Math.cos( theta ) * width / 2, Math.sin( theta ) * height / 2 ) ) );
    }

    const ellipsoid = new p2.Convex( {
      vertices: vertices
    } );
    ellipsoid.material = dynamicMaterial;

    body.addShape( ellipsoid );
  }

  /**
   * Creates a (dynamic) cone body, with the origin at the center of mass
   * @public
   * @override
   *
   * @param {number} radius
   * @param {number} height
   * @param {boolean} isVertexUp
   * @returns {Engine.Body}
   */
  createCone( radius, height, isVertexUp ) {
    const body = new p2.Body( {
      type: p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateCone( body, radius, height, isVertexUp );

    return body;
  }

  /**
   * Updates the radius/height of a cone body
   * @public
   * @override
   *
   * @param {Engine.Body}
   * @param {number} radius
   * @param {number} height
   * @param {boolean} isVertexUp
   */
  updateCone( body, radius, height, isVertexUp ) {
    P2Engine.removeShapes( body );

    const vertexSign = isVertexUp ? 1 : -1;
    const cone = new p2.Convex( {
      vertices: [
        new Vector2( 0, 0.75 * vertexSign * height ),
        new Vector2( -vertexSign * radius, -0.25 * vertexSign * height ),
        new Vector2( vertexSign * radius, -0.25 * vertexSign * height )
      ].map( P2Engine.vectorToP2 )
    } );
    cone.material = dynamicMaterial;

    body.addShape( cone );
  }

  /**
   * Creates a (dynamic) vertical cylinder body, with the origin at the center of mass
   * @public
   * @override
   *
   * @param {number} radius
   * @param {number} height
   * @returns {Engine.Body}
   */
  createVerticalCylinder( radius, height ) {
    const body = new p2.Body( {
      type: p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateVerticalCylinder( body, radius, height );

    return body;
  }

  /**
   * Updates the radius/height of a vertical cylinder body
   * @public
   * @override
   *
   * @param {Engine.Body}
   * @param {number} radius
   * @param {number} height
   */
  updateVerticalCylinder( body, radius, height ) {
    P2Engine.removeShapes( body );

    const box = new p2.Box( {
      width: 2 * radius * SCALE,
      height: height * SCALE,
      material: dynamicMaterial
    } );

    body.addShape( box );
  }

  /**
   * Creates a (dynamic) horizontal cylinder body, with the origin at the center of mass
   * @public
   * @override
   *
   * @param {number} radius
   * @param {number} length
   * @returns {Engine.Body}
   */
  createHorizontalCylinder( radius, length ) {
    const body = new p2.Body( {
      type: p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateHorizontalCylinder( body, radius, length );

    return body;
  }

  /**
   * Updates the radius/length of a horizontal cylinder body
   * @public
   * @override
   *
   * @param {Engine.Body}
   * @param {number} radius
   * @param {number} length
   */
  updateHorizontalCylinder( body, radius, length ) {
    P2Engine.removeShapes( body );

    const box = new p2.Box( {
      width: length * SCALE,
      height: 2 * radius * SCALE,
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
   * @returns {Engine.Body}
   */
  createFromVertices( vertices ) {
    const body = new p2.Body( {
      type: p2.Body.DYNAMIC,
      fixedRotation: true
    } );

    this.updateFromVertices( body, vertices );

    return body;
  }

  /**
   * Updates the vertices of a dynamic vertex-based body.
   * @public
   * @override
   *
   * @param {Engine.Body}
   * @param {Array.<Vector2>} vertices
   */
  updateFromVertices( body, vertices ) {
    P2Engine.removeShapes( body );

    body.fromPolygon( vertices.map( v => p2.vec2.fromValues( v.x * SCALE, v.y * SCALE ) ) );

    // Workaround, since using Convex wasn't working
    body.shapes[ 0 ].material = dynamicMaterial;
  }

  /**
   * Adds a listener to be called after each internal step.
   * @public
   * @override
   *
   * @param {function} listener
   */
  addPostStepListener( listener ) {
    this.world.on( 'postStep', listener );
  }

  /**
   * Removes a listener to be called after each internal step.
   * @public
   * @override
   *
   * @param {function} listener
   */
  removePostStepListener( listener ) {
    this.world.off( 'postStep', listener );
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
      maxForce: 1000 * body.mass
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

  static vectorToP2( vector ) {
    return p2.vec2.fromValues( vector.x * SCALE, vector.y * SCALE );
  }

  static p2ToVector( vector ) {
    return new Vector2( vector[ 0 ] / SCALE, vector[ 1 ] / SCALE );
  }

  static removeShapes( body ) {
    while ( body.shapes.length ) {
      body.removeShape( body.shapes[ body.shapes.length - 1 ] );
    }
  }
}

densityBuoyancyCommon.register( 'P2Engine', P2Engine );
export default P2Engine;