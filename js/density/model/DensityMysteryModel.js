// Copyright 2020-2021, University of Colorado Boulder

/**
 * The main model for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModal from '../../common/model/DensityBuoyancyModal.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const randomMaterials = [
  Material.WOOD,
  Material.GASOLINE,
  Material.APPLE,
  Material.ICE,
  Material.HUMAN,
  Material.WATER,
  Material.GLASS,
  Material.DIAMOND,
  Material.TITANIUM,
  Material.STEEL,
  Material.COPPER,
  Material.LEAD,
  Material.GOLD
];
const randomColors = [
  DensityBuoyancyCommonColors.comparingYellowColorProperty,
  DensityBuoyancyCommonColors.comparingBlueColorProperty,
  DensityBuoyancyCommonColors.comparingGreenColorProperty,
  DensityBuoyancyCommonColors.comparingRedColorProperty,
  DensityBuoyancyCommonColors.comparingPurpleColorProperty,
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
const Mode = Enumeration.byKeys( [
  'SET_1',
  'SET_2',
  'SET_3',
  'RANDOM'
] );

class DensityMysteryModel extends DensityBuoyancyModal( DensityBuoyancyModel, Mode, Mode.SET_1 ) {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
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

    const set1Tandem = tandem.createTandem( 'set1' );
    const set2Tandem = tandem.createTandem( 'set2' );
    const set3Tandem = tandem.createTandem( 'set3' );
    const randomTandem = tandem.createTandem( 'random' );

    const createMasses = ( model, mode ) => {
      switch( mode ) {
        case Mode.SET_1:
          return [
            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.WATER.density,
              customColor: DensityBuoyancyCommonColors.comparingRedColorProperty
            } ), Vector2.ZERO, 0.005, { tag: Mass.MassTag.ONE_D, tandem: set1Tandem.createTandem( '1D' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.WOOD.density,
              customColor: DensityBuoyancyCommonColors.comparingBlueColorProperty
            } ), Vector2.ZERO, 0.001, { tag: Mass.MassTag.ONE_B, tandem: set1Tandem.createTandem( '1B' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.WOOD.density,
              customColor: DensityBuoyancyCommonColors.comparingGreenColorProperty
            } ), Vector2.ZERO, 0.007, { tag: Mass.MassTag.ONE_E, tandem: set1Tandem.createTandem( '1E' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.GOLD.density,
              customColor: DensityBuoyancyCommonColors.comparingYellowColorProperty
            } ), Vector2.ZERO, 0.001, { tag: Mass.MassTag.ONE_C, tandem: set1Tandem.createTandem( '1C' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.DIAMOND.density,
              customColor: DensityBuoyancyCommonColors.comparingPurpleColorProperty
            } ), Vector2.ZERO, 0.0055, { tag: Mass.MassTag.ONE_A, tandem: set1Tandem.createTandem( '1A' ) } )
          ];
        case Mode.SET_2:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 4500,
              customColor: DensityBuoyancyCommonColors.mysteryPinkColorProperty
            } ), Vector2.ZERO, 18, { tag: Mass.MassTag.TWO_D, tandem: set2Tandem.createTandem( '2D' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 11340,
              customColor: DensityBuoyancyCommonColors.mysteryOrangeColorProperty
            } ), Vector2.ZERO, 18, { tag: Mass.MassTag.TWO_A, tandem: set2Tandem.createTandem( '2A' ) } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.COPPER.density,
              customColor: DensityBuoyancyCommonColors.mysteryLightPurpleColorProperty
            } ), Vector2.ZERO, 0.005, { tag: Mass.MassTag.TWO_E, tandem: set2Tandem.createTandem( '2E' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 2700,
              customColor: DensityBuoyancyCommonColors.mysteryLightGreenColorProperty
            } ), Vector2.ZERO, 2.7, { tag: Mass.MassTag.TWO_C, tandem: set2Tandem.createTandem( '2C' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 2700,
              customColor: DensityBuoyancyCommonColors.mysteryBrownColorProperty
            } ), Vector2.ZERO, 10.8, { tag: Mass.MassTag.TWO_B, tandem: set2Tandem.createTandem( '2B' ) } )
          ];
        case Mode.SET_3:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 950,
              customColor: DensityBuoyancyCommonColors.mysteryWhiteColorProperty
            } ), Vector2.ZERO, 6, { tag: Mass.MassTag.THREE_E, tandem: set3Tandem.createTandem( '3E' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1000,
              customColor: DensityBuoyancyCommonColors.mysteryGrayColorProperty
            } ), Vector2.ZERO, 6, { tag: Mass.MassTag.THREE_B, tandem: set3Tandem.createTandem( '3B' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 400,
              customColor: DensityBuoyancyCommonColors.mysteryMustardColorProperty
            } ), Vector2.ZERO, 2, { tag: Mass.MassTag.THREE_D, tandem: set3Tandem.createTandem( '3D' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 7800,
              customColor: DensityBuoyancyCommonColors.mysteryPeachColorProperty
            } ), Vector2.ZERO, 23.4, { tag: Mass.MassTag.THREE_C, tandem: set3Tandem.createTandem( '3C' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 950,
              customColor: DensityBuoyancyCommonColors.mysteryMaroonColorProperty
            } ), Vector2.ZERO, 2.85, { tag: Mass.MassTag.THREE_A, tandem: set3Tandem.createTandem( '3A' ) } )
          ];
        case Mode.RANDOM: {
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
              tandem: randomTandem.createTandem( tags[ i ].name )
            } );
          } );
        }
        default:
          throw new Error( `unknown mode: ${mode}` );
      }
    };

    const regenerateMasses = ( model, mode, masses ) => {
      if ( mode === Mode.RANDOM ) {
        const mysteryMaterials = createMysteryMaterials();
        const mysteryVolumes = createMysteryVolumes();

        masses.forEach( ( mass, i ) => {
          mass.materialProperty.value = mysteryMaterials[ i ];
          mass.updateSize( Cuboid.boundsFromVolume( mysteryVolumes[ i ] ) );
        } );
      }
    };

    const positionMasses = ( model, mode, masses ) => {
      switch( mode ) {
        case Mode.SET_1:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case Mode.SET_2:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case Mode.SET_3:
          model.positionStackLeft( [ masses[ 1 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 2 ], masses[ 3 ], masses[ 0 ] ] );
          break;
        case Mode.RANDOM:
          model.positionStackLeft( [ masses[ 3 ], masses[ 4 ] ] );
          model.positionStackRight( [ masses[ 0 ], masses[ 1 ], masses[ 2 ] ] );
          break;
        default:
          throw new Error( `unknown mode: ${mode}` );
      }
    };

    super( tandem, createMasses, regenerateMasses, positionMasses, tandem );

    // @public {Property.<boolean>}
    this.densityTableExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'densityTableExpandedProperty' )
    } );

    // @public {Scale}
    this.scale = new Scale( this.engine, {
      matrix: Matrix3.translation( -0.75, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.KILOGRAMS,
      canMove: false,
      tandem: tandem.createTandem( 'scale' )
    } );
    this.availableMasses.push( this.scale );

    // Move the scale with the barrier, see https://github.com/phetsims/density/issues/73
    this.invisibleBarrierBoundsProperty.lazyLink( ( newBounds, oldBounds ) => {
      this.scale.matrix.set02( this.scale.matrix.m02() + newBounds.minX - oldBounds.minX );
      this.scale.writeData();

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
    this.regenerate( Mode.RANDOM );

    this.uninterpolateMasses();
  }
}

// @public {Enumeration}
DensityMysteryModel.Mode = Mode;

densityBuoyancyCommon.register( 'DensityMysteryModel', DensityMysteryModel );
export default DensityMysteryModel;