// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const Bounds3 = require( 'DOT/Bounds3' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const MatterUtil = require( 'DENSITY_BUOYANCY_COMMON/common/MatterUtil' );

  /**
   * @constructor
   */
  class DemoModel  {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // @private {number}
      // this.lastDT = 1000 / 60;

      // @public {number}
      this.leftX = -3;
      this.rightX = 3;
      this.groundY = 0;
      this.poolY = -4;
      this.farLeftX = -10;
      this.farRightX = 10;
      this.farBelow = -10;

      // @private {Matter.Engine}
      this.engine = Matter.Engine.create();
      this.engine.world.gravity.y = -1; // So that it's physical with positive y up
      this.engine.world.gravity.scale = 1 / ( DensityBuoyancyCommonConstants.MATTER_SIZE_SCALE * 9.8 );

      // @public {Array.<Matter.Body>}
      this.groundBodies = [
        // TODO: format
        MatterUtil.staticBodyFromBounds( new Bounds2( this.farLeftX, this.farBelow, this.leftX, this.groundY ) ),
        MatterUtil.staticBodyFromBounds( new Bounds2( this.leftX, this.farBelow, this.rightX, this.poolY ) ),
        MatterUtil.staticBodyFromBounds( new Bounds2( this.rightX, this.farBelow, this.farRightX, this.groundY ) )
      ];
      Matter.World.add( this.engine.world, this.groundBodies );

      // @public {ObservableArray.<Mass>}
      this.masses = new ObservableArray();
      this.masses.addItemAddedListener( mass => {
        Matter.World.add( this.engine.world, mass.body );
      } );
      this.masses.addItemRemovedListener( mass => {
        Matter.World.remove( this.engine.world, mass.body );
      } );

      this.masses.push( new Cuboid( new Bounds3( -0.5, -0.5, -0.5, 0.5, 0.5, 0.5 ), {
        matrix: Matrix3.translation( 2.9, 0.5 ),
        // matrix: Matrix3.translation( 0, 0.5 ),
        material: Material.BRICK,
        volume: 1,
        canRotate: true
      } ) );

      // MouseConstraint (stiffness)
    }

    /**
     * Resets things to their original values.
     * @public
     */
    reset() {
      this.masses.forEach( mass => mass.reset() );
    }

    /**
     * Steps forward in time.
     * @public
     *
     * @param {number} dt
     */
    step( dt ) {
      Matter.Engine.update( this.engine, 1000 / 60 );

      this.masses.forEach( mass => {
        mass.step( dt );
      } );
    }
  }

  return densityBuoyancyCommon.register( 'DemoModel', DemoModel );
} );
