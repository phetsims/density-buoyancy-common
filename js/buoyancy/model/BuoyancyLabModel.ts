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
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import SlidableScale from '../../common/model/SlidableScale.js';

export type BuoyancyLabModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyLabModel extends DensityBuoyancyModel {

  public readonly primaryMass: Cube;
  public readonly poolScale: Scale;

  public constructor( options: BuoyancyLabModelOptions ) {

    const tandem = options.tandem;

    super( combineOptions<DensityBuoyancyModelOptions>( {
      supportsDepthLines: true,
      showMassValuesDefault: true,
      usePoolScale: false // Creating our own
    }, options ) );


    this.primaryMass = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tandem: tandem.createTandem( 'blocks' ).createTandem( 'blockA' )
    } );
    this.availableMasses.push( this.primaryMass );

    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.65, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'scale1' ),
      canMove: false,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } ) );

    // Pool scale
    this.poolScale = new SlidableScale( this.engine, this.gravityProperty, {
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'poolScale' ),
      canMove: false, // No input listeners, but the PoolScaleHeightControl can still move it
      inputEnabledPropertyOptions: {
        phetioReadOnly: true
      }
    } );

    // Make sure to render it
    this.availableMasses.push( this.poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= this.poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    super.reset();

    this.primaryMass.reset();
  }
}

densityBuoyancyCommon.register( 'BuoyancyLabModel', BuoyancyLabModel );