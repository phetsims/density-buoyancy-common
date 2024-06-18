// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Lab screen of the Buoyancy simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';

export type BuoyancyLabModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyLabModel extends DensityBuoyancyModel {

  public readonly block: Cube;

  public readonly fluidDisplacedVolumeProperty: TReadOnlyProperty<number>;

  public constructor( options: BuoyancyLabModelOptions ) {

    super( options );

    this.block = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tandem: options.tandem.createTandem( 'block' )
    } );
    this.availableMasses.push( this.block );

    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.65, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: options.tandem.createTandem( 'scale' ),
      canMove: false,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } ) );

    this.fluidDisplacedVolumeProperty = new DerivedProperty(
      [ this.block.submergedMassFractionProperty, this.block.volumeProperty ],
      ( submergedMassFraction, volume ) => {
        return submergedMassFraction * volume * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER;
      }
    );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    super.reset();

    this.block.reset();
  }
}

densityBuoyancyCommon.register( 'BuoyancyLabModel', BuoyancyLabModel );