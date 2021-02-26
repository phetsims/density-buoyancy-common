// Copyright 2019-2020, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModal from '../../common/model/DensityBuoyancyModal.js';
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

class DensityCompareModel extends DensityBuoyancyModal( DensityBuoyancyModel, Mode, Mode.SAME_MASS ) {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const createMasses = ( model, mode ) => {
      switch( mode ) {
        case Mode.SAME_MASS:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 500,
              customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
            } ), Vector2.ZERO, 5 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1000,
              customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
            } ), Vector2.ZERO, 5 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 2000,
              customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
            } ), Vector2.ZERO, 5 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 4000,
              customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
            } ), Vector2.ZERO, 5 )
          ];
        case Mode.SAME_VOLUME:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1600,
              customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
            } ), Vector2.ZERO, 8 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1200,
              customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
            } ), Vector2.ZERO, 6 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 800,
              customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
            } ), Vector2.ZERO, 4 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 400,
              customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
            } ), Vector2.ZERO, 2 )
          ];
        case Mode.SAME_DENSITY:
          return [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 800,
              customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
            } ), Vector2.ZERO, 4 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 800,
              customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
            } ), Vector2.ZERO, 3 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 800,
              customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
            } ), Vector2.ZERO, 2 ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 800,
              customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
            } ), Vector2.ZERO, 1 )
          ];
        default:
          throw new Error( `unknown mode: ${mode}` );
      }
    };

    const positionMasses = ( model, mode, masses ) => {
      switch( mode ) {
        case Mode.SAME_MASS:
          model.positionMassesLeft( [ masses[ 0 ], masses[ 1 ] ] );
          model.positionMassesRight( [ masses[ 2 ], masses[ 3 ] ] );
          break;
        case Mode.SAME_VOLUME:
          model.positionMassesLeft( [ masses[ 3 ], masses[ 0 ] ] );
          model.positionMassesRight( [ masses[ 1 ], masses[ 2 ] ] );
          break;
        case Mode.SAME_DENSITY:
          model.positionMassesLeft( [ masses[ 0 ], masses[ 1 ] ] );
          model.positionMassesRight( [ masses[ 2 ], masses[ 3 ] ] );
          break;
        default:
          throw new Error( `unknown mode: ${mode}` );
      }
    };

    super( createMasses, positionMasses, tandem, {
      showMassesDefault: true
    } );
  }
}

// @public {Enumeration}
DensityCompareModel.Mode = Mode;

densityBuoyancyCommon.register( 'DensityCompareModel', DensityCompareModel );
export default DensityCompareModel;