// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Cube from '../../../common/model/Cube.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../../common/model/DensityBuoyancyModel.js';
import Material from '../../../common/model/Material.js';
import Scale, { DisplayType } from '../../../common/model/Scale.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import Boat from './Boat.js';
import Bottle from './Bottle.js';
import { BottleOrBoat, BottleOrBoatValues } from './BottleOrBoat.js';
import StringUnionProperty from '../../../../../axon/js/StringUnionProperty.js';
import MassTag from '../../../common/model/MassTag.js';
import Basin from '../../../common/model/Basin.js';
import Mass from '../../../common/model/Mass.js';

export type BuoyancyApplicationsModelOptions = DensityBuoyancyModelOptions;

// Faster than normal stepping to fill the boat (kind of like animation speed)
const FILL_EMPTY_MULTIPLIER = 0.3;

// 90% of the boat is out of the fluid before spilling out the full boat
const BOAT_READY_TO_SPILL_OUT_THRESHOLD = 0.9;

// Y model distance of tolerance between the boat basin fluidY level and the boat basin stepTop. This was needed to
// prevent filling thrashing as a containing mass floats around. See updateFluid();
const BOAT_FULL_THRESHOLD = 0.01;

export default class BuoyancyApplicationsModel extends DensityBuoyancyModel {

  public readonly sceneProperty: StringUnionProperty<BottleOrBoat>;

  public readonly bottle: Bottle;
  public readonly block: Cube;
  public readonly boat: Boat;
  private readonly scale: Scale; // Scale sitting on the ground next to the pool

  // Flag that sets an animation to empty the boat of any fluid inside of it
  protected spillingWaterOutOfBoat = false;

  public constructor( options: BuoyancyApplicationsModelOptions ) {

    const tandem = options.tandem;

    super( options );

    this.sceneProperty = new StringUnionProperty<BottleOrBoat>( 'BOTTLE', {
      validValues: BottleOrBoatValues,
      tandem: options.tandem.createTandem( 'sceneProperty' )
    } );

    const objectsTandem = tandem.createTandem( 'objects' );

    this.bottle = new Bottle( this.engine, {
      matrix: Matrix3.translation( 0, 0 ),
      tandem: objectsTandem.createTandem( 'bottle' ),
      visible: true,
      tag: MassTag.OBJECT_A
    } );
    this.availableMasses.push( this.bottle );

    this.block = Cube.createWithVolume( this.engine, Material.BRICK, new Vector2( -0.5, 0.3 ), 0.001, {
      visible: false,
      tandem: objectsTandem.createTandem( 'block' )
    } );
    this.availableMasses.push( this.block );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.boat = new Boat( this.engine, new DerivedProperty( [ this.block.sizeProperty ], size => size.depth ), this.pool.fluidMaterialProperty, {
      matrix: Matrix3.translation( 0, -0.1 ),
      tandem: objectsTandem.createTandem( 'boat' ),
      visible: false
    } );
    this.availableMasses.push( this.boat );

    this.scale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.77, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'scale' ),
      canMove: false,
      inputEnabledPropertyOptions: {

        // REVIEW: Why can the input enabled be turned on? Is this adding a phet-io feature that makes the scale movable?
        // If so, is changing the inputEnabledProperty to true the only thing that has to happen to make it work?
        phetioReadOnly: false
      }
    } );
    this.availableMasses.push( this.scale );

    // Adjust pool volume so that it's at the desired value WITH the pool scales inside.
    // REVIEW: How does this relate to https://github.com/phetsims/density-buoyancy-common/blob/4038cb05c2b5c2b8b1f600bfbcf0a7eaac4617a2/js/common/model/DensityBuoyancyModel.ts#L435-L437
    this.pool.fluidVolumeProperty.setInitialValue( this.pool.fluidVolumeProperty.value );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.sceneProperty.link( ( scene, previousScene ) => {
      this.bottle.internalVisibleProperty.value = scene === 'BOTTLE';
      this.boat.internalVisibleProperty.value = scene === 'BOAT';
      this.block.internalVisibleProperty.value = scene === 'BOAT';

      // As described in https://github.com/phetsims/buoyancy/issues/118#issue-2192969056, the submerged scale only shows for the bottle scene, not for the boat
      this.pool.scale!.internalVisibleProperty.value = scene === 'BOTTLE';

      // When switching from boat to bottle scene, subtract the scale volume from the pool and vice versa (-1 and 1)
      // But don't do it when the bottle scene is first loaded (0)
      const plusMinusScaleVolume = scene === 'BOTTLE' ?
                                   previousScene === 'BOAT' ? -1 : 0 : 1;
      this.pool.fluidVolumeProperty.value += plusMinusScaleVolume * this.pool.scale!.volumeProperty.value;
      this.pool.fluidVolumeProperty.setInitialValue( this.pool.fluidVolumeProperty.value );

      assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
        'Boat and bottle should not be visible at the same time' );
    } );
  }

  public override step( dt: number ): void {
    assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
      'Boat and bottle should not be visible at the same time' );

    super.step( dt );
  }

  /**
   * Moves the boat and block to their initial locations (see https://github.com/phetsims/buoyancy/issues/25)
   */
  public resetBoatScene(): void {

    // Reset the basin levels (clear the liquid out of the boat)
    this.boat.basin.reset();
    this.pool.reset( false );

    // Move things to the initial position
    this.boat.resetPosition();
    this.block.resetPosition();

    // REVIEW: Can we call boat.reset() here?
    this.boat.verticalAcceleration = 0;
    this.boat.verticalVelocity = 0;

    this.spillingWaterOutOfBoat = false;
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {

    // REVIEW: Can we call resetBoatScene from reset?

    this.bottle.reset();
    this.block.reset();
    this.boat.reset();

    super.reset();
    this.spillingWaterOutOfBoat = false;

    this.sceneProperty.reset();

    assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
      'Boat and bottle should not be visible at the same time' );
  }

  /**
   * Computes the heights of the main pool liquid, incorporating the Boat logic.
   * NOTE: This does not call super.updateFluid() because we need to handle the boat logic interspersed with the rest of the logic here.
   */
  protected override updateFluid(): void {

    const boat = this.boat;

    const basins: Basin[] = [ this.pool ];
    if ( boat.visibleProperty.value ) {
      basins.push( boat.basin );
      this.pool.childBasin = boat.basin;
    }
    else {
      this.pool.childBasin = null;
    }

    // If we have a boat that is NOT submerged, we'll assign masses into the boat's basin where relevant. Otherwise,
    // anything will go just into the pool's basin.
    // Note the order is important here, as the boat basin takes precedence.
    const assignableBasins = boat && boat.visibleProperty.value && !boat.isFullySubmerged ? [ boat.basin, this.pool ] : [ this.pool ];

    this.updateFluidForBasins( basins, assignableBasins );
  }

  // May need to adjust volumes between the boat/pool if there is a boat
  protected override getPoolFluidVolume(): number {

    let poolFluidVolume = this.pool.fluidVolumeProperty.value;

    const boat = this.boat;

    assert && assert( boat, 'boat needed to update liquids for boat' );

    const boatBasin = boat.basin;
    if ( boat.visibleProperty.value ) {
      let boatFluidVolume = boatBasin.fluidVolumeProperty.value;
      const boatBasinMaximumVolume = boatBasin.getMaximumVolume( boatBasin.stepTop );

      const poolEmptyVolumeToBoatTop = this.pool.getEmptyVolume( Math.min( boat.stepTop, this.poolBounds.maxY ) );
      const boatEmptyVolumeToBoatTop = boatBasin.getEmptyVolume( boat.stepTop );

      // Calculate adjustments to fluid volumes to match the current space in the basin
      let poolExcess = poolFluidVolume - poolEmptyVolumeToBoatTop;
      let boatExcess = boatFluidVolume - boatEmptyVolumeToBoatTop;

      const boatHeight = boat.shapeProperty.value.getBounds().height;

      if ( boatFluidVolume ) {

        // If the top of the boat is out of the fluid past the height threshold, spill the fluid back into the pool
        // (even if not totally full).
        if ( boat.stepTop > this.pool.fluidYInterpolatedProperty.currentValue + boatHeight * BOAT_READY_TO_SPILL_OUT_THRESHOLD ) {
          this.spillingWaterOutOfBoat = true;
        }
      }
      else {
        // If the boat is empty, stop spilling
        this.spillingWaterOutOfBoat = false;
      }

      // If the boat is out of the fluid, spill the fluid back into the pool
      if ( this.spillingWaterOutOfBoat ) {
        boatExcess = Math.min( FILL_EMPTY_MULTIPLIER * boat.volumeProperty.value, boatFluidVolume );
      }
      else if ( boatFluidVolume > 0 &&
                Math.abs( boatBasin.fluidYInterpolatedProperty.currentValue - boatBasin.stepTop ) >= BOAT_FULL_THRESHOLD ) {
        // If the boat is neither full nor empty, nor spilling, then it is currently filling up. We will up no matter
        // the current fluid leve or the boat AND no matter the boats position. This is because the boat can only
        // ever be full or empty (or animating to one of those states).

        const excess = Math.min( FILL_EMPTY_MULTIPLIER * boat.volumeProperty.value, boatBasinMaximumVolume - boatFluidVolume ); // This animates the boat spilling in
        poolExcess = excess;
        boatExcess = -excess;
      }

      if ( poolExcess > 0 && boatExcess < 0 ) {
        const transferVolume = Math.min( poolExcess, -boatExcess );
        poolFluidVolume -= transferVolume;
        boatFluidVolume += transferVolume;
      }
      else if ( boatExcess > 0 ) {
        // If the boat overflows, just dump the rest in the pool
        poolFluidVolume += boatExcess;
        boatFluidVolume -= boatExcess;
      }
      boatBasin.fluidVolumeProperty.value = boatFluidVolume;
    }
    else {

      // When the boat is hidden (whether via changing scene or by phet-io), move the fluid from the boat basin to the pool.
      poolFluidVolume += boatBasin.fluidVolumeProperty.value;
      boatBasin.fluidVolumeProperty.value = 0;
    }
    return poolFluidVolume;
  }

  protected override getUpdatedSubmergedVolume( mass: Mass, submergedVolume: number ): number {

    if ( mass === this.boat && this.boat.isFullySubmerged ) {

      // Special consideration for when boat is submerged
      // Don't count the liquid inside the boat as part of the volume
      return this.boat.volumeProperty.value;
    }
    else {
      return super.getUpdatedSubmergedVolume( mass, submergedVolume );
    }
  }

  protected override getUpdatedMassValue( mass: Mass, massValue: number, submergedVolume: number ): number {
    if ( mass === this.boat && this.boat.isFullySubmerged ) {

      // Special consideration for when boat is submerged
      // Don't count the liquid inside the boat as part of the mass
      return submergedVolume * this.boat.materialProperty.value.density;
    }
    else {
      return super.getUpdatedMassValue( mass, massValue, submergedVolume );
    }
  }

  // Vertical acceleration of the boat will change the buoyant force.
  protected override getAdditionalVerticalAcceleration( basin: Basin | null ): number {
    return basin === this.boat.basin ? this.boat.verticalAcceleration : 0;
  }

  protected override adjustVelocity( basin: Basin | null, velocity: Vector2 ): void {

    // If the boat is moving, assume the liquid moves with it, and apply viscosity due to the movement of our mass
    // inside the boat's liquid.
    if ( basin === this.boat.basin ) {
      velocity.subtract( this.engine.bodyGetVelocity( this.boat.body ) );
    }
  }

  protected override updateVerticalMotion( dt: number ): void {
    super.updateVerticalMotion( dt );

    if ( dt ) {
      this.boat.updateVerticalMotion( this.pool, dt );
    }
  }

}

densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );