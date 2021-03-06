// Copyright 2019-2021, University of Colorado Boulder

/**
 * The core model for the Density and Buoyancy sim screens, including a pool and masses.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import Gravity from './Gravity.js';
import Material from './Material.js';
import P2Engine from './P2Engine.js';
import Pool from './Pool.js';
import Scale from './Scale.js';

// constants
const BLOCK_SPACING = 0.01;
const POOL_VOLUME = 0.15;
const POOL_WIDTH = 0.9;
const POOL_DEPTH = 0.4;
const POOL_HEIGHT = POOL_VOLUME / POOL_WIDTH / POOL_DEPTH;

class DensityBuoyancyModel {

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( tandem, options ) {
    options = merge( {
      // {boolean}
      showMassesDefault: false,

      constraintMinX: -0.875,
      constraintMaxX: 0.875
    }, options );

    // @public {Property.<boolean>}
    this.showGravityForceProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'showGravityForceProperty' ) } );
    this.showBuoyancyForceProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'showBuoyancyForceProperty' ) } );
    this.showContactForceProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'showContactForceProperty' ) } );
    this.showMassesProperty = new BooleanProperty( options.showMassesDefault, { tandem: tandem.createTandem( 'showMassesProperty' ) } );
    this.showForceValuesProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'showForceValuesProperty' ) } );

    // @public {Property.<Gravity>}
    this.gravityProperty = new Property( Gravity.EARTH, {
      phetioType: Property.PropertyIO( Gravity.GravityIO ),
      tandem: tandem.createTandem( 'gravityProperty' )
    } );

    // @public {Property.<Material>}
    this.liquidMaterialProperty = new Property( Material.WATER );

    // @public {Property.<number>}
    this.liquidDensityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.density );

    // @public {Property.<number>}
    this.liquidViscosityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.viscosity );

    // @public {Bounds3}
    this.poolBounds = new Bounds3(
      -POOL_WIDTH / 2, -POOL_HEIGHT, -POOL_DEPTH / 2,
      POOL_WIDTH / 2, 0, POOL_DEPTH / 2
    );

    // @public {Bounds3}
    this.groundBounds = new Bounds3(
      -10, -10, -2,
      10, 0, POOL_DEPTH / 2
    );

    // @public {Bounds3} - We'll keep blocks within these bounds, to generally stay in-screen
    this.constraintBounds = new Bounds3(
      options.constraintMinX, 0, 0,
      options.constraintMaxX, 4, 0
    );

    if ( DensityBuoyancyCommonQueryParameters.poolWidthMultiplier !== 1 ) {
      const halfX = DensityBuoyancyCommonQueryParameters.poolWidthMultiplier * 0.45;
      const halfZ = POOL_VOLUME / ( 2 * halfX * POOL_HEIGHT * 2 );
      this.poolBounds = new Bounds3(
        -halfX, -POOL_HEIGHT, -halfZ,
        halfX, 0, halfZ
      );
      this.groundBounds = new Bounds3(
        -10, -10, -2,
        10, 0, halfZ
      );
    }

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

    // @public {Array.<Vector2>}
    this.barrierPoints = [
      new Vector2( this.constraintBounds.maxX, this.constraintBounds.minY ),
      new Vector2( this.constraintBounds.maxX + 1, this.constraintBounds.minY ),
      new Vector2( this.constraintBounds.maxX + 1, this.constraintBounds.maxY + 1 ),
      new Vector2( this.constraintBounds.minX - 1, this.constraintBounds.maxY + 1 ),
      new Vector2( this.constraintBounds.minX - 1, this.constraintBounds.minY ),
      new Vector2( this.constraintBounds.minX, this.constraintBounds.minY ),
      new Vector2( this.constraintBounds.minX, this.constraintBounds.maxY ),
      new Vector2( this.constraintBounds.maxX, this.constraintBounds.maxY )
    ];

    // @public {Pool}
    this.pool = new Pool( this.poolBounds );

    // @public {Boat|null} - We need to hook into a boat (if it exists) for displaying the water.
    this.boat = null;

    // @public {Engine}
    this.engine = new P2Engine();

    // @public {Engine.Body}
    this.groundBody = this.engine.createGround( this.groundPoints );
    this.engine.addBody( this.groundBody );

    // @public {Engine.Body}
    this.barrierBody = this.engine.createBarrier( this.barrierPoints );
    this.engine.addBody( this.barrierBody );

    // @public {ObservableArrayDef.<Mass>}
    this.masses = createObservableArray();
    this.masses.addItemAddedListener( mass => {
      this.engine.addBody( mass.body );
    } );
    this.masses.addItemRemovedListener( mass => {
      this.engine.removeBody( mass.body );
    } );

    let boatVerticalVelocity = 0;
    let boatVerticalAcceleration = 0;

    this.engine.addPostStepListener( dt => {

      this.updateLiquid();

      // {number}
      const gravity = this.gravityProperty.value.value;

      const boat = this.getBoat();

      if ( boat && dt ) {
        const nextBoatVerticalVelocity = this.engine.bodyGetVelocity( boat.body ).y;
        boatVerticalAcceleration = ( nextBoatVerticalVelocity - boatVerticalVelocity ) / dt;
        boatVerticalVelocity = nextBoatVerticalVelocity;
      }

      // Will set the force Properties for all of the masses
      this.masses.forEach( mass => {
        const contactForce = this.engine.bodyGetContactForces( mass.body );
        this.engine.resetContactForces( mass.body );
        mass.contactForceInterpolatedProperty.setNextValue( contactForce );

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
          mass.scaleForceInterpolatedProperty.setNextValue( scaleForce );
        }

        const basin = mass.containingBasin;
        const submergedVolume = basin ? mass.getDisplacedVolume( basin.liquidYInterpolatedProperty.currentValue ) : 0;
        if ( submergedVolume ) {
          const displacedMass = submergedVolume * this.liquidDensityProperty.value;
          // Vertical acceleration of the boat will change the buoyant force.
          const acceleration = gravity + ( ( boat && basin === boat.basin ) ? boatVerticalAcceleration : 0 );
          const buoyantForce = new Vector2( 0, displacedMass * acceleration );
          this.engine.bodyApplyForce( mass.body, buoyantForce );
          mass.buoyancyForceInterpolatedProperty.setNextValue( buoyantForce );

          const velocity = this.engine.bodyGetVelocity( mass.body );
          // If the boat is moving, assume the liquid moves with it, and apply viscosity due to the movement of our mass
          // inside the boat's liquid.
          if ( boat && basin === boat.basin ) {
            velocity.subtract( this.engine.bodyGetVelocity( boat.body ) );
          }

          // Increase the generally-visible viscosity effect
          const hackedViscosity = this.liquidViscosityProperty.value ? 0.03 * Math.pow( this.liquidViscosityProperty.value / 0.03, 0.8 ) : 0;
          const viscousForce = velocity.times( -hackedViscosity * Math.max( 2, mass.massProperty.value ) * 3000 );
          this.engine.bodyApplyForce( mass.body, viscousForce );
        }
        else {
          mass.buoyancyForceInterpolatedProperty.setNextValue( Vector2.ZERO );
        }

        // Gravity
        const gravityForce = new Vector2( 0, -mass.massProperty.value * gravity );
        this.engine.bodyApplyForce( mass.body, gravityForce );
        mass.gravityForceInterpolatedProperty.setNextValue( gravityForce );
      } );
    } );
  }

  /**
   * Sets whether a mass is visible in the scene.
   * @public
   *
   * @param {Mass} mass
   * @param {boolean} visible
   */
  setMassVisible( mass, visible ) {
    const contains = this.masses.includes( mass );
    if ( visible && !contains ) {
      this.masses.add( mass );
    }
    if ( !visible && contains ) {
      this.masses.remove( mass );
    }
  }

  /**
   * Returns the boat (if there is one)
   * @public
   *
   * @returns {Boat|null}
   */
  getBoat() {
    return this.masses.find( mass => mass.isBoat() ) || null;
  }

  /**
   * Computes the heights of the main pool liquid (and optionally that of the boat)
   * @private
   */
  updateLiquid() {
    const boat = this.getBoat();

    const basins = [ this.pool ];
    if ( boat ) {
      basins.push( boat.basin );
      this.pool.childBasin = boat.basin;
    }
    else {
      this.pool.childBasin = null;
    }

    this.masses.forEach( mass => mass.updateStepInformation() );
    basins.forEach( basin => {
      basin.stepMasses = this.masses.filter( mass => basin.isMassInside( mass ) );
    } );

    let poolLiquidVolume = this.pool.liquidVolumeProperty.value;

    // May need to adjust volumes between the boat/pool if there is a boat
    if ( boat ) {
      let boatLiquidVolume = boat.basin.liquidVolumeProperty.value;

      const poolEmptyVolumeToBoatTop = this.pool.getEmptyVolume( Math.min( boat.stepTop, this.poolBounds.maxY ) );
      const boatEmptyVolumeToBoatTop = boat.basin.getEmptyVolume( boat.stepTop );

      const poolExcess = poolLiquidVolume - poolEmptyVolumeToBoatTop;
      const boatExcess = boatLiquidVolume - boatEmptyVolumeToBoatTop;

      if ( poolExcess > 0 && boatExcess < 0 ) {
        const transferVolume = Math.min( poolExcess, -boatExcess );
        poolLiquidVolume -= transferVolume;
        boatLiquidVolume += transferVolume;
      }
      else if ( boatExcess > 0 ) {
        // If the boat overflows, just dump the rest in the pool
        poolLiquidVolume += boatExcess;
        boatLiquidVolume -= boatExcess;
      }
      boat.basin.liquidVolumeProperty.value = boatLiquidVolume;
    }

    // Check to see if water "spilled" out of the pool, and set the finalized liquid volume
    this.pool.liquidVolumeProperty.value = Math.min( poolLiquidVolume, this.pool.getEmptyVolume( this.poolBounds.maxY ) );

    this.pool.computeY();
    if ( boat ) {
      boat.basin.computeY();
    }

    // If we have a boat that is NOT underwater, we'll assign masses into the boat's basin where relevant. Otherwise
    // anything will go just into the pool's basin.
    if ( boat && this.pool.liquidYInterpolatedProperty.currentValue < boat.basin.stepTop - 1e-7 ) {
      this.masses.forEach( mass => {
        mass.containingBasin = boat.basin.isMassInside( mass ) ? boat.basin : ( this.pool.isMassInside( mass ) ? this.pool : null );
      } );
    }
    else {
      this.masses.forEach( mass => {
        mass.containingBasin = this.pool.isMassInside( mass ) ? this.pool : null;
      } );
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

    this.pool.reset();
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

    this.pool.liquidYInterpolatedProperty.setRatio( this.engine.interpolationRatio );
  }

  /**
   * Positions masses from the left of the pool outward, with padding
   * @private
   *
   * @param {Array.<Cuboid>} masses
   */
  positionMassesLeft( masses ) {
    let position = this.poolBounds.minX;

    masses.forEach( mass => {
      mass.matrix.setToTranslation(
        position - BLOCK_SPACING - mass.sizeProperty.value.width / 2,
        -mass.sizeProperty.value.minY
      );
      position -= BLOCK_SPACING + mass.sizeProperty.value.width;
      mass.writeData();
    } );
  }

  /**
   * Positions masses from the right of the pool outward, with padding
   * @private
   *
   * @param {Array.<Cuboid>} masses
   */
  positionMassesRight( masses ) {
    let position = this.poolBounds.maxX;

    masses.forEach( mass => {
      mass.matrix.setToTranslation(
        position + BLOCK_SPACING + mass.sizeProperty.value.width / 2,
        -mass.sizeProperty.value.minY
      );
      position += BLOCK_SPACING + mass.sizeProperty.value.width;
      mass.writeData();
    } );
  }

  /**
   * Positions masses from the left of the pool up
   * @private
   *
   * @param {Array.<Cuboid>} masses
   */
  positionStackLeft( masses ) {
    const x = this.poolBounds.minX - BLOCK_SPACING - Math.max( ...masses.map( mass => mass.sizeProperty.value.width ) ) / 2;

    this.positionStack( masses, x );
  }

  /**
   * Positions masses from the right of the pool up
   * @private
   *
   * @param {Array.<Cuboid>} masses
   */
  positionStackRight( masses ) {
    const x = this.poolBounds.maxX + BLOCK_SPACING + Math.max( ...masses.map( mass => mass.sizeProperty.value.width ) ) / 2;

    this.positionStack( masses, x );
  }

  /**
   * Position a stack of masses at a given center x.
   * @private
   *
   * @param {Array.<Cuboid>} masses
   * @param {number} x
   */
  positionStack( masses, x ) {
    let position = 0;

    masses = _.sortBy( masses, mass => -mass.volumeProperty.value );

    masses.forEach( mass => {
      mass.matrix.setToTranslation( x, position + mass.sizeProperty.value.height / 2 );
      position += mass.sizeProperty.value.height;
      mass.writeData();
    } );
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyModel', DensityBuoyancyModel );
export default DensityBuoyancyModel;
