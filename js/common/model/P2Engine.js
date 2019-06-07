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
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const Engine = require( 'DENSITY_BUOYANCY_COMMON/common/model/Engine' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const FIXED_TIME_STEP = 1 / 60;
  const MAX_SUB_STEPS = 10;

  const groundMaterial = new p2.Material();
  const dynamicMaterial = new p2.Material();

  class P2Engine extends Engine {
    constructor() {
      super();

      // @private {p2.World}
      this.world = new p2.World( {
        // TODO: can we remove this line?
        gravity: [ 0, -DensityBuoyancyCommonConstants.GRAVITATIONAL_ACCELERATION ]
      } );

      this.world.applyGravity = false;

      this.world.setGlobalStiffness( Number.MAX_VALUE );
      this.world.setGlobalRelaxation( 1 );
      this.world.solver.iterations = 20;
      this.world.solver.tolerance = 0.01;
      this.world.solver.frictionIterations = 10;

      // @private {Object} - Maps {number} body.id => {p2.RevoluteConstraint}
      this.pointerConstraintMap = {};

      // @private {Object} - Maps {number} body.id => {p2.Body}
      this.nullBodyMap = {};

      // this.world.addContactMaterial( new p2.ContactMaterial( groundMaterial, dynamicMaterial, {
      //   restitution: 0,
      //   stiffness: Number.MAX_VALUE
      // } ) );
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
     * Sets the provided matrix to the current transformation matrix of the body (to reduce allocations)
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {Matrix3} matrix
     */
    bodyGetStepMatrixTransform( body, matrix ) {
      return matrix.setToTranslationRotation( body.position[ 0 ], body.position[ 1 ], body.angle );
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
     * Applies a given force to a body (should be in the post-step listener ideally)
     * @public
     * @override
     *
     * @param {Engine.Body} body
     * @param {Vector2} velocity
     */
    bodyApplyForce( body, force ) {
      body.force[ 0 ] += force.x;
      body.force[ 1 ] += force.y;
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

      body.fromPolygon( vertices.map( v => p2.vec2.fromValues( v.x, v.y ) ) );

      // Workaround, since using Convex wasn't working
      body.shapes[ 0 ].material = groundMaterial;

      return body;
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
      const body = new p2.Body( {
        type: p2.Body.DYNAMIC,
        fixedRotation: true
      } );

      const box = new p2.Box( {
        width: width,
        height: height,
        material: dynamicMaterial
      } );

      body.addShape( box );

      return body;
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

      const vertexSign = isVertexUp ? 1 : -1;
      const cone = new p2.Convex( {
        vertices: [
          new Vector2( 0, 0.75 * vertexSign * height ),
          new Vector2( -vertexSign * radius, -0.25 * vertexSign * height ),
          new Vector2( vertexSign * radius, -0.25 * vertexSign * height )
        ].map( P2Engine.vectorToP2 )
      } );

      body.addShape( cone );

      return body;
    }

    /**
     * Creates a (dynamic) boat body, with the origin at the center of the box.
     * @public
     * @override
     *
     * @param {Array.<Vector2>} vertices
     * @returns {Engine.Body}
     */
    createBoat( vertices ) {
      const body = new p2.Body( {
        type: p2.Body.DYNAMIC,
        fixedRotation: true
      } );

      body.fromPolygon( vertices.map( v => p2.vec2.fromValues( v.x, v.y ) ) );

      // Workaround, since using Convex wasn't working
      body.shapes[ 0 ].material = dynamicMaterial;

      return body;
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
      return p2.vec2.fromValues( vector.x, vector.y );
    }

    static p2ToVector( vector ) {
      return new Vector2( vector[ 0 ], vector[ 1 ] );
    }
  }

  return densityBuoyancyCommon.register( 'P2Engine', P2Engine );
} );
