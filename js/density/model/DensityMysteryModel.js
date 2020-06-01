// Copyright 2020, University of Colorado Boulder

/**
 * The main model for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import DensityBuoyancyCommonColorProfile from '../../common/view/DensityBuoyancyCommonColorProfile.js';
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
  DensityBuoyancyCommonColorProfile.comparingYellowProperty,
  DensityBuoyancyCommonColorProfile.comparingBlueProperty,
  DensityBuoyancyCommonColorProfile.comparingGreenProperty,
  DensityBuoyancyCommonColorProfile.comparingRedProperty,
  DensityBuoyancyCommonColorProfile.comparingPurpleProperty,
  DensityBuoyancyCommonColorProfile.mysteryPinkProperty,
  DensityBuoyancyCommonColorProfile.mysteryOrangeProperty,
  DensityBuoyancyCommonColorProfile.mysteryLightPurpleProperty,
  DensityBuoyancyCommonColorProfile.mysteryLightGreenProperty,
  DensityBuoyancyCommonColorProfile.mysteryBrownProperty,
  DensityBuoyancyCommonColorProfile.mysteryWhiteProperty,
  DensityBuoyancyCommonColorProfile.mysteryGrayProperty,
  DensityBuoyancyCommonColorProfile.mysteryMustardProperty,
  DensityBuoyancyCommonColorProfile.mysteryPeachProperty,
  DensityBuoyancyCommonColorProfile.mysteryMaroonProperty
];

class DensityMysteryModel extends DensityBuoyancyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public {Property.<boolean>}
    this.densityTableExpandedProperty = new BooleanProperty( false );

    // @public {Property.<DensityMysteryModel.Mode>}
    this.modeProperty = new EnumerationProperty( DensityMysteryModel.Mode, DensityMysteryModel.Mode.SET_1 );

    // @public {Scale}
    this.scale = new Scale( this.engine, {
      matrix: Matrix3.translation( -0.75, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.KILOGRAMS,
      canMove: false
    } );

    this.modeProperty.link( mode => {
      this.setup();
    } );
  }

  /**
   * Sets up the scene with the given mode.
   * @public
   */
  setup() {
    this.clearMasses();

    switch( this.modeProperty.value ) {
      case DensityMysteryModel.Mode.SET_1:
        this.setupSet1();
        break;
      case DensityMysteryModel.Mode.SET_2:
        this.setupSet2();
        break;
      case DensityMysteryModel.Mode.SET_3:
        this.setupSet3();
        break;
      case DensityMysteryModel.Mode.RANDOM:
        this.setupRandom();
        break;
      default:
        throw new Error( 'unknown set: ' + this.modeProperty.value );
    }
  }

  /**
   * Sets up the initial state for the set 1
   * @public
   */
  setupSet1() {
    const masses = [
      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 19320,
        customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
      } ), Vector2.ZERO, 65.3, { tag: Mass.MassTag.ONE_D } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 640,
        customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
      } ), Vector2.ZERO, 0.64, { tag: Mass.MassTag.ONE_B } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 700,
        customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
      } ), Vector2.ZERO, 4.08, { tag: Mass.MassTag.ONE_E } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 920,
        customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
      } ), Vector2.ZERO, 3.10, { tag: Mass.MassTag.ONE_C } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 3530,
        customColor: DensityBuoyancyCommonColorProfile.comparingPurpleProperty
      } ), Vector2.ZERO, 3.53, { tag: Mass.MassTag.ONE_A } ),

      this.scale
    ];

    this.positionStackLeft( [
      masses[ 1 ],
      masses[ 4 ]
    ] );

    this.positionStackRight( [
      masses[ 2 ],
      masses[ 3 ],
      masses[ 0 ]
    ] );

    this.masses.addAll( masses );
  }

  /**
   * Sets up the initial state for the set 1
   * @public
   */
  setupSet2() {
    const masses = [
      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 4500,
        customColor: DensityBuoyancyCommonColorProfile.mysteryPinkProperty
      } ), Vector2.ZERO, 18, { tag: Mass.MassTag.TWO_D } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 11340,
        customColor: DensityBuoyancyCommonColorProfile.mysteryOrangeProperty
      } ), Vector2.ZERO, 18, { tag: Mass.MassTag.TWO_A } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 8890,
        customColor: DensityBuoyancyCommonColorProfile.mysteryLightPurpleProperty
      } ), Vector2.ZERO, 44.45, { tag: Mass.MassTag.TWO_E } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 2700,
        customColor: DensityBuoyancyCommonColorProfile.mysteryLightGreenProperty
      } ), Vector2.ZERO, 2.7, { tag: Mass.MassTag.TWO_C } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 2700,
        customColor: DensityBuoyancyCommonColorProfile.mysteryBrownProperty
      } ), Vector2.ZERO, 10.8, { tag: Mass.MassTag.TWO_B } ),

      this.scale
    ];

    this.positionStackLeft( [
      masses[ 1 ],
      masses[ 4 ]
    ] );

    this.positionStackRight( [
      masses[ 2 ],
      masses[ 3 ],
      masses[ 0 ]
    ] );

    this.masses.addAll( masses );
  }

  /**
   * Sets up the initial state for the set 1
   * @public
   */
  setupSet3() {
    const masses = [
      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 950,
        customColor: DensityBuoyancyCommonColorProfile.mysteryWhiteProperty
      } ), Vector2.ZERO, 6, { tag: Mass.MassTag.THREE_E } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 1000,
        customColor: DensityBuoyancyCommonColorProfile.mysteryGrayProperty
      } ), Vector2.ZERO, 6, { tag: Mass.MassTag.THREE_B } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 400,
        customColor: DensityBuoyancyCommonColorProfile.mysteryMustardProperty
      } ), Vector2.ZERO, 2, { tag: Mass.MassTag.THREE_D } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 7800,
        customColor: DensityBuoyancyCommonColorProfile.mysteryPeachProperty
      } ), Vector2.ZERO, 23.4, { tag: Mass.MassTag.THREE_C } ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 950,
        customColor: DensityBuoyancyCommonColorProfile.mysteryMaroonProperty
      } ), Vector2.ZERO, 2.85, { tag: Mass.MassTag.THREE_A } ),

      this.scale
    ];

    this.positionStackLeft( [
      masses[ 1 ],
      masses[ 4 ]
    ] );

    this.positionStackRight( [
      masses[ 2 ],
      masses[ 3 ],
      masses[ 0 ]
    ] );

    this.masses.addAll( masses );
  }

  /**
   * Sets up the initial state for the set 1
   * @public
   */
  setupRandom() {
    const densities = phet.joist.random.shuffle( randomMaterials ).slice( 0, 5 ).map( material => material.density );
    const colors = phet.joist.random.shuffle( randomColors ).slice( 0, 5 );
    const volumes = [
      ...phet.joist.random.shuffle( [ 1, 2, 3, 4, 5, 6 ].map( n => n / 1000 ) ).slice( 0, 3 ),
      ...phet.joist.random.shuffle( [ 7, 8, 9, 10 ].map( n => n / 1000 ) ).slice( 0, 2 )
    ].sort();

    const tags = [
      Mass.MassTag.C,
      Mass.MassTag.D,
      Mass.MassTag.E,
      Mass.MassTag.A,
      Mass.MassTag.B
    ];

    const masses = _.sortBy( _.range( 0, 5 ).map( i => Cuboid.createWithVolume( this.engine, Material.createCustomMaterial( {
      density: densities[ i ],
      customColor: colors[ i ]
    } ), Vector2.ZERO, volumes[ i ], { tag: tags[ i ] } ) ), mass => mass.volumeProperty.value );

    masses.push( this.scale );

    this.positionStackLeft( [
      masses[ 3 ],
      masses[ 4 ]
    ] );

    this.positionStackRight( [
      masses[ 0 ],
      masses[ 1 ],
      masses[ 2 ]
    ] );

    this.masses.addAll( masses );
  }

  /**
   * Clears all of the masses away.
   * @private
   */
  clearMasses() {
    this.masses.forEach( mass => {
      this.masses.remove( mass );
    } );
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.densityTableExpandedProperty.reset();
    this.modeProperty.reset();

    super.reset();

    this.setup();
  }
}

// @public {Enumeration}
DensityMysteryModel.Mode = Enumeration.byKeys( [
  'SET_1',
  'SET_2',
  'SET_3',
  'RANDOM'
] );

densityBuoyancyCommon.register( 'DensityMysteryModel', DensityMysteryModel );
export default DensityMysteryModel;