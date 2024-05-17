// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import MassTag from '../../common/model/MassTag.js';
import BlockSet from '../../common/model/BlockSet.js';
import CompareBlockSetModel, { CompareBlockSetModelOptions } from '../../common/model/CompareBlockSetModel.js';

export type DensityCompareModelOptions = StrictOmit<CompareBlockSetModelOptions, 'positionMassesCallback' | 'cubesData'>;

export default class DensityCompareModel extends CompareBlockSetModel {

  public constructor( providedOptions: DensityCompareModelOptions ) {
    const tandem = providedOptions.tandem;

    const blockSetsTandem = tandem.createTandem( 'blockSets' );

    const options = optionize<DensityCompareModelOptions, EmptySelfOptions, CompareBlockSetModelOptions>()( {
      sameDensityValue: 500,

      showMassValuesDefault: true,
      canShowForces: false,
      positionMassesCallback: ( model: DensityBuoyancyModel, blockSet: BlockSet, masses: Cuboid[] ) => {
        assert && assert( masses.length === 4, 'four masses please' );
        switch( blockSet ) {
          case BlockSet.SAME_MASS:
            model.positionMassesLeft( [ masses[ 0 ], masses[ 1 ] ] );
            model.positionMassesRight( [ masses[ 2 ], masses[ 3 ] ] );
            break;
          case BlockSet.SAME_VOLUME:
            model.positionMassesLeft( [ masses[ 3 ], masses[ 0 ] ] );
            model.positionMassesRight( [ masses[ 1 ], masses[ 2 ] ] );
            break;
          case BlockSet.SAME_DENSITY:
            model.positionMassesLeft( [ masses[ 0 ], masses[ 1 ] ] );
            model.positionMassesRight( [ masses[ 2 ], masses[ 3 ] ] );
            break;
          default:
            throw new Error( `unknown blockSet: ${blockSet}` );
        }
      },
      cubesData: [
        {
          sameMassVolume: 0.01,
          sameVolumeMass: 8,
          sameDensityVolume: 0.006,
          colorProperty: DensityBuoyancyCommonColors.compareYellowColorProperty,
          sameMassCubeOptions: {
            tag: MassTag.B,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'yellowBlock' )
          },
          sameVolumeCubeOptions: {
            tag: MassTag.A,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'yellowBlock' )
          },
          sameDensityCubeOptions: {
            tag: MassTag.B,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'yellowBlock' )
          }
        }, {
          sameMassVolume: 0.005,
          sameVolumeMass: 6,
          sameDensityVolume: 0.004,
          colorProperty: DensityBuoyancyCommonColors.compareBlueColorProperty,
          sameMassCubeOptions: {
            tag: MassTag.A,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'blueBlock' )
          },
          sameVolumeCubeOptions: {
            tag: MassTag.C,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'blueBlock' )
          },
          sameDensityCubeOptions: {
            tag: MassTag.A,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'blueBlock' )
          }
        }, {
          sameMassVolume: 0.0025,
          sameVolumeMass: 4,
          sameDensityVolume: 0.002,
          colorProperty: DensityBuoyancyCommonColors.compareGreenColorProperty,
          sameMassCubeOptions: {
            tag: MassTag.C,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'greenBlock' )
          },
          sameVolumeCubeOptions: {
            tag: MassTag.D,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'greenBlock' )
          },
          sameDensityCubeOptions: {
            tag: MassTag.C,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'greenBlock' )
          }
        }, {
          sameMassVolume: 0.00125,
          sameVolumeMass: 2,
          sameDensityVolume: 0.001,
          colorProperty: DensityBuoyancyCommonColors.compareRedColorProperty,
          sameMassCubeOptions: {
            tag: MassTag.D,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'redBlock' )
          },
          sameVolumeCubeOptions: {
            tag: MassTag.B,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'redBlock' )
          },
          sameDensityCubeOptions: {
            tag: MassTag.D,
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'redBlock' )
          }
        } ]
    }, providedOptions );

    super( options );
  }
}

densityBuoyancyCommon.register( 'DensityCompareModel', DensityCompareModel );