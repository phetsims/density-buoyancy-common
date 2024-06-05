// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Cube from '../../common/model/Cube.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import TwoBlockMode from '../../common/model/TwoBlockMode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import MassTag from '../../common/model/MassTag.js';

export type DensityIntroModelOptions = DensityBuoyancyModelOptions;

export default class DensityIntroModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  public readonly primaryMass: Cuboid;
  public readonly secondaryMass: Cuboid;

  public constructor( options: DensityIntroModelOptions ) {

    const tandem = options.tandem;

    super( combineOptions<DensityIntroModelOptions>( {
      canShowForces: false,
      usePoolScale: false
    }, options ) );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: tandem.createTandem( 'modeProperty' ),
      phetioFeatured: true
    } );

    const blocksTandem = tandem.createTandem( 'blocks' );

    const minScreenVolume = DensityBuoyancyCommonConstants.MIN_CUBE_VOLUME;
    const maxScreenVolume = DensityBuoyancyCommonConstants.MAX_CUBE_VOLUME;

    this.primaryMass = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: MassTag.PRIMARY,
      tandem: blocksTandem.createTandem( 'blockA' ),

      minVolume: minScreenVolume,
      maxVolume: maxScreenVolume
    } );
    this.availableMasses.push( this.primaryMass );
    this.secondaryMass = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( 0.2, 0.2 ), 13.5, {
      tag: MassTag.SECONDARY,
      tandem: blocksTandem.createTandem( 'blockB' ),
      visible: false,

      minVolume: minScreenVolume,
      maxVolume: maxScreenVolume
    } );
    this.availableMasses.push( this.secondaryMass );

    this.modeProperty.link( mode => {
      this.secondaryMass.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.modeProperty.reset();

    this.primaryMass.reset();
    this.secondaryMass.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'DensityIntroModel', DensityIntroModel );