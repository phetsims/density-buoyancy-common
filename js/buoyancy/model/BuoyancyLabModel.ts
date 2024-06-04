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

export type BuoyancyLabModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyLabModel extends DensityBuoyancyModel {

  public readonly primaryMass: Cube;

  public constructor( options: BuoyancyLabModelOptions ) {

    const tandem = options.tandem;

    super( combineOptions<DensityBuoyancyModelOptions>( {
      supportsDepthLines: true,
      showMassValuesDefault: true,
      usePoolScale: true
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