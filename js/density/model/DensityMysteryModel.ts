// Copyright 2020-2024, University of Colorado Boulder

/**
 * The main model for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { toCubicMeters } from '../../common/DensityBuoyancyCommonConstants.js';
import BlockSetModel, { BlockSetModelOptions } from '../../common/model/BlockSetModel.js';
import Cube, { CubeOptions } from '../../common/model/Cube.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Cuboid from '../../common/model/Cuboid.js';
import MassTag from '../../common/model/MassTag.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import LocalizedStringProperty from '../../../../chipper/js/LocalizedStringProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// constants
const randomMaterials = Material.DENSITY_MYSTERY_MATERIALS;
const randomColors = [
  DensityBuoyancyCommonColors.compareYellowColorProperty,
  DensityBuoyancyCommonColors.compareBlueColorProperty,
  DensityBuoyancyCommonColors.compareGreenColorProperty,
  DensityBuoyancyCommonColors.compareRedColorProperty,
  DensityBuoyancyCommonColors.comparePurpleColorProperty,
  DensityBuoyancyCommonColors.mysteryPinkColorProperty,
  DensityBuoyancyCommonColors.mysteryOrangeColorProperty,
  DensityBuoyancyCommonColors.mysteryLightPurpleColorProperty,
  DensityBuoyancyCommonColors.mysteryLightGreenColorProperty,
  DensityBuoyancyCommonColors.mysteryBrownColorProperty,
  DensityBuoyancyCommonColors.mysteryWhiteColorProperty,
  DensityBuoyancyCommonColors.mysteryGrayColorProperty,
  DensityBuoyancyCommonColors.mysteryMustardColorProperty,
  DensityBuoyancyCommonColors.mysteryPeachColorProperty,
  DensityBuoyancyCommonColors.mysteryMaroonColorProperty
];

export class MysteryBlockSet extends EnumerationValue {
  public static readonly SET_1 = new MysteryBlockSet( DensityBuoyancyCommonStrings.blockSet.set1StringProperty, 'set1' );
  public static readonly SET_2 = new MysteryBlockSet( DensityBuoyancyCommonStrings.blockSet.set2StringProperty, 'set2' );
  public static readonly SET_3 = new MysteryBlockSet( DensityBuoyancyCommonStrings.blockSet.set3StringProperty, 'set3' );
  public static readonly RANDOM = new MysteryBlockSet( DensityBuoyancyCommonStrings.blockSet.randomStringProperty, 'random' );

  public constructor( public readonly stringProperty: LocalizedStringProperty, public readonly tandemName: string ) {
    super();
  }

  public static readonly enumeration = new Enumeration( MysteryBlockSet, {
    phetioDocumentation: 'Block set'
  } );
}

export type DensityMysteryModelOptions = StrictOmit<BlockSetModelOptions<MysteryBlockSet>, 'initialMode' | 'BlockSet' | 'createMassesCallback' | 'regenerateMassesCallback' | 'positionMassesCallback'>;

export default class DensityMysteryModel extends BlockSetModel<MysteryBlockSet> {

  private readonly scale: Scale;

  public constructor( providedOptions: DensityMysteryModelOptions ) {

    const tandem = providedOptions.tandem;

    const commonCubeOptions = {
      adjustVolumeOnMassChanged: true,
      adjustableMaterial: true
    };

    // TODO: this should just set density/color on 5 references that live forever. https://github.com/phetsims/density-buoyancy-common/issues/256
    const createMysteryMaterials = () => {
      const densities = dotRandom.shuffle( randomMaterials ).slice( 0, 5 ).map( material => material.density );
      const colors = dotRandom.shuffle( randomColors ).slice( 0, 5 );

      // TODO: Specify the correct tandems throughout this file? See https://github.com/phetsims/density-buoyancy-common/issues/123
      return _.range( 0, 5 ).map( i => Material.createCustomMaterial( Tandem.OPT_OUT, {
        density: densities[ i ],
        colorProperty: colors[ i ]
      } ) );
    };
    const createMysteryVolumes = () => {
      return [
        // we will want 3 smaller masses on the right, then 2 larger masses on the left
        ...dotRandom.shuffle( [ 1, 2, 3, 4, 5, 6 ].map( toCubicMeters ) ).slice( 0, 3 ),
        ...dotRandom.shuffle( [ 7, 8, 9, 10 ].map( toCubicMeters ) ).slice( 0, 2 )
      ].sort();
    };

    const blockSetsTandem = tandem.createTandem( 'blockSets' );
    const set1Tandem = blockSetsTandem.createTandem( 'set1' );
    const set2Tandem = blockSetsTandem.createTandem( 'set2' );
    const set3Tandem = blockSetsTandem.createTandem( 'set3' );
    const randomTandem = blockSetsTandem.createTandem( 'random' );

    const createMasses = ( model: DensityBuoyancyModel, blockSet: MysteryBlockSet ) => {
      switch( blockSet ) {
        case MysteryBlockSet.SET_1:
          return [
            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: Material.WATER.density,
                colorProperty: DensityBuoyancyCommonColors.compareRedColorProperty
              } ),
              Vector2.ZERO,
              0.005,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_D, tandem: set1Tandem.createTandem( `block${MassTag.ONE_D.tandemName}` ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: Material.WOOD.density,
                colorProperty: DensityBuoyancyCommonColors.compareBlueColorProperty
              } ),
              Vector2.ZERO,
              0.001,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_B, tandem: set1Tandem.createTandem( `block${MassTag.ONE_B.tandemName}` ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: Material.WOOD.density,
                colorProperty: DensityBuoyancyCommonColors.compareGreenColorProperty
              } ),
              Vector2.ZERO,
              0.007,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_E, tandem: set1Tandem.createTandem( `block${MassTag.ONE_E.tandemName}` ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: Material.GOLD.density,
                colorProperty: DensityBuoyancyCommonColors.compareYellowColorProperty
              } ),
              Vector2.ZERO,
              0.001,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_C, tandem: set1Tandem.createTandem( `block${MassTag.ONE_C.tandemName}` ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: Material.DIAMOND.density,
                colorProperty: DensityBuoyancyCommonColors.comparePurpleColorProperty
              } ),
              Vector2.ZERO,
              0.0055,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_A, tandem: set1Tandem.createTandem( `block${MassTag.ONE_A.tandemName}` ) } )
            )
          ];
        case MysteryBlockSet.SET_2:
          return [
            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 4500,
                colorProperty: DensityBuoyancyCommonColors.mysteryPinkColorProperty
              } ),
              Vector2.ZERO,
              18,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_D, tandem: set2Tandem.createTandem( `block${MassTag.TWO_D.tandemName}` ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 11340,
                colorProperty: DensityBuoyancyCommonColors.mysteryOrangeColorProperty
              } ),
              Vector2.ZERO,
              18,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_A, tandem: set2Tandem.createTandem( `block${MassTag.TWO_A.tandemName}` ) } )
            ),

            Cube.createWithVolume(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: Material.COPPER.density,
                colorProperty: DensityBuoyancyCommonColors.mysteryLightPurpleColorProperty
              } ),
              Vector2.ZERO,
              0.005,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_E, tandem: set2Tandem.createTandem( `block${MassTag.TWO_E.tandemName}` ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 2700,
                colorProperty: DensityBuoyancyCommonColors.mysteryLightGreenColorProperty
              } ),
              Vector2.ZERO,
              2.7,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_C, tandem: set2Tandem.createTandem( `block${MassTag.TWO_C.tandemName}` ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 2700,
                colorProperty: DensityBuoyancyCommonColors.mysteryBrownColorProperty
              } ),
              Vector2.ZERO,
              10.8,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_B, tandem: set2Tandem.createTandem( `block${MassTag.TWO_B.tandemName}` ) } )
            )
          ];
        case MysteryBlockSet.SET_3:
          return [
            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 950,
                colorProperty: DensityBuoyancyCommonColors.mysteryWhiteColorProperty
              } ),
              Vector2.ZERO,
              6,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_E, tandem: set3Tandem.createTandem( `block${MassTag.THREE_E.tandemName}` ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 1000, // same as water, in SI (kg/m^3)
                colorProperty: DensityBuoyancyCommonColors.mysteryGrayColorProperty
              } ),
              Vector2.ZERO,
              6,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_B, tandem: set3Tandem.createTandem( `block${MassTag.THREE_B.tandemName}` ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 400,
                colorProperty: DensityBuoyancyCommonColors.mysteryMustardColorProperty
              } ),
              Vector2.ZERO,
              2,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_D, tandem: set3Tandem.createTandem( `block${MassTag.THREE_D.tandemName}` ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 7800,
                colorProperty: DensityBuoyancyCommonColors.mysteryPeachColorProperty
              } ),
              Vector2.ZERO,
              23.4,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_C, tandem: set3Tandem.createTandem( `block${MassTag.THREE_C.tandemName}` ) } )
            ),

            Cube.createWithMass(
              model.engine,
              Material.createCustomMaterial( Tandem.OPT_OUT, {
                density: 950,
                colorProperty: DensityBuoyancyCommonColors.mysteryMaroonColorProperty
              } ),
              Vector2.ZERO,
              2.85,
              combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_A, tandem: set3Tandem.createTandem( `block${MassTag.THREE_A.tandemName}` ) } )
            )
          ];
        case MysteryBlockSet.RANDOM: {
          const tags = [
            MassTag.C,
            MassTag.D,
            MassTag.E,
            MassTag.A,
            MassTag.B
          ];

          const mysteryMaterials = createMysteryMaterials();
          const mysteryVolumes = createMysteryVolumes();

          return _.range( 0, 5 ).map( i => {
            return Cube.createWithVolume( model.engine, mysteryMaterials[ i ], Vector2.ZERO, mysteryVolumes[ i ], {
              adjustVolumeOnMassChanged: true,
              adjustableMaterial: true,
              tag: tags[ i ],
              tandem: randomTandem.createTandem( `block${tags[ i ].tandemName}` )
            } );
          } );
        }
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    const regenerateMasses = ( blockSet: MysteryBlockSet, masses: Cuboid[] ) => {
      if ( blockSet === MysteryBlockSet.RANDOM ) {
        const mysteryMaterials = createMysteryMaterials();
        const mysteryVolumes = createMysteryVolumes();

        masses.forEach( ( mass, i ) => {
          mass.materialProperty.value = mysteryMaterials[ i ];
          mass.updateSize( Cube.boundsFromVolume( mysteryVolumes[ i ] ) );
        } );
      }
    };

    const positionMasses = ( model: DensityBuoyancyModel, blockSet: MysteryBlockSet, masses: Cuboid[] ) => {
      switch( blockSet ) {
        case MysteryBlockSet.SET_1:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case MysteryBlockSet.SET_2:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case MysteryBlockSet.SET_3:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case MysteryBlockSet.RANDOM:
          model.positionStackLeft( [ masses[ 3 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 0 ], masses[ 1 ], masses[ 2 ] ] );
          break;
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    const options = optionize<DensityMysteryModelOptions, EmptySelfOptions, BlockSetModelOptions<MysteryBlockSet>>()( {

      initialMode: MysteryBlockSet.SET_1,
      BlockSet: MysteryBlockSet.enumeration,

      // Prefer callbacks to overridden abstract methods in this case because it is an antipattern to have the parent
      // type call an overridden method, since the subtype may not have been fully constructed yet and have undefined
      // members.
      createMassesCallback: createMasses,
      regenerateMassesCallback: regenerateMasses,
      positionMassesCallback: positionMasses,

      usePoolScale: false
    }, providedOptions );

    super( options );

    const scalePositionProperty = new DerivedProperty( [ this.invisibleBarrierBoundsProperty ], bounds => {
      return new Vector2( -0.75 + bounds.minX + 0.875, -Scale.SCALE_BASE_BOUNDS.minY );
    } );

    this.scale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translationFromVector( scalePositionProperty.value ),
      displayType: DisplayType.KILOGRAMS,
      canMove: false,
      tandem: tandem.createTandem( 'scale' ),
      massPropertyOptions: {
        phetioFeatured: false
      },
      materialPropertyOptions: {
        phetioFeatured: false
      },
      volumePropertyOptions: {
        phetioFeatured: false
      },
      inputEnabledPropertyOptions: {
        phetioFeatured: false
      }
    } );
    this.availableMasses.push( this.scale );

    // Move the scale with the barrier, see https://github.com/phetsims/density/issues/73
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    scalePositionProperty.lazyLink( position => {
      this.scale.matrix.set02( position.x );
      this.scale.matrix.set12( position.y );
      this.scale.writeData();

      // When we reset-all, we'll want it to move back to here
      this.scale.setResetLocation();

      // Adjust its previous position also
      this.engine.bodySynchronizePrevious( this.scale.body );

      this.scale.transformedEmitter.emit();
    } );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    super.reset();

    // Make sure to create new random masses on a reset
    this.regenerate( MysteryBlockSet.RANDOM );
  }
}

densityBuoyancyCommon.register( 'DensityMysteryModel', DensityMysteryModel );