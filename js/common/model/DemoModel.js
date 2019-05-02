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
  const DensityBuoyancyCommonQueryParameters = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonQueryParameters' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const MatterEngine = require( 'DENSITY_BUOYANCY_COMMON/common/model/MatterEngine' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const P2Engine = require( 'DENSITY_BUOYANCY_COMMON/common/model/P2Engine' );

  /**
   * @constructor
   */
  class DemoModel  {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // @public {number}
      this.leftX = -3;
      this.rightX = 3;
      this.groundY = 0;
      this.poolY = -4;
      this.farLeftX = -10;
      this.farRightX = 10;
      this.farBelow = -10;

      const engineType = DensityBuoyancyCommonQueryParameters.engine;
      assert( engineType === 'p2' || engineType === 'matter' );
      this.engine = engineType === 'p2' ? new P2Engine() : new MatterEngine();

      // @public {Array.<Engine.Body>}
      this.groundBodies = [
        this.engine.createBoundsBody( new Bounds2( this.farLeftX, this.farBelow, this.leftX, this.groundY ), {
          isStatic: true
        } ),
        this.engine.createBoundsBody( new Bounds2( this.leftX, this.farBelow, this.rightX, this.poolY ), {
          isStatic: true
        } ),
        this.engine.createBoundsBody( new Bounds2( this.rightX, this.farBelow, this.farRightX, this.groundY ), {
          isStatic: true
        } )
      ];
      // TODO: composites in the abstraction
      this.groundBodies.forEach( body => this.engine.addBody( body ) );

      // @public {ObservableArray.<Mass>}
      this.masses = new ObservableArray();
      this.masses.addItemAddedListener( mass => {
        this.engine.addBody( mass.body );
      } );
      this.masses.addItemRemovedListener( mass => {
        this.engine.removeBody( mass.body );
      } );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.5, -0.5, -0.5, 0.5, 0.5, 0.5 ), {
        matrix: Matrix3.translation( 2.7, 0.5 ),
        material: Material.BRICK,
        volume: 1,
        canRotate: true
      } ) );
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
      this.engine.step( dt );

      this.masses.forEach( mass => {
        mass.step( dt );
      } );
    }
  }

  return densityBuoyancyCommon.register( 'DemoModel', DemoModel );
} );
