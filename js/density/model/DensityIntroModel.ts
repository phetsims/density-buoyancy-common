// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
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
import MassTag from '../../common/model/MassTag.js';

export type DensityIntroModelOptions = DensityBuoyancyModelOptions;

export default class DensityIntroModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  public readonly massA: Cuboid;
  public readonly massB: Cuboid;

  public constructor( options: DensityIntroModelOptions ) {

    const tandem = options.tandem;

    super( combineOptions<DensityIntroModelOptions>( {
      usePoolScale: false
    }, options ) );

    const blocksTandem = tandem.createTandem( 'blocks' );
    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: blocksTandem.createTandem( 'modeProperty' ),
      phetioFeatured: true
    } );

    this.massA = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: MassTag.OBJECT_A,
      tandem: blocksTandem.createTandem( 'blockA' )
    } );
    this.availableMasses.push( this.massA );
    this.massB = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( 0.2, 0.2 ), 13.5, {
      tag: MassTag.OBJECT_B,
      tandem: blocksTandem.createTandem( 'blockB' ),
      visible: false
    } );
    this.availableMasses.push( this.massB );

    this.modeProperty.link( mode => {
      this.massB.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.modeProperty.reset();

    this.massA.reset();
    this.massB.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'DensityIntroModel', DensityIntroModel );