// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Explore screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import TwoBlockMode from '../../common/model/TwoBlockMode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassTag from '../../common/model/MassTag.js';
import { MaterialSchema } from '../../common/model/Mass.js';

type BuoyancyBasicsExploreModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyBasicsExploreModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  public readonly massA: Cube;
  public readonly massB: Cube;

  public constructor( options: BuoyancyBasicsExploreModelOptions ) {

    super( options );

    const blocksTandem = options.tandem.createTandem( 'blocks' );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: blocksTandem.createTandem( 'modeProperty' ),
      phetioFeatured: true
    } );

    const availableMassMaterials: MaterialSchema[] = [
      ...Material.SIMPLE_MASS_MATERIALS,
      'CUSTOM'
    ];

    const blockATandem = blocksTandem.createTandem( 'blockA' );
    this.massA = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: MassTag.OBJECT_A,
      adjustableMaterial: true,
      adjustableColor: false,
      availableMassMaterials: availableMassMaterials,
      tandem: blockATandem
    } );
    this.availableMasses.push( this.massA );

    const blockBTandem = blocksTandem.createTandem( 'blockB' );
    this.massB = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( 0.05, 0.35 ), 13.5, {
      tag: MassTag.OBJECT_B,
      adjustableMaterial: true,
      adjustableColor: false,
      availableMassMaterials: availableMassMaterials,
      tandem: blockBTandem,
      visible: false
    } );
    this.availableMasses.push( this.massB );

    this.modeProperty.link( mode => {
      this.massB.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.65, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: options.tandem.createTandem( 'scale' ),
      canMove: true,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } ) );
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

densityBuoyancyCommon.register( 'BuoyancyBasicsExploreModel', BuoyancyBasicsExploreModel );