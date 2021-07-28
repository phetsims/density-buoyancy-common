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
import densityBuoyancyCommonColorProfile from '../../common/view/densityBuoyancyCommonColorProfile.js';
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
  densityBuoyancyCommonColorProfile.comparingYellowColorProperty,
  densityBuoyancyCommonColorProfile.comparingBlueColorProperty,
  densityBuoyancyCommonColorProfile.comparingGreenColorProperty,
  densityBuoyancyCommonColorProfile.comparingRedColorProperty,
  densityBuoyancyCommonColorProfile.comparingPurpleColorProperty,
  densityBuoyancyCommonColorProfile.mysteryPinkColorProperty,
  densityBuoyancyCommonColorProfile.mysteryOrangeColorProperty,
  densityBuoyancyCommonColorProfile.mysteryLightPurpleColorProperty,
  densityBuoyancyCommonColorProfile.mysteryLightGreenColorProperty,
  densityBuoyancyCommonColorProfile.mysteryBrownColorProperty,
  densityBuoyancyCommonColorProfile.mysteryWhiteColorProperty,
  densityBuoyancyCommonColorProfile.mysteryGrayColorProperty,
  densityBuoyancyCommonColorProfile.mysteryMustardColorProperty,
  densityBuoyancyCommonColorProfile.mysteryPeachColorProperty,
  densityBuoyancyCommonColorProfile.mysteryMaroonColorProperty
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

    const createMasses = ( model, mode ) => {
      switch( mode ) {
        case Mode.SET_1:
          return [
            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: 920,
              customColor: densityBuoyancyCommonColorProfile.comparingRedColorProperty
            } ), Vector2.ZERO, 0.004, { tag: Mass.MassTag.ONE_D } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.GASOLINE.density,
              customColor: densityBuoyancyCommonColorProfile.comparingBlueColorProperty
            } ), Vector2.ZERO, 0.004, { tag: Mass.MassTag.ONE_B } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.GASOLINE.density,
              customColor: densityBuoyancyCommonColorProfile.comparingGreenColorProperty
            } ), Vector2.ZERO, 0.00516, { tag: Mass.MassTag.ONE_E } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: 19320,
              customColor: densityBuoyancyCommonColorProfile.comparingYellowColorProperty
            } ), Vector2.ZERO, 0.001, { tag: Mass.MassTag.ONE_C } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.DIAMOND.density,
              customColor: densityBuoyancyCommonColorProfile.comparingPurpleColorProperty
            } ), Vector2.ZERO, 0.001, { tag: Mass.MassTag.ONE_A } )
          ];
        case Mode.SET_2:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 4500,
              customColor: densityBuoyancyCommonColorProfile.mysteryPinkColorProperty
            } ), Vector2.ZERO, 18, { tag: Mass.MassTag.TWO_D } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 11340,
              customColor: densityBuoyancyCommonColorProfile.mysteryOrangeColorProperty
            } ), Vector2.ZERO, 18, { tag: Mass.MassTag.TWO_A } ),

            Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
              density: Material.COPPER.density,
              customColor: densityBuoyancyCommonColorProfile.mysteryLightPurpleColorProperty
            } ), Vector2.ZERO, 0.005, { tag: Mass.MassTag.TWO_E } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 2700,
              customColor: densityBuoyancyCommonColorProfile.mysteryLightGreenColorProperty
            } ), Vector2.ZERO, 2.7, { tag: Mass.MassTag.TWO_C } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 2700,
              customColor: densityBuoyancyCommonColorProfile.mysteryBrownColorProperty
            } ), Vector2.ZERO, 10.8, { tag: Mass.MassTag.TWO_B } )
          ];
        case Mode.SET_3:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 950,
              customColor: densityBuoyancyCommonColorProfile.mysteryWhiteColorProperty
            } ), Vector2.ZERO, 6, { tag: Mass.MassTag.THREE_E } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1000,
              customColor: densityBuoyancyCommonColorProfile.mysteryGrayColorProperty
            } ), Vector2.ZERO, 6, { tag: Mass.MassTag.THREE_B } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 400,
              customColor: densityBuoyancyCommonColorProfile.mysteryMustardColorProperty
            } ), Vector2.ZERO, 2, { tag: Mass.MassTag.THREE_D } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 7800,
              customColor: densityBuoyancyCommonColorProfile.mysteryPeachColorProperty
            } ), Vector2.ZERO, 23.4, { tag: Mass.MassTag.THREE_C } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 950,
              customColor: densityBuoyancyCommonColorProfile.mysteryMaroonColorProperty
            } ), Vector2.ZERO, 2.85, { tag: Mass.MassTag.THREE_A } )
          ];
        case Mode.RANDOM: {
          const densities = dotRandom.shuffle( randomMaterials ).slice( 0, 5 ).map( material => material.density );
          const colors = dotRandom.shuffle( randomColors ).slice( 0, 5 );
          const volumes = [
            ...dotRandom.shuffle( [ 1, 2, 3, 4, 5, 6 ].map( n => n / 1000 ) ).slice( 0, 3 ),
            ...dotRandom.shuffle( [ 7, 8, 9, 10 ].map( n => n / 1000 ) ).slice( 0, 2 )
          ].sort();

          const tags = [
            Mass.MassTag.C,
            Mass.MassTag.D,
            Mass.MassTag.E,
            Mass.MassTag.A,
            Mass.MassTag.B
          ];

          return _.sortBy( _.range( 0, 5 ).map( i => Cuboid.createWithVolume( model.engine, Material.createCustomMaterial( {
            density: densities[ i ],
            customColor: colors[ i ]
          } ), Vector2.ZERO, volumes[ i ], { tag: tags[ i ] } ) ), mass => mass.volumeProperty.value );
        }
        default:
          throw new Error( `unknown mode: ${mode}` );
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

    super( tandem, createMasses, positionMasses, tandem );

    // @public {Property.<boolean>}
    this.densityTableExpandedProperty = new BooleanProperty( false );

    // @public {Scale}
    this.scale = new Scale( this.engine, {
      matrix: Matrix3.translation( -0.75, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.KILOGRAMS,
      canMove: false
    } );
    this.masses.push( this.scale );
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
  }
}

// @public {Enumeration}
DensityMysteryModel.Mode = Mode;

densityBuoyancyCommon.register( 'DensityMysteryModel', DensityMysteryModel );
export default DensityMysteryModel;