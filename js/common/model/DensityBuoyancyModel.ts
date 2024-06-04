// Copyright 2019-2024, University of Colorado Boulder

/**
 * The core model for the Density and Buoyancy sim screens, including a pool and masses.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import Gravity from './Gravity.js';
import Material from './Material.js';
import P2Engine from './P2Engine.js';
import Pool from './Pool.js';
import Scale, { SCALE_WIDTH } from './Scale.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Boat from '../../buoyancy/model/applications/Boat.js';
import PhysicsEngine, { PhysicsEngineBody } from './PhysicsEngine.js';
import Mass from './Mass.js';
import Basin from './Basin.js';
import Cuboid from './Cuboid.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import TRangedProperty from '../../../../axon/js/TRangedProperty.js';
import TModel from '../../../../joist/js/TModel.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PoolScale from './PoolScale.js';
import PoolScaleHeightProperty from './PoolScaleHeightProperty.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';

// constants
const BLOCK_SPACING = 0.01;
const POOL_VOLUME = 0.15;
const POOL_WIDTH = 0.9;
const POOL_DEPTH = 0.4;
const POOL_HEIGHT = POOL_VOLUME / POOL_WIDTH / POOL_DEPTH;
const GROUND_FRONT_Z = POOL_DEPTH / 2;
const POOL_BACK_Z = -POOL_DEPTH / 2;

// Faster than normal stepping to fill the boat (kind of like animation speed)
const FILL_EMPTY_MULTIPLIER = 0.3;

// 90% of the boat is out of the water before spilling out the full boat
const BOAT_READY_TO_SPILL_OUT_THRESHOLD = 0.9;

// Y model distance of tolerance between the boat basin liquidY level and the boat basin stepTop. This was needed to
// prevent filling thrashing as a containing mass floats around. See updateLiquidLevel();
const BOAT_FULL_THRESHOLD = 0.01;


export type DensityBuoyancyModelOptions = {
  showMassValuesDefault?: boolean;
  canShowForces?: boolean;
  initialForceScale?: number;
  usePoolScale?: boolean;
  supportsDepthLines?: boolean;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class DensityBuoyancyModel implements TModel {

  public readonly showGravityForceProperty: Property<boolean>;
  public readonly showBuoyancyForceProperty: Property<boolean>;
  public readonly showContactForceProperty: Property<boolean>;
  public readonly showForceValuesProperty: Property<boolean>;
  public readonly vectorZoomProperty: TRangedProperty;
  public readonly showMassValuesProperty: Property<boolean>;
  public readonly gravityProperty: Property<Gravity>;
  public readonly liquidMaterialProperty: Property<Material>;
  private readonly liquidDensityProperty: TReadOnlyProperty<number>;
  private readonly liquidViscosityProperty: TReadOnlyProperty<number>;

  public readonly supportsDepthLines: boolean;
  public readonly showDepthLinesProperty: Property<boolean>;

  public readonly poolBounds: Bounds3;
  public readonly groundBounds: Bounds3;
  public readonly groundPoints: Vector2[];

  // We'll keep blocks within these bounds, to generally stay in-screen. This may be
  // adjusted by the screen based on the visibleBoundsProperty. These are sensible defaults, with the minX and minY
  // somewhat meant to be adjusted.
  public readonly invisibleBarrierBoundsProperty: Property<Bounds3>;

  public readonly masses: ObservableArray<Mass>;
  public readonly pool: Pool;
  public readonly engine: PhysicsEngine;
  private readonly groundBody: PhysicsEngineBody;
  private barrierBody: PhysicsEngineBody;
  protected readonly availableMasses: ObservableArray<Mass>;

  // Flag that sets an animation to empty the boat of any water inside of it
  private spillingWaterOutOfBoat = false;

  // Scale for the pool and its heightProperty, if we are using it
  public readonly poolScale: Scale | null;
  public readonly poolScaleHeightProperty: NumberProperty;


  public constructor( providedOptions?: DensityBuoyancyModelOptions ) {
    const options = optionize<DensityBuoyancyModelOptions, DensityBuoyancyModelOptions>()( {
      showMassValuesDefault: false,
      canShowForces: true,
      initialForceScale: 1 / 16,
      usePoolScale: false, // TODO: Set to true to hide it on most screen models, see https://github.com/phetsims/density-buoyancy-common/issues/148
      supportsDepthLines: false
    }, providedOptions );

    const tandem = options.tandem;

    const visiblePropertiesTandem = tandem.createTandem( 'visibleProperties' );
    this.showGravityForceProperty = new BooleanProperty( false, {
      tandem: options.canShowForces ? visiblePropertiesTandem.createTandem( 'showGravityForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showBuoyancyForceProperty = new BooleanProperty( false, {
      tandem: options.canShowForces ? visiblePropertiesTandem.createTandem( 'showBuoyancyForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showContactForceProperty = new BooleanProperty( false, {
      tandem: options.canShowForces ? visiblePropertiesTandem.createTandem( 'showContactForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showForceValuesProperty = new BooleanProperty( false, {
      tandem: options.canShowForces ? visiblePropertiesTandem.createTandem( 'showForceValuesProperty' ) : Tandem.OPT_OUT
    } );
    this.showMassValuesProperty = new BooleanProperty( options.showMassValuesDefault, {
      tandem: visiblePropertiesTandem.createTandem( 'showMassValuesProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Displays a mass readout on each object'
    } );
    this.vectorZoomProperty = new NumberProperty( options.initialForceScale, {
      tandem: options.canShowForces ? tandem.createTandem( 'vectorZoomProperty' ) : Tandem.OPT_OUT,
      range: new Range( Math.pow( 0.5, 9 ), 1 )
    } );
    this.supportsDepthLines = options.supportsDepthLines;
    this.showDepthLinesProperty = new BooleanProperty( false, {
      tandem: options.supportsDepthLines ? visiblePropertiesTandem.createTandem( 'showDepthLinesProperty' ) : Tandem.OPT_OUT,
      phetioDocumentation: 'Display visual lines on blocks to aid in calculating the percentage that the block is submerged.'
    } );

    this.gravityProperty = new Property( Gravity.EARTH, {
      valueType: Gravity,
      phetioValueType: Gravity.GravityIO,
      tandem: tandem.createTandem( 'gravityProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The acceleration due to gravity applied to all masses, (may be potentially custom or hidden from view)'
    } );

    this.liquidMaterialProperty = new Property( Material.WATER, {
      valueType: Material,
      phetioValueType: Material.MaterialIO,
      tandem: tandem.createTandem( 'liquidMaterialProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The material of the liquid in the pool'
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.liquidDensityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.density, {
      tandem: tandem.createTandem( 'liquidDensityProperty' ),
      phetioFeatured: true,
      phetioValueType: NumberIO,
      units: 'kg/m^3'
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.liquidViscosityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.viscosity, {
      tandem: tandem.createTandem( 'liquidViscosityProperty' ),
      phetioValueType: NumberIO,
      units: 'Pa\u00b7s'
    } );

    this.poolBounds = new Bounds3(
      -POOL_WIDTH / 2, -POOL_HEIGHT, POOL_BACK_Z,
      POOL_WIDTH / 2, 0, GROUND_FRONT_Z
    );
    this.groundBounds = new Bounds3(
      -10, -10, -2,
      10, 0, GROUND_FRONT_Z
    );

    this.invisibleBarrierBoundsProperty = new Property( new Bounds3(
      -0.875, -4, POOL_BACK_Z,
      0.875, 4, GROUND_FRONT_Z
    ), {
      valueComparisonStrategy: 'equalsFunction'
    } );

    // How many units the barrier extends out to
    const barrierSize = 5;

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const barrierPointsProperty = new DerivedProperty( [ this.invisibleBarrierBoundsProperty ], bounds => {
      return [
        new Vector2( bounds.maxX, bounds.minY ),
        new Vector2( bounds.maxX + barrierSize, bounds.minY ),
        new Vector2( bounds.maxX + barrierSize, bounds.maxY + barrierSize ),
        new Vector2( bounds.minX - barrierSize, bounds.maxY + barrierSize ),
        new Vector2( bounds.minX - barrierSize, bounds.minY ),
        new Vector2( bounds.minX, bounds.minY ),
        new Vector2( bounds.minX, bounds.maxY ),
        new Vector2( bounds.maxX, bounds.maxY )
      ];
    } );

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

    this.pool = new Pool( this.poolBounds, tandem.createTandem( 'pool' ) );

    this.engine = new P2Engine();

    this.groundBody = this.engine.createGround( this.groundPoints );
    this.engine.addBody( this.groundBody );

    this.barrierBody = this.engine.createBarrier( barrierPointsProperty.value );
    this.engine.addBody( this.barrierBody );

    // Update the barrier shape as needed (full recreation for now)
    barrierPointsProperty.lazyLink( points => {
      this.engine.removeBody( this.barrierBody );
      this.barrierBody = this.engine.createBarrier( points );
      this.engine.addBody( this.barrierBody );
    } );

    this.availableMasses = createObservableArray();

    // Control masses by visibility, so that this.masses will be the subset of this.availableMasses that is visible
    const visibilityListenerMap = new Map<Mass, ( visible: boolean ) => void>(); // eslint-disable-line no-spaced-func
    this.availableMasses.addItemAddedListener( mass => {
      const visibilityListener = ( visible: boolean ) => {
        if ( visible ) {
          this.masses.push( mass );
        }
        else {
          this.masses.remove( mass );
        }
      };
      visibilityListenerMap.set( mass, visibilityListener );
      mass.visibleProperty.lazyLink( visibilityListener );

      if ( mass.visibleProperty.value ) {
        this.masses.push( mass );
      }
    } );
    this.availableMasses.addItemRemovedListener( mass => {
      mass.visibleProperty.unlink( visibilityListenerMap.get( mass )! );
      visibilityListenerMap.delete( mass );

      if ( mass.visibleProperty.value ) {
        this.masses.remove( mass );
      }
    } );

    this.masses = createObservableArray();
    this.masses.addItemAddedListener( mass => {
      this.engine.addBody( mass.body );
    } );
    this.masses.addItemRemovedListener( mass => {
      this.engine.removeBody( mass.body );
      mass.interruptedEmitter.emit();
    } );

    let boatVerticalVelocity = 0;
    let boatVerticalAcceleration = 0;

    // The main engine post-step actions, that will determine the net forces applied on each mass. This callback fires
    // once per "physics engine step", and so results in potentially up to "p2MaxSubSteps" calls per simulation frame
    // (30 as of writing). This instance lives for the lifetime of the simulation, so we don't need to remove this
    // listener.
    this.engine.addPostStepListener( dt => {
      this.updateLiquid();

      // {number}
      const gravity = this.gravityProperty.value.value;

      const boat = this.getBoat();

      if ( boat && dt ) {
        boat.setUnderwaterState( this.pool.liquidYInterpolatedProperty.currentValue );
        const nextBoatVerticalVelocity = this.engine.bodyGetVelocity( boat.body ).y;
        boatVerticalAcceleration = ( nextBoatVerticalVelocity - boatVerticalVelocity ) / dt;
        boatVerticalVelocity = nextBoatVerticalVelocity;
      }

      // Will set the force Properties for all the masses
      this.masses.forEach( mass => {
        let contactForce = this.engine.bodyGetContactForces( mass.body );

        // p2.js will report bad forces for static scales, so we need to zero these out
        if ( !contactForce.isFinite() ) {
          contactForce = Vector2.ZERO;
        }

        // Teleporting blocks to the left of the volumelessScale (pool scale with slider) when they get trapped beneath it
        if ( mass instanceof PoolScale ) {
          this.masses.forEach( otherMass => {
            if ( mass !== otherMass ) {
              const horizontalForce = this.engine.bodyGetContactForceBetween( mass.body, otherMass.body ).x;
              // Blocks should never experiment +x forces by this scale. If they do, they are trapped beneath it.
              if ( horizontalForce > 0 ) {
                otherMass.matrix.set02( mass.matrix.m02() - SCALE_WIDTH );
                otherMass.writeData();
                otherMass.transformedEmitter.emit();
              }
            }
          } );
        }

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

        const velocity = this.engine.bodyGetVelocity( mass.body );

        // Limit velocity, so things converge faster.
        if ( velocity.magnitude > 5 ) {
          velocity.setMagnitude( 5 );
          this.engine.bodySetVelocity( mass.body, velocity );
        }

        const basin = mass.containingBasin;

        let submergedVolume = 0;
        if ( basin ) {
          const displacedVolume = mass.getDisplacedVolume( basin.liquidYInterpolatedProperty.currentValue );

          // The submergedVolume of the mass cannot be more than the liquid volume in the basin. Bug fix for https://github.com/phetsims/buoyancy/issues/135
          submergedVolume = displacedVolume > basin.liquidVolumeProperty.value ? basin.liquidVolumeProperty.value : displacedVolume;
        }

        let massValue = mass.massProperty.value;

        if ( mass === boat && boat.isUnderwater ) {
          // Special consideration for when boat is underwater
          // Don't count the liquid inside the boat as part of the mass
          submergedVolume = boat.volumeProperty.value;
          massValue = submergedVolume * boat.materialProperty.value.density;
        }

        if ( submergedVolume !== 0 ) {
          const displacedMass = submergedVolume * this.liquidDensityProperty.value;
          // Vertical acceleration of the boat will change the buoyant force.
          const acceleration = gravity + ( ( boat && basin === boat.basin ) ? boatVerticalAcceleration : 0 );
          const buoyantForce = new Vector2( 0, displacedMass * acceleration );
          this.engine.bodyApplyForce( mass.body, buoyantForce );
          mass.buoyancyForceInterpolatedProperty.setNextValue( buoyantForce );

          // If the boat is moving, assume the liquid moves with it, and apply viscosity due to the movement of our mass
          // inside the boat's liquid.
          if ( boat && basin === boat.basin ) {
            velocity.subtract( this.engine.bodyGetVelocity( boat.body ) );
          }

          // Increase the generally-visible viscosity effect
          const ratioSubmerged =
            ( 1 - DensityBuoyancyCommonQueryParameters.viscositySubmergedRatio ) +
            DensityBuoyancyCommonQueryParameters.viscositySubmergedRatio * submergedVolume / mass.volumeProperty.value;
          const hackedViscosity = this.liquidViscosityProperty.value ? 0.03 * Math.pow( this.liquidViscosityProperty.value / 0.03, 0.8 ) : 0;
          const viscosityMass = Math.max( DensityBuoyancyCommonQueryParameters.viscosityMassCutoff, massValue );
          const viscousForce = velocity.times( -hackedViscosity * viscosityMass * ratioSubmerged * 3000 * DensityBuoyancyCommonQueryParameters.viscosityMultiplier );
          this.engine.bodyApplyForce( mass.body, viscousForce );
        }
        else {
          mass.buoyancyForceInterpolatedProperty.setNextValue( Vector2.ZERO );
        }

        // Gravity
        const gravityForce = new Vector2( 0, -massValue * gravity );
        this.engine.bodyApplyForce( mass.body, gravityForce );
        mass.gravityForceInterpolatedProperty.setNextValue( gravityForce );

        // Calculates the submerged ratio for the mass
        mass.updateSubmergedMassFraction( gravity, this.liquidDensityProperty.value );
      } );
    } );


    this.poolScaleHeightProperty = new PoolScaleHeightProperty( DensityBuoyancyCommonConstants.POOL_SCALE_INITIAL_HEIGHT, {
      range: new Range( 0, 1 )
      // tandem: tandem.createTandem( 'poolScaleHeightProperty' ) // TODO: Properly integrate this https://github.com/phetsims/density-buoyancy-common/issues/148
    } );
    if ( options.usePoolScale ) {
      // Pool scale
      this.poolScale = new PoolScale( this.engine, this.gravityProperty, {
        tandem: tandem.createTandem( 'poolScale' )
      } );

      // Make sure to render it
      this.availableMasses.push( this.poolScale );

      // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
      this.pool.liquidVolumeProperty.value -= this.poolScale.volumeProperty.value;
      this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );
    }
    else {
      this.poolScale = null;
    }
  }

  /**
   * Returns the boat (if there is one). Overridden in subclasses that have a boat.
   */
  public getBoat(): Boat | null {
    return null;
  }

  /**
   * Computes the heights of the main pool liquid (and optionally that of the boat)
   */
  private updateLiquid(): void {
    const boat = this.getBoat();

    const basins: Basin[] = [ this.pool ];
    if ( boat && boat.visibleProperty.value ) {
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
      poolLiquidVolume = this.updateLiquidsForBoat( poolLiquidVolume );
    }

    // Check to see if water "spilled" out of the pool, and set the finalized liquid volume
    this.pool.liquidVolumeProperty.value = Math.min( poolLiquidVolume, this.pool.getEmptyVolume( this.poolBounds.maxY ) );

    this.pool.computeY();
    boat && boat.basin.computeY();

    // If we have a boat that is NOT underwater, we'll assign masses into the boat's basin where relevant. Otherwise,
    // anything will go just into the pool's basin.
    if ( boat && boat.visibleProperty.value && !boat.isUnderwater ) {
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

  private updateLiquidsForBoat( poolLiquidVolume: number ): number {
    const boat = this.getBoat()!;

    assert && assert( boat, 'boat needed to update liquids for boat' );

    const boatBasin = boat.basin;
    if ( boat.visibleProperty.value ) {
      let boatLiquidVolume = boatBasin.liquidVolumeProperty.value;
      const boatBasinMaximumVolume = boatBasin.getMaximumVolume( boatBasin.stepTop );

      const poolEmptyVolumeToBoatTop = this.pool.getEmptyVolume( Math.min( boat.stepTop, this.poolBounds.maxY ) );
      const boatEmptyVolumeToBoatTop = boatBasin.getEmptyVolume( boat.stepTop );

      // Calculate adjustments to water volumes to match the current space in the basin
      let poolExcess = poolLiquidVolume - poolEmptyVolumeToBoatTop;
      let boatExcess = boatLiquidVolume - boatEmptyVolumeToBoatTop;

      const boatHeight = boat.shapeProperty.value.getBounds().height;

      if ( boatLiquidVolume ) {

        // If the top of the boat is out of the water past the height threshold, spill the water back into the pool
        // (even if not totally full).
        if ( boat.stepTop > this.pool.liquidYInterpolatedProperty.currentValue + boatHeight * BOAT_READY_TO_SPILL_OUT_THRESHOLD ) {
          this.spillingWaterOutOfBoat = true;
        }
      }
      else {
        // If the boat is empty, stop spilling
        this.spillingWaterOutOfBoat = false;
      }

      // If the boat is out of the water, spill the water back into the pool
      if ( this.spillingWaterOutOfBoat ) {
        boatExcess = Math.min( FILL_EMPTY_MULTIPLIER * boat.volumeProperty.value, boatLiquidVolume );
      }
      else if ( boatLiquidVolume > 0 &&
                Math.abs( boatBasin.liquidYInterpolatedProperty.currentValue - boatBasin.stepTop ) >= BOAT_FULL_THRESHOLD ) {
        // If the boat is neither full nor empty, nor spilling, then it is currently filling up. We will up no matter
        // the current water leve or the boat AND no matter the boats position. This is because the boat can only
        // ever be full or empty (or animating to one of those states).

        const excess = Math.min( FILL_EMPTY_MULTIPLIER * boat.volumeProperty.value, boatBasinMaximumVolume - boatLiquidVolume ); // This animates the boat spilling in
        poolExcess = excess;
        boatExcess = -excess;
      }

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
      boatBasin.liquidVolumeProperty.value = boatLiquidVolume;
    }
    else {
      boatBasin.liquidVolumeProperty.value = 0;
    }
    return poolLiquidVolume;
  }

  /**
   * Resets things to their original values.
   */
  public reset(): void {
    this.showGravityForceProperty.reset();
    this.showBuoyancyForceProperty.reset();
    this.showContactForceProperty.reset();
    this.showMassValuesProperty.reset();
    this.showForceValuesProperty.reset();
    this.gravityProperty.reset();
    this.liquidMaterialProperty.reset();
    this.spillingWaterOutOfBoat = false;

    this.pool.reset();
    this.masses.forEach( mass => mass.reset() );

    this.poolScaleHeightProperty && this.poolScaleHeightProperty.reset();
  }

  /**
   * Steps forward in time. This is a "simulation step", not a "physics engine step"
   */
  public step( dt: number ): void {
    this.engine.step( dt );

    this.masses.forEach( mass => {
      mass.step( dt, this.engine.interpolationRatio );
    } );

    this.pool.liquidYInterpolatedProperty.setRatio( this.engine.interpolationRatio );
  }

  /**
   * Moves masses' previous positions to their current positions.
   */
  protected syncPreviousMassPositionsToCurrent(): void {
    this.masses.forEach( mass => this.engine.bodySynchronizePrevious( mass.body ) );
  }

  /**
   * Positions masses from the left of the pool outward, with padding
   */
  public positionMassesLeft( masses: Cuboid[] ): void {
    let position = this.poolBounds.minX;

    masses.forEach( mass => {
      mass.matrix.setToTranslation(
        position - BLOCK_SPACING - mass.sizeProperty.value.width / 2,
        -mass.sizeProperty.value.minY
      );
      position -= BLOCK_SPACING + mass.sizeProperty.value.width;
      mass.writeData();
      mass.transformedEmitter.emit();
    } );
  }

  /**
   * Positions masses from the right of the pool outward, with padding
   */
  public positionMassesRight( masses: Cuboid[] ): void {
    let position = this.poolBounds.maxX;

    masses.forEach( mass => {
      mass.matrix.setToTranslation(
        position + BLOCK_SPACING + mass.sizeProperty.value.width / 2,
        -mass.sizeProperty.value.minY
      );
      position += BLOCK_SPACING + mass.sizeProperty.value.width;
      mass.writeData();
      mass.transformedEmitter.emit();
    } );
  }

  /**
   * Positions masses from the left of the pool up
   */
  public positionStackLeft( masses: Cuboid[] ): void {
    const x = this.poolBounds.minX - BLOCK_SPACING - Math.max( ...masses.map( mass => mass.sizeProperty.value.width ) ) / 2;

    this.positionStack( masses, x );
  }

  /**
   * Positions masses from the right of the pool up
   */
  public positionStackRight( masses: Cuboid[] ): void {
    const x = this.poolBounds.maxX + BLOCK_SPACING + Math.max( ...masses.map( mass => mass.sizeProperty.value.width ) ) / 2;

    this.positionStack( masses, x );
  }

  /**
   * Position a stack of masses at a given center x.
   */
  private positionStack( masses: Cuboid[], x: number ): void {
    let position = 0;

    masses = _.sortBy( masses, mass => -mass.volumeProperty.value );

    masses.forEach( mass => {
      mass.matrix.setToTranslation( x, position + mass.sizeProperty.value.height / 2 );
      position += mass.sizeProperty.value.height;
      mass.writeData();
      this.engine.bodySynchronizePrevious( mass.body );
      mass.transformedEmitter.emit();
    } );
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyModel', DensityBuoyancyModel );