// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Explore screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
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
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import propertyStateHandlerSingleton from '../../../../axon/js/propertyStateHandlerSingleton.js';
import PropertyStatePhase from '../../../../axon/js/PropertyStatePhase.js';

export type BuoyancyExploreModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyExploreModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  public readonly blockA: Cube;
  public readonly blockB: Cube;

  public constructor( providedOptions: BuoyancyExploreModelOptions ) {

    const options = optionize<BuoyancyExploreModelOptions, EmptySelfOptions, DensityBuoyancyModelOptions>()( {
      fluidSelectionType: 'all'
    }, providedOptions );

    super( options );

    const blocksTandem = options.tandem.createTandem( 'blocks' );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: blocksTandem.createTandem( 'modeProperty' ),
      phetioFeatured: true
    } );

    const availableMassMaterials: MaterialSchema[] = [
      ...Material.SIMPLE_MASS_MATERIALS,
      'CUSTOM',
      Material.MATERIAL_R,
      Material.MATERIAL_S
    ];

    this.blockA = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: MassTag.OBJECT_A,
      tandem: blocksTandem.createTandem( 'blockA' ),
      availableMassMaterials: availableMassMaterials
    } );
    this.availableMasses.push( this.blockA );
    this.blockB = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( 0.05, 0.35 ), 13.5, {
      tag: MassTag.OBJECT_B,
      tandem: blocksTandem.createTandem( 'blockB' ),
      availableMassMaterials: availableMassMaterials,
      visible: false
    } );
    this.availableMasses.push( this.blockB );

    this.modeProperty.link( mode => {
      this.blockB.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

    // Undefer the materialInsideProperty before the applicationMode. For unknown reasons this fixes the order in the DynamicProperty link/unlink
    // see https://github.com/phetsims/buoyancy/issues/67
    propertyStateHandlerSingleton.registerPhetioOrderDependency( this.blockA.materialProperty, PropertyStatePhase.UNDEFER, this.modeProperty, PropertyStatePhase.UNDEFER );
    propertyStateHandlerSingleton.registerPhetioOrderDependency( this.blockB.materialProperty, PropertyStatePhase.UNDEFER, this.modeProperty, PropertyStatePhase.UNDEFER );

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

    this.blockA.reset();
    this.blockB.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'BuoyancyExploreModel', BuoyancyExploreModel );