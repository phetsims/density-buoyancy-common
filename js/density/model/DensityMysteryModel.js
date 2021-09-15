// Copyright 2020-2021, University of Colorado Boulder

/**
 * The main model for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import merge from '../../../../phet-core/js/merge.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import BlockSetModel from '../../common/model/BlockSetModel.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const randomMaterials = DensityBuoyancyCommonConstants.DENSITY_MYSTERY_MATERIALS;
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
const BlockSet = Enumeration.byKeys( [
  'SET_1',
  'SET_2',
  'SET_3',
  'RANDOM'
] );

class DensityMysteryModel extends BlockSetModel( DensityBuoyancyModel, BlockSet, BlockSet.SET_1 ) {
  /**
   * @mixes BlockSet
   * @param {Object} [options]
   */
  constructor( options ) {

    const tandem = options.tandem;

    const createMysteryMaterials = () => {
      const densities = dotRandom.shuffle( randomMaterials ).slice( 0, 5 ).map( material => material.density );
      const colors = dotRandom.shuffle( randomColors ).slice( 0, 5 );

      return _.range( 0, 5 ).map( i => Material.createCustomMaterial( {
        density: densities[ i ],
        customColor: colors[ i ]
      } ) );
    };
    const createMysteryVolumes = () => {
      return [
        // we will want 3 smaller masses on the right, then 2 larger masses on the left
        ...dotRandom.shuffle( [ 1, 2, 3, 4, 5, 6 ].map( n => n / 1000 ) ).slice( 0, 3 ),
        ...dotRandom.shuffle( [ 7, 8, 9, 10 ].map( n => n / 1000 ) ).slice( 0, 2 )
      ].sort();
    };

    const blockSetsTandem = tandem.createTandem( 'blockSets' );
    const set1Tandem = blockSetsTandem.createTandem( 'set1' );
    const set2Tandem = blockSetsTandem.createTandem( 'set2' );
    const set3Tandem = blockSetsTandem.createTandem( 'set3' );
    const randomTandem = blockSetsTandem.createTandem( 'random' );

    const createMasses = ( model, blockSet ) => {
      switch( blockSet ) {
        case BlockSet.SET_1:
          return [
            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.WATER.density,
              customColor: DensityBuoyancyCommonColors.compareRedColorProperty
            } ), Vector2.ZERO, 0.005, { tag: Mass.MassTag.ONE_D, tandem: set1Tandem.createTandem( 'block1D' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.WOOD.density,
              customColor: DensityBuoyancyCommonColors.compareBlueColorProperty
            } ), Vector2.ZERO, 0.001, { tag: Mass.MassTag.ONE_B, tandem: set1Tandem.createTandem( 'block1B' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.WOOD.density,
              customColor: DensityBuoyancyCommonColors.compareGreenColorProperty
            } ), Vector2.ZERO, 0.007, { tag: Mass.MassTag.ONE_E, tandem: set1Tandem.createTandem( 'block1E' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.GOLD.density,
              customColor: DensityBuoyancyCommonColors.compareYellowColorProperty
            } ), Vector2.ZERO, 0.001, { tag: Mass.MassTag.ONE_C, tandem: set1Tandem.createTandem( 'block1C' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.DIAMOND.density,
              customColor: DensityBuoyancyCommonColors.comparePurpleColorProperty
            } ), Vector2.ZERO, 0.0055, { tag: Mass.MassTag.ONE_A, tandem: set1Tandem.createTandem( 'block1A' ) } )
          ];
        case BlockSet.SET_2:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 4500,
              customColor: DensityBuoyancyCommonColors.mysteryPinkColorProperty
            } ), Vector2.ZERO, 18, { tag: Mass.MassTag.TWO_D, tandem: set2Tandem.createTandem( 'block2D' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 11340,
              customColor: DensityBuoyancyCommonColors.mysteryOrangeColorProperty
            } ), Vector2.ZERO, 18, { tag: Mass.MassTag.TWO_A, tandem: set2Tandem.createTandem( 'block2A' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.COPPER.density,
              customColor: DensityBuoyancyCommonColors.mysteryLightPurpleColorProperty
            } ), Vector2.ZERO, 0.005, { tag: Mass.MassTag.TWO_E, tandem: set2Tandem.createTandem( 'block2E' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 2700,
              customColor: DensityBuoyancyCommonColors.mysteryLightGreenColorProperty
            } ), Vector2.ZERO, 2.7, { tag: Mass.MassTag.TWO_C, tandem: set2Tandem.createTandem( 'block2C' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 2700,
              customColor: DensityBuoyancyCommonColors.mysteryBrownColorProperty
            } ), Vector2.ZERO, 10.8, { tag: Mass.MassTag.TWO_B, tandem: set2Tandem.createTandem( 'block2B' ) } )
          ];
        case BlockSet.SET_3:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 950,
              customColor: DensityBuoyancyCommonColors.mysteryWhiteColorProperty
            } ), Vector2.ZERO, 6, { tag: Mass.MassTag.THREE_E, tandem: set3Tandem.createTandem( 'block3E' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1000,
              customColor: DensityBuoyancyCommonColors.mysteryGrayColorProperty
            } ), Vector2.ZERO, 6, { tag: Mass.MassTag.THREE_B, tandem: set3Tandem.createTandem( 'block3B' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 400,
              customColor: DensityBuoyancyCommonColors.mysteryMustardColorProperty
            } ), Vector2.ZERO, 2, { tag: Mass.MassTag.THREE_D, tandem: set3Tandem.createTandem( 'block3D' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 7800,
              customColor: DensityBuoyancyCommonColors.mysteryPeachColorProperty
            } ), Vector2.ZERO, 23.4, { tag: Mass.MassTag.THREE_C, tandem: set3Tandem.createTandem( 'block3C' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 950,
              customColor: DensityBuoyancyCommonColors.mysteryMaroonColorProperty
            } ), Vector2.ZERO, 2.85, { tag: Mass.MassTag.THREE_A, tandem: set3Tandem.createTandem( 'block3A' ) } )
          ];
        case BlockSet.RANDOM: {
          const tags = [
            Mass.MassTag.C,
            Mass.MassTag.D,
            Mass.MassTag.E,
            Mass.MassTag.A,
            Mass.MassTag.B
          ];

          const mysteryMaterials = createMysteryMaterials();
          const mysteryVolumes = createMysteryVolumes();

          return _.range( 0, 5 ).map( i => {
            return Cuboid.createWithVolume( model.engine, mysteryMaterials[ i ], Vector2.ZERO, mysteryVolumes[ i ], {
              tag: tags[ i ],
              tandem: randomTandem.createTandem( `block${tags[ i ].name}` )
            } );
          } );
        }
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    const regenerateMasses = ( model, blockSet, masses ) => {
      if ( blockSet === BlockSet.RANDOM ) {
        const mysteryMaterials = createMysteryMaterials();
        const mysteryVolumes = createMysteryVolumes();

        masses.forEach( ( mass, i ) => {
          mass.materialProperty.value = mysteryMaterials[ i ];
          mass.updateSize( Cuboid.boundsFromVolume( mysteryVolumes[ i ] ) );
        } );
      }
    };

    const positionMasses = ( model, blockSet, masses ) => {
      switch( blockSet ) {
        case BlockSet.SET_1:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case BlockSet.SET_2:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case BlockSet.SET_3:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case BlockSet.RANDOM:
          model.positionStackLeft( [ masses[ 3 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 0 ], masses[ 1 ], masses[ 2 ] ] );
          break;
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    super( tandem, createMasses, regenerateMasses, positionMasses, merge( {
      canShowForces: false
    }, options ) );

    // @public {Property.<boolean>}
    this.densityTableExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'densityTableExpandedProperty' )
    } );

    const scalePositionProperty = new DerivedProperty( [ this.invisibleBarrierBoundsProperty ], bounds => {
      return new Vector2( -0.75 + bounds.minX + 0.875, -Scale.SCALE_BASE_BOUNDS.minY );
    } );

    // @public (read-only) {Scale}
    this.scale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translationFromVector( scalePositionProperty.value ),
      displayType: Scale.DisplayType.KILOGRAMS,
      canMove: false,
      tandem: tandem.createTandem( 'scale' )
    } );
    this.availableMasses.push( this.scale );

    // Move the scale with the barrier, see https://github.com/phetsims/density/issues/73
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    scalePositionProperty.lazyLink( position => {
      this.scale.matrix.set02( position.x );
      this.scale.writeData();

      // When we reset-all, we'll want it to move back to here
      this.scale.setResetLocation();

      // Adjust its previous position also
      this.engine.bodySynchronizePrevious( this.scale.body );
    } );

    this.uninterpolateMasses();
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.densityTableExpandedProperty.reset();

    super.reset();

    // Make sure to create new random masses on a reset
    this.regenerate( BlockSet.RANDOM );

    this.uninterpolateMasses();
  }
}

// @public {Enumeration}
DensityMysteryModel.BlockSet = BlockSet;

densityBuoyancyCommon.register( 'DensityMysteryModel', DensityMysteryModel );
export default DensityMysteryModel;