// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AreaMarker = require( 'DENSITY_BUOYANCY_COMMON/common/model/AreaMarker' );
  const Bounds3 = require( 'DOT/Bounds3' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DensityBuoyancyCommonQueryParameters = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonQueryParameters' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const MatterEngine = require( 'DENSITY_BUOYANCY_COMMON/common/model/MatterEngine' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const P2Engine = require( 'DENSITY_BUOYANCY_COMMON/common/model/P2Engine' );
  const Vector2 = require( 'DOT/Vector2' );

  class DemoModel  {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // @public {Bounds3}
      this.poolBounds = new Bounds3(
        -3, -4, -1,
        3, 0, 1
      );

      // @public {Bounds3}
      this.groundBounds = new Bounds3(
        -10, -10, -1,
        10, 0, 1
      );

      // TODO: make naming between actual and interpolated values!

      // @public {Array.<Vector2>}
      this.groundPoints = [
        new Vector2( this.groundBounds.minX, this.groundBounds.minY ),
        new Vector2( this.groundBounds.maxX, this.groundBounds.minY ),
        new Vector2( this.groundBounds.maxX, this.groundBounds.maxY ),
        new Vector2( this.poolBounds.maxX, this.poolBounds.maxY ),
        new Vector2( this.poolBounds.maxX, this.poolBounds.minY ),
        new Vector2( this.poolBounds.minX, this.poolBounds.minY ),
        new Vector2( this.poolBounds.minX, this.poolBounds.maxY ),
        new Vector2( this.groundBounds.minX, this.groundBounds.maxY )
      ];

      // @public {Property.<number>}
      this.liquidDensityProperty = new NumberProperty( Material.WATER.density );

      // @public {Property.<number>}
      this.liquidViscosityProperty = new NumberProperty( Material.WATER.viscosity );

      // @public {Property.<number>}
      this.liquidVolumeProperty = new NumberProperty( 0.75 * this.poolBounds.width * this.poolBounds.height * this.poolBounds.depth );

      // @public {Property.<number>} - The y coordinate of the main liquid level in the pool
      this.liquidYProperty = new NumberProperty( this.poolBounds.minY + this.liquidVolumeProperty.value / ( this.poolBounds.width * this.poolBounds.depth ) );

      // @private {number}
      this.previousLiquidY = this.liquidYProperty.value;
      this.currentLiquidY = this.liquidYProperty.value;

      const engineType = DensityBuoyancyCommonQueryParameters.engine;
      assert( engineType === 'p2' || engineType === 'matter' );
      this.engine = engineType === 'p2' ? new P2Engine() : new MatterEngine();

      // @public {Engine.Body}
      this.groundBody = this.engine.createGround( this.groundPoints );
      this.engine.addBody( this.groundBody );

      // @public {ObservableArray.<Mass>}
      this.masses = new ObservableArray();
      this.masses.addItemAddedListener( mass => {
        this.engine.addBody( mass.body );
      } );
      this.masses.addItemRemovedListener( mass => {
        this.engine.removeBody( mass.body );
      } );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.3, -0.3, -0.3, 0.3, 0.3, 0.3 ), {
        matrix: Matrix3.translation( -1.5, 0.5 ),
        material: Material.BRICK,
        volume: 1,
        canRotate: false
      } ) );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.5, -0.5, -0.5, 0.5, 0.5, 0.5 ), {
        matrix: Matrix3.translation( 0, 0.5 ),
        material: Material.ICE,
        volume: 1,
        canRotate: false
      } ) );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.7, -0.7, -0.7, 0.7, 0.7, 0.7 ), {
        matrix: Matrix3.translation( 1.5, 0.5 ),
        material: Material.WOOD,
        volume: 1,
        canRotate: false
      } ) );

      this.engine.addPostStepListener( () => {
        this.updateLiquidY();

        this.masses.forEach( mass => {
          // TODO: should we step the liquid y here for stability?
          const submergedVolume = mass.getSubmergedVolume( this.currentLiquidY );
          if ( submergedVolume ) {
            const displacedMass = submergedVolume * this.liquidDensityProperty.value;
            const buoyantForce = displacedMass * DensityBuoyancyCommonConstants.GRAVITATIONAL_ACCELERATION;
            this.engine.bodyApplyForce( mass.body, new Vector2( 0, buoyantForce ) );

            const velocity = this.engine.bodyGetVelocity( mass.body );
            this.engine.bodyApplyForce( mass.body, velocity.times( -this.liquidViscosityProperty.value ) );
          }

          // Gravity
          this.engine.bodyApplyForce( mass.body, new Vector2( 0, -mass.massProperty.value * DensityBuoyancyCommonConstants.GRAVITATIONAL_ACCELERATION ) );
        } );
      } );
    }

    /**
     * Computes the y-value of the top of the main pool's liquid.
     * @private
     */
    updateLiquidY() {
      const areaMarkers = [];
      this.masses.forEach( mass => mass.pushAreaMarkers( areaMarkers ) );
      AreaMarker.sortMarkers( areaMarkers );

      let y = this.poolBounds.minY;
      let area = this.poolBounds.width * this.poolBounds.depth;
      let remainingVolume = this.liquidVolumeProperty.value;
      let finished = false;

      for ( let i = 0; i < areaMarkers.length; i++ ) {
        const areaMarker = areaMarkers[ i ];

        if ( !finished ) {
          // Handle simultaneous (or almost equivalent) markers without processing
          if ( areaMarker.y > y ) {
            const chunkHeight = areaMarker.y - y;
            const chunkVolume = chunkHeight * area;
            if ( remainingVolume <= chunkVolume ) {
              y += ( remainingVolume / chunkVolume ) * chunkHeight;
              remainingVolume = 0; // TODO: can we just remove this?
              finished = true;
            }
            else {
              y = areaMarker.y;
              remainingVolume -= chunkVolume;
            }
          }
          area -= areaMarker.delta;
        }

        areaMarker.freeToPool();
      }

      if ( !finished ) {
        y += remainingVolume / area;
      }

      this.previousLiquidY = this.currentLiquidY;
      this.currentLiquidY = y;
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

      this.liquidYProperty.value = this.previousLiquidY + this.engine.interpolationRatio * ( this.currentLiquidY - this.previousLiquidY );

      this.masses.forEach( mass => {
        mass.step( dt );
      } );
    }
  }

  return densityBuoyancyCommon.register( 'DemoModel', DemoModel );
} );
