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
import MaterialEnumeration from '../../common/model/MaterialEnumeration.js';

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

    // This step is required because, for this screen, MaterialEnumeration does not use all of the simple materials.
    // So we have to filter out the ones that are not used for phet-io valid values.
    const simpleMaterialsIdentifiers = Material.SIMPLE_MASS_MATERIALS.map( x => x.identifier ) as string[];
    const simpleMaterialsInEnumerationKeys = MaterialEnumeration.enumeration.keys.filter( name => simpleMaterialsIdentifiers.includes( name ) );
    // @ts-expect-error TODO: is this string indexing correct? https://github.com/phetsims/density-buoyancy-common/issues/176
    const validSimpleMaterials = simpleMaterialsInEnumerationKeys.map( x => MaterialEnumeration[ x ] ).concat( [ MaterialEnumeration.CUSTOM ] );

    this.massA = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: MassTag.PRIMARY,
      adjustableMaterial: true,
      materialEnumPropertyValidValues: validSimpleMaterials,
      adjustableColor: false,
      tandem: blocksTandem.createTandem( 'blockA' )
    } );
    this.availableMasses.push( this.massA );
    this.massB = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( 0.05, 0.35 ), 13.5, {
      tag: MassTag.SECONDARY,
      adjustableMaterial: true,
      materialEnumPropertyValidValues: validSimpleMaterials,
      adjustableColor: false,
      tandem: blocksTandem.createTandem( 'blockB' ),
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