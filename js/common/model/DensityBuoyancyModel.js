// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds3 = require( 'DOT/Bounds3' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonQueryParameters = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonQueryParameters' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Gravity = require( 'DENSITY_BUOYANCY_COMMON/common/model/Gravity' );
  const InterpolatedProperty = require( 'DENSITY_BUOYANCY_COMMON/common/model/InterpolatedProperty' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const MatterEngine = require( 'DENSITY_BUOYANCY_COMMON/common/model/MatterEngine' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const P2Engine = require( 'DENSITY_BUOYANCY_COMMON/common/model/P2Engine' );
  const Property = require( 'AXON/Property' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );
  const Vector2 = require( 'DOT/Vector2' );

  class DensityBuoyancyModel  {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // @public {Property.<boolean>}
      this.showGravityForceProperty = new BooleanProperty( false );
      this.showBuoyancyForceProperty = new BooleanProperty( false );
      this.showContactForceProperty = new BooleanProperty( false );
      this.showMassesProperty = new BooleanProperty( false );
      this.showForceValuesProperty = new BooleanProperty( false );

      // @public {Property.<Gravity>}
      this.gravityProperty = new Property( Gravity.EARTH );

      // @public {Property.<Material>}
      this.liquidMaterialProperty = new Property( Material.WATER );

      // @public {Property.<number>}
      this.liquidDensityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.density );

      // @public {Property.<number>}
      this.liquidViscosityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.viscosity );

      // @public {Bounds3}
      this.poolBounds = new Bounds3(
        -0.45, -0.35, -0.2,
        0.45, 0, 0.2
      );

      // @public {Bounds3}
      this.groundBounds = new Bounds3(
        -20, -20, -2,
        20, 0, 0.2
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
      this.liquidVolumeProperty = new NumberProperty( 0.1 );

      // @public {Property.<number>} - The y coordinate of the main liquid level in the pool
      this.liquidYProperty = new InterpolatedProperty( this.poolBounds.minY + this.liquidVolumeProperty.value / ( this.poolBounds.width * this.poolBounds.depth ), {
        interpolate: InterpolatedProperty.interpolateNumber
      } );

      const engineType = DensityBuoyancyCommonQueryParameters.engine;
      assert && assert( engineType === 'p2' || engineType === 'matter' );
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

      this.engine.addPostStepListener( () => {
        this.updateLiquid();

        // {number}
        const gravity = this.gravityProperty.value.value;

        // Will set all of the mass's force Properties
        this.masses.forEach( mass => {
          const contactForce = this.engine.bodyGetContactForces( mass.body );
          this.engine.resetContactForces( mass.body );
          mass.contactForceProperty.setNextValue( contactForce );

          if ( mass instanceof Scale ) {
            let scaleForce = 0;
            this.masses.forEach( otherMass => {
              if ( mass !== otherMass ) {
                const verticalForce = this.engine.bodyGetContactForceBetween( mass.body, otherMass.body ).y;
                if ( verticalForce > 0 ) {
                  scaleForce += verticalForce;
                }
              }
            } );
            mass.scaleForceProperty.setNextValue( scaleForce );
          }

          // TODO: should we step the liquid y here for stability?
          const submergedVolume = mass.getDisplacedBuoyantVolume( this.liquidYProperty.currentValue );
          if ( submergedVolume ) {
            const displacedMass = submergedVolume * this.liquidDensityProperty.value;
            const buoyantForce = new Vector2( 0, displacedMass * gravity );
            this.engine.bodyApplyForce( mass.body, buoyantForce );
            mass.buoyancyForceProperty.setNextValue( buoyantForce );

            // TODO: Do we ever want to display the viscous forces?
            const velocity = this.engine.bodyGetVelocity( mass.body );
            // TODO: determine a non-hackish way
            this.engine.bodyApplyForce( mass.body, velocity.times( -this.liquidViscosityProperty.value * mass.massProperty.value * 3000 ) );
          }
          else {
            mass.buoyancyForceProperty.setNextValue( Vector2.ZERO );
          }

          // Gravity
          const gravityForce = new Vector2( 0, -mass.massProperty.value * gravity );
          this.engine.bodyApplyForce( mass.body, gravityForce );
          mass.gravityForceProperty.setNextValue( gravityForce );
        } );
      } );
    }

    /**
     * Returns the filled volume in the pool (i.e. things that aren't air or water) that is below the given y value.
     * (including an optional boat).
     * @private
     *
     * @param {number} y
     * @param {Boat|null} boat
     */
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

    /**
     * Returns the empty volume in the pool (i.e. air, that isn't a solid object) that is below the given y value.
     * (including an optional boat).
     * @private
     *
     * @param {number} y
     * @param {Boat|null} boat
     */
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

    getBoat() {
      return _.find( this.masses.getArray(), mass => mass.isBoat() ) || null;
    }

    /**
     * Computes the heights of the main pool liquid (and optionally that of the boat)
     * @private
     */
    updateLiquid() {
      const boat = this.getBoat();

      const criticalPoints = [];

      this.masses.forEach( mass => {
        mass.updateStepInformation();
        criticalPoints.push( mass.stepBottom );
        criticalPoints.push( mass.stepTop );
      } );
      criticalPoints.sort( ( a, b ) => a - b );

      this.masses.forEach( mass => {
        mass.alignedWithBoat = boat && boat !== mass && boat.stepBottom < mass.stepBottom && boat.boatMinX <= mass.stepX && mass.stepX <= boat.boatMaxX;
      } );

      const poolArea = this.poolBounds.width * this.poolBounds.depth;
      let poolLiquidVolume = this.liquidVolumeProperty.value;
      let boatLiquidVolume = boat ? boat.liquidVolumeProperty.value : 0;

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

        boat.liquidVolumeProperty.value = boatLiquidVolume;
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
      this.liquidYProperty.setNextValue( y );

      // Handle the boat liquid y
      if ( boat ) {
        let y = boat.boatInternalBottom;
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
        boat.liquidYProperty.setNextValue( y - boat.boatInternalBottom );
      }
    }

    /**
     * Resets things to their original values.
     * @public
     */
    reset() {
      this.showGravityForceProperty.reset();
      this.showBuoyancyForceProperty.reset();
      this.showContactForceProperty.reset();
      this.showMassesProperty.reset();
      this.showForceValuesProperty.reset();
      this.gravityProperty.reset();
      this.liquidMaterialProperty.reset();
      this.liquidVolumeProperty.reset();
      this.liquidYProperty.reset();

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

      this.liquidYProperty.setRatio( this.engine.interpolationRatio );
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

          // Check to see if it's impossible to pass our tolerance
          if ( x === minX || x === maxX ) {
            break;
          }
        }
      }

      return x;
    }
  }

  return densityBuoyancyCommon.register( 'DensityBuoyancyModel', DensityBuoyancyModel );
} );
