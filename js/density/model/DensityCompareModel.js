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

    // @private {Object.<Mode,Array.<Mass>>}
    this.modeToMassesMap = {};

    // @private {Array.<Mass>}
    this.sameMassMasses = [
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
    this.modeToMassesMap[ Mode.SAME_MASS ] = this.sameMassMasses;

    // @private {Array.<Mass>}
    this.sameVolumeMasses = [
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
    this.modeToMassesMap[ Mode.SAME_VOLUME ] = this.sameVolumeMasses;

    // @private {Array.<Mass>}
    this.sameDensityMasses = [
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
    this.modeToMassesMap[ Mode.SAME_DENSITY ] = this.sameDensityMasses;

    this.applyInitialPositions();

    this.modeProperty.link( ( mode, oldMode ) => {
      if ( oldMode ) {
        this.modeToMassesMap[ oldMode ].forEach( mass => this.masses.remove( mass ) );
      }
      this.modeToMassesMap[ mode ].forEach( mass => this.masses.push( mass ) );
    } );
  }

  /**
   * @private
   */
  applyInitialPositions() {
    this.positionMassesLeft( [ this.sameMassMasses[ 0 ], this.sameMassMasses[ 1 ] ] );
    this.positionMassesRight( [ this.sameMassMasses[ 2 ], this.sameMassMasses[ 3 ] ] );

    this.positionMassesLeft( [ this.sameVolumeMasses[ 3 ], this.sameVolumeMasses[ 0 ] ] );
    this.positionMassesRight( [ this.sameVolumeMasses[ 1 ], this.sameVolumeMasses[ 2 ] ] );

    this.positionMassesLeft( [ this.sameDensityMasses[ 0 ], this.sameDensityMasses[ 1 ] ] );
    this.positionMassesRight( [ this.sameDensityMasses[ 2 ], this.sameDensityMasses[ 3 ] ] );
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.modeProperty.reset();

    Mode.VALUES.forEach( mode => this.modeToMassesMap[ mode ].forEach( mass => mass.reset() ) );

    super.reset();

    this.applyInitialPositions();
  }
}

// @public {Enumeration}
DensityCompareModel.Mode = Mode;

densityBuoyancyCommon.register( 'DensityCompareModel', DensityCompareModel );
export default DensityCompareModel;