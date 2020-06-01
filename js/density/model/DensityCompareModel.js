// Copyright 2019-2020, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColorProfile from '../../common/view/DensityBuoyancyCommonColorProfile.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const Mode = Enumeration.byKeys( [
  'SAME_MASS',
  'SAME_VOLUME',
  'SAME_DENSITY'
] );

class DensityCompareModel extends DensityBuoyancyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem, {
      showMassesDefault: true
    } );

    // @public {Property.<Mode>}
    this.modeProperty = new Property( Mode.SAME_MASS );

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
      case Mode.SAME_MASS:
        this.setupSameMass();
        break;
      case Mode.SAME_VOLUME:
        this.setupSameVolume();
        break;
      case Mode.SAME_DENSITY:
        this.setupSameDensity();
        break;
      default:
        throw new Error( 'unknown mode: ' + this.modeProperty.value );
    }
  }

  /**
   * Sets up the initial state for the "Same Mass" mode.
   * @public
   */
  setupSameMass() {
    const masses = [
      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 500,
        customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
      } ), Vector2.ZERO, 5 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 1000,
        customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
      } ), Vector2.ZERO, 5 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 2000,
        customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
      } ), Vector2.ZERO, 5 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 4000,
        customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
      } ), Vector2.ZERO, 5 )
    ];

    this.positionMassesLeft( [
      masses[ 0 ],
      masses[ 1 ]
    ] );

    this.positionMassesRight( [
      masses[ 2 ],
      masses[ 3 ]
    ] );

    this.masses.addAll( masses );
  }

  /**
   * Sets up the initial state for the "Same Volume" mode.
   * @public
   */
  setupSameVolume() {
    const masses = [
      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 1600,
        customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
      } ), Vector2.ZERO, 8 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 1200,
        customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
      } ), Vector2.ZERO, 6 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 800,
        customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
      } ), Vector2.ZERO, 4 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 400,
        customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
      } ), Vector2.ZERO, 2 )
    ];

    this.positionMassesLeft( [
      masses[ 3 ],
      masses[ 0 ]
    ] );

    this.positionMassesRight( [
      masses[ 1 ],
      masses[ 2 ]
    ] );

    this.masses.addAll( masses );
  }

  /**
   * Sets up the initial state for the "Same Density" mode.
   * @public
   */
  setupSameDensity() {
    const masses = [
      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 800,
        customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
      } ), Vector2.ZERO, 4 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 800,
        customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
      } ), Vector2.ZERO, 3 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 800,
        customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
      } ), Vector2.ZERO, 2 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 800,
        customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
      } ), Vector2.ZERO, 1 )
    ];

    this.positionMassesLeft( [
      masses[ 0 ],
      masses[ 1 ]
    ] );

    this.positionMassesRight( [
      masses[ 2 ],
      masses[ 3 ]
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
    this.modeProperty.reset();

    super.reset();

    this.setup();
  }
}

// @public {Enumeration}
DensityCompareModel.Mode = Mode;

densityBuoyancyCommon.register( 'DensityCompareModel', DensityCompareModel );
export default DensityCompareModel;