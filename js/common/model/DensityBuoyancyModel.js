// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Boat = require( 'DENSITY_BUOYANCY_COMMON/common/model/Boat' );
  const Bounds3 = require( 'DOT/Bounds3' );
  const Cone = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cone' );
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

  class DensityBuoyancyModel  {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // @public {Bounds3}
      this.poolBounds = new Bounds3(
        -3, -4, -1.5,
        3, 0, 1.5
      );

      // @public {Bounds3}
      this.groundBounds = new Bounds3(
        -20, -20, -10,
        20, 0, 1.5
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

      this.masses.push( new Boat( this.engine, new Bounds3( -1, -1, -1, 1, 1, 1 ), 0.05, {
        matrix: Matrix3.translation( -1.8, 0 ),
        material: Material.ALUMINUM
      } ) );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.3, -0.3, -0.3, 0.3, 0.3, 0.3 ), {
        matrix: Matrix3.translation( -1.5, -2 ),
        material: Material.BRICK
      } ) );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.5, -0.5, -0.5, 0.5, 0.5, 0.5 ), {
        matrix: Matrix3.translation( 0, 0.5 ),
        material: Material.ICE
      } ) );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.7, -0.7, -0.7, 0.7, 0.7, 0.7 ), {
        matrix: Matrix3.translation( 1.5, 0.5 ),
        material: Material.WOOD
      } ) );

      this.masses.push( new Cone( this.engine, 0.5, 1, true, {
        matrix: Matrix3.translation( 1.5, 3 ),
        material: Material.WOOD
      } ) );

      this.engine.addPostStepListener( () => {
        this.updateLiquid();

        this.masses.forEach( mass => {
          // TODO: should we step the liquid y here for stability?
          const submergedVolume = mass.getDisplacedBuoyantVolume( this.currentLiquidY );
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

    getDisplacedPoolVolume( y, boat ) {
      assert && assert( boat || boat === null );

      let volume = 0;
      this.masses.forEach( mass => {
        const mightBeInBoat = boat && mass.alignedWithBoat;

        if ( !mightBeInBoat ) {
          volume += mass.getDisplacedVolume( y );
        }
        else if ( y > boat.stepTop ) {
          volume += mass.getDisplacedVolume( y );
          volume -= mass.getDisplacedVolume( boat.stepTop );
        }
      } );
      return volume;
    }

    getEmptyPoolVolume( y, boat ) {
      assert && assert( boat || boat === null );

      return this.poolBounds.width * this.poolBounds.depth * ( y - this.poolBounds.minY ) - this.getDisplacedPoolVolume( y, boat );
    }

    getDisplacedPoolArea( y, boat ) {
      assert && assert( boat || boat === null );

      let area = 0;
      this.masses.forEach( mass => {
        if ( boat && mass.alignedWithBoat && y >= boat.stepBottom && y <= boat.stepTop ) {
          area += 0;
        }
        else {
          area += mass.getDisplacedArea( y );
        }
      } );
      return area;
    }

    getEmptyPoolArea( y, boat ) {
      assert && assert( boat || boat === null );

      return this.poolBounds.width * this.poolBounds.depth - this.getDisplacedPoolArea( y, boat );
    }

    getDisplacedBoatVolume( y, boat ) {
      assert && assert( boat || boat === null );

      let volume = 0;
      y = Math.min( y, boat.stepTop );
      this.masses.forEach( mass => {
        if ( mass.alignedWithBoat ) {
          volume += mass.getDisplacedVolume( y );
        }
      } );
      return volume;
    }

    getEmptyBoatVolume( y, boat ) {
      assert && assert( boat || boat === null );

      return boat.boatInternalArea * ( y - boat.boatInternalBottom ) - this.getDisplacedBoatVolume( y, boat );
    }

    getDisplacedBoatArea( y, boat ) {
      assert && assert( boat || boat === null );

      let area = 0;
      this.masses.forEach( mass => {
        if ( mass.alignedWithBoat && y >= boat.stepBottom && y <= boat.stepTop ) {
          area += mass.getDisplacedArea( y );
        }
      } );
      return area;
    }

    getEmptyBoatArea( y, boat ) {
      assert && assert( boat || boat === null );

      return boat.boatInternalArea - this.getDisplacedBoatArea( y, boat );
    }

    /**
     * Computes the heights of the main pool liquid (and optionally that of the boat)
     * @private
     */
    updateLiquid() {
      const boat = _.find( this.masses.getArray(), mass => mass.isBoat() ) || null;

      const criticalPoints = [];

      this.masses.forEach( mass => {
        mass.updateStepInformation();
        criticalPoints.push( mass.stepBottom );
        criticalPoints.push( mass.stepTop );
      } );
      criticalPoints.sort( ( a, b ) => a - b ); // TODO: is this the default sort?

      this.masses.forEach( mass => {
        mass.alignedWithBoat = boat && boat !== mass && boat.stepBottom < mass.stepBottom && boat.boatMinX <= mass.stepX && mass.stepX <= boat.boatMaxX;
      } );

      const poolArea = this.poolBounds.width * this.poolBounds.depth;
      let poolLiquidVolume = this.liquidVolumeProperty.value;
      let boatLiquidVolume = boat ? boat.currentLiquidVolume : 0;

      // May need to adjust volumes between the boat/pool if there is a boat
      if ( boat ) {

        const poolEmptyVolumeToBoatTop = this.getEmptyPoolVolume( boat.stepTop, boat );
        const boatEmptyVolumeToBoatTop = this.getEmptyBoatVolume( boat.stepTop, boat );

        const poolExcess = poolLiquidVolume - poolEmptyVolumeToBoatTop;
        const boatExcess = boatLiquidVolume - boatEmptyVolumeToBoatTop;

        if ( poolExcess > 0 && boatExcess < 0 ) {
          const transferVolume = Math.min( poolExcess, -boatExcess );
          poolLiquidVolume -= transferVolume;
          boatLiquidVolume += transferVolume;
        }
        if ( poolExcess < 0 && boatExcess > 0 ) {
          const transferVolume = Math.min( -poolExcess, boatExcess );
          poolLiquidVolume += transferVolume;
          boatLiquidVolume -= transferVolume;
        }

        boat.previousLiquidVolume = boat.currentLiquidVolume;
        boat.currentLiquidVolume = boatLiquidVolume;
      }

      // Check to see if water "spilled" out of the pool
      const totalEmptyPoolVolumeToTop = this.getEmptyPoolVolume( this.poolBounds.maxY, boat );
      if ( poolLiquidVolume > totalEmptyPoolVolumeToTop ) {
        poolLiquidVolume = totalEmptyPoolVolumeToTop;
      }

      // TODO: animation handling for actual volume in the pool? OR DO WE NOT NEED, only care about the y?
      this.liquidVolumeProperty.value = poolLiquidVolume;

      // Handle the pool liquid y
      let y = this.poolBounds.minY;
      let currentEmptyVolume = this.getEmptyPoolVolume( y, boat ); // TODO: how to handle things slightly below pool bottom. like this?
      let finished = false;
      for ( let i = 0; i < criticalPoints.length; i++ ) {
        const criticalPoint = criticalPoints[ i ];

        if ( criticalPoint > y ) {
          const emptyVolume = this.getEmptyPoolVolume( criticalPoint, boat );
          if ( emptyVolume >= poolLiquidVolume ) {
            y = DensityBuoyancyModel.findRoot(
              y,
              criticalPoint,
              1e-7,
              yTest => this.getEmptyPoolVolume( yTest, boat ) - poolLiquidVolume,
              yTest => this.getEmptyPoolArea( yTest, boat )
            );
            currentEmptyVolume = this.getEmptyPoolVolume( y, boat );
            finished = true;
            break;
          }
          else {
            y = criticalPoint;
            currentEmptyVolume = emptyVolume;
          }
        }
      }
      if ( !finished ) {
        y += ( poolLiquidVolume - currentEmptyVolume ) / poolArea;
      }
      this.previousLiquidY = this.currentLiquidY;
      this.currentLiquidY = y;

      // Handle the boat liquid y
      if ( boat ) {
        let y = boat.stepBottom;
        let currentEmptyVolume = this.getEmptyBoatVolume( y, boat ); // TODO: how to handle things slightly below boat bottom. like this?
        let finished = false;
        for ( let i = 0; i < criticalPoints.length; i++ ) {
          const criticalPoint = criticalPoints[ i ];

          if ( criticalPoint > y ) {
            const emptyVolume = this.getEmptyBoatVolume( criticalPoint, boat );
            if ( emptyVolume >= boatLiquidVolume ) {
              y = DensityBuoyancyModel.findRoot(
                y,
                criticalPoint,
                1e-7,
                yTest => this.getEmptyBoatVolume( yTest, boat ) - boatLiquidVolume,
                yTest => this.getEmptyBoatArea( yTest, boat )
              );
              currentEmptyVolume = this.getEmptyBoatVolume( y, boat );
              finished = true;
              break;
            }
            else {
              y = criticalPoint;
              currentEmptyVolume = emptyVolume;
            }
          }
        }
        if ( !finished ) {
          y += ( boatLiquidVolume - currentEmptyVolume ) / boat.boatInternalArea;
        }
        boat.previousLiquidY = boat.currentLiquidY;
        boat.currentLiquidY = y;
      }
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
        mass.step( dt, this.engine.interpolationRatio );
      } );

      this.liquidYProperty.value = this.previousLiquidY + this.engine.interpolationRatio * ( this.currentLiquidY - this.previousLiquidY );
    }

    /**
     * Hybrid root-finding given our constraints.
     * @private
     *
     * @param {number} minX
     * @param {number} maxX
     * @param {number} tolerance
     * @param {function} valueFunction
     * @param {function} derivativeFunction
     * @returns {number}
     */
    static findRoot( minX, maxX, tolerance, valueFunction, derivativeFunction ) {
      let x = ( minX + maxX ) / 2;

      let y;
      let dy;

      while ( Math.abs( y = valueFunction( x ) ) > tolerance ) {
        dy = derivativeFunction( x );

        if ( y < 0 ) {
          minX = x;
        }
        else {
          maxX = x;
        }

        // Newton's method first
        x -= y / dy;

        // Bounded to be bisection at the very least
        if ( x <= minX || x >= maxX ) {
          x = ( minX + maxX ) / 2;
        }
      }

      return x;
    }
  }

  return densityBuoyancyCommon.register( 'DensityBuoyancyModel', DensityBuoyancyModel );
} );
