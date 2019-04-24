// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );

  /**
   * @constructor
   */
  class DemoModel  {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // @public {number}
      this.leftX = -300;
      this.rightX = 300;
      this.groundY = 0;
      this.poolY = -400;
      this.farLeftX = -1000;
      this.farRightX = 1000;
      this.farBelow = -1000;

      // @private {Matter.Engine}
      this.engine = Matter.Engine.create();
      this.engine.world.gravity.y = -1; // So that it's physical with positive y up

      // @public {Array.<Matter.Body>}
      this.groundBodies = [
        DemoModel.staticBodyFromBounds( new Bounds2( this.farLeftX, this.farBelow, this.leftX, this.groundY ) ),
        DemoModel.staticBodyFromBounds( new Bounds2( this.leftX, this.farBelow, this.rightX, this.poolY ) ),
        DemoModel.staticBodyFromBounds( new Bounds2( this.rightX, this.farBelow, this.farRightX, this.groundY ) )
      ];

      // @public {Array.<Matter.Body>}
      this.mobileBodies = [
        DemoModel.bodyFromRectangle( 290, 50, 100, 100 )
      ];
      Matter.Body.setMass( this.mobileBodies[ 0 ], 20 );
      Matter.Body.setInertia( this.mobileBodies[ 0 ], Number.POSITIVE_INFINITY );

      // @public {Array.<Matter.Body>}
      this.bodies = [ ...this.groundBodies, ...this.mobileBodies ];

      Matter.World.add( this.engine.world, this.bodies );

      // MouseConstraint (stiffness)
    }

    // @public resets the model
    reset() {
      //TODO Reset things here.
    }

    // @public
    step( dt ) {
      Matter.Engine.update( this.engine, dt * 1000 );
    }

    static bodyFromRectangle( centerX, centerY, width, height ) {
      return Matter.Bodies.rectangle( centerX, centerY, width, height );
    }

    static staticBodyFromBounds( bounds ) {
      return Matter.Bodies.rectangle( bounds.centerX, bounds.centerY, bounds.width, bounds.height, {
        isStatic: true
      } );
      // return Matter.Bodies.fromVertices( 0, 0, [
      //   Matter.Vector.create( bounds.minX, bounds.minY ),
      //   Matter.Vector.create( bounds.minX, bounds.maxY ),
      //   Matter.Vector.create( bounds.maxX, bounds.maxY ),
      //   Matter.Vector.create( bounds.maxX, bounds.minY )
      // ], {
      //   isStatic: true
      // } );
    }
  }

  return densityBuoyancyCommon.register( 'DemoModel', DemoModel );
} );
