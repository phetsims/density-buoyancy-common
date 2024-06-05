// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import Range from '../../../../../dot/js/Range.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import BooleanIO from '../../../../../tandem/js/types/BooleanIO.js';
import { BottleOrBoat, BottleOrBoatValues } from './BottleOrBoat.js';
import StringUnionProperty from '../../../../../axon/js/StringUnionProperty.js';
import MassTag from '../../../common/model/MassTag.js';

export type BuoyancyApplicationsModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyApplicationsModel extends DensityBuoyancyModel {

  public readonly sceneProperty: StringUnionProperty<BottleOrBoat>;

  public readonly bottle: Bottle;
  public readonly block: Cube;
  public readonly boat: Boat;
  private readonly scale1: Scale; // Scale sitting on the ground next to the pool

  // REVIEW: Should these Properties move to Bottle?
  // For the material inside the bottle.
  public readonly customDensityProperty: NumberProperty;
  public readonly customDensityControlVisibleProperty: TReadOnlyProperty<boolean>;

  public constructor( options: BuoyancyApplicationsModelOptions ) {

    const tandem = options.tandem;

    super( options );

    this.sceneProperty = new StringUnionProperty<BottleOrBoat>( 'bottle', {
      validValues: BottleOrBoatValues,
      tandem: options.tandem.createTandem( 'sceneProperty' )
    } );

    const objectsTandem = tandem.createTandem( 'objects' );

    this.bottle = new Bottle( this.engine, {
      matrix: Matrix3.translation( 0, 0 ),
      tandem: objectsTandem.createTandem( 'bottle' ),
      visible: true,
      tag: MassTag.PRIMARY
    } );
    this.availableMasses.push( this.bottle );

    this.block = Cube.createWithVolume( this.engine, Material.BRICK, new Vector2( -0.5, 0.3 ), 0.001, {
      visible: false,
      tandem: objectsTandem.createTandem( 'block' )
    } );
    this.availableMasses.push( this.block );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.boat = new Boat( this.engine, new DerivedProperty( [ this.block.sizeProperty ], size => size.depth ), this.liquidMaterialProperty, {
      matrix: Matrix3.translation( 0, -0.1 ),
      tandem: objectsTandem.createTandem( 'boat' ),
      visible: false
    } );
    this.availableMasses.push( this.boat );

    this.scale1 = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.77, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'scale1' ),
      canMove: false,
      inputEnabledPropertyOptions: {

        // REVIEW: Why can the input enabled be turned on? Is this adding a phet-io feature that makes the scale movable?
        // If so, is changing the inputEnabledProperty to true the only thing that has to happen to make it work?
        phetioReadOnly: false
      }
    } );
    this.availableMasses.push( this.scale1 );

    this.customDensityProperty = new NumberProperty( 1, {
      range: new Range( 0.05, 20 ),
      tandem: tandem.createTandem( 'customDensityProperty' ),
      phetioFeatured: true,
      units: 'kg/L'
    } );
    this.customDensityControlVisibleProperty = new DerivedProperty( [ this.bottle.interiorMaterialProperty ],
      material => material.custom, {
        tandem: tandem.createTandem( 'customDensityControlVisibleProperty' ),
        phetioValueType: BooleanIO
      } );

    // Adjust pool volume so that it's at the desired value WITH the pool scales inside.
    // REVIEW: How does this relate to https://github.com/phetsims/density-buoyancy-common/blob/4038cb05c2b5c2b8b1f600bfbcf0a7eaac4617a2/js/common/model/DensityBuoyancyModel.ts#L435-L437
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.sceneProperty.link( ( scene, previousScene ) => {
      this.bottle.internalVisibleProperty.value = scene === 'bottle';
      this.boat.internalVisibleProperty.value = scene === 'boat';
      this.block.internalVisibleProperty.value = scene === 'boat';

      // As described in https://github.com/phetsims/buoyancy/issues/118#issue-2192969056, the underwater scale only shows for the bottle scene, not for the boat
      this.poolScale!.internalVisibleProperty.value = scene === 'bottle';

      // When switching from boat to bottle scene, subtract the scale volume from the pool and vice versa (-1 and 1)
      // But don't do it when the bottle scene is first loaded (0)
      const plusMinusScaleVolume = scene === 'bottle' ?
                                   previousScene === 'boat' ? -1 : 0 : 1;
      this.pool.liquidVolumeProperty.value += plusMinusScaleVolume * this.poolScale!.volumeProperty.value;
      this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );

      assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
        'Boat and bottle should not be visible at the same time' );
    } );
  }

  public override step( dt: number ): void {
    assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
      'Boat and bottle should not be visible at the same time' );

    super.step( dt );
  }

  public override getBoat(): Boat | null {
    return this.boat;
  }

  /**
   * Moves the boat and block to their initial locations (see https://github.com/phetsims/buoyancy/issues/25)
   */
  public resetBoatScene(): void {

    // Reset the basin levels (clear the liquid out of the boat)
    this.boat.basin.reset();
    this.pool.reset();

    // Move things to the initial position
    this.boat.resetPosition();
    this.block.resetPosition();
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {

    // REVIEW: Can we call resetBoatScene from reset?

    this.bottle.reset();
    this.block.reset();
    this.boat.reset();

    this.customDensityProperty.reset();

    super.reset();

    this.sceneProperty.reset();

    assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
      'Boat and bottle should not be visible at the same time' );
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );