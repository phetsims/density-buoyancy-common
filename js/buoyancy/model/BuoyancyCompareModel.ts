// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassTag from '../../common/model/MassTag.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BlockSet from '../../common/model/BlockSet.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import CompareBlockSetModel, { BLOCK_SETS_TANDEM_NAME, CompareBlockSetModelOptions } from '../../common/model/CompareBlockSetModel.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Material from '../../common/model/Material.js';

export type BuoyancyCompareModelOptions = StrictOmit<CompareBlockSetModelOptions, 'positionMassesCallback' | 'cubesData'>;

export default class BuoyancyCompareModel extends CompareBlockSetModel {

  public constructor( providedOptions: BuoyancyCompareModelOptions ) {

    const tandem = providedOptions.tandem;
    const blockSetsTandem = tandem.createTandem( BLOCK_SETS_TANDEM_NAME );

    const options = optionize<BuoyancyCompareModelOptions, EmptySelfOptions, CompareBlockSetModelOptions>()( {
      initialMaterials: [ Material.WOOD, Material.BRICK ],
      sameMassValue: 4,
      sameDensityValue: Material.WOOD.density,
      cubesData: [
        {
          sameMassVolume: 0.002,
          sameVolumeMass: 10,
          sameDensityVolume: 0.005,
          colorProperty: DensityBuoyancyCommonColors.compareOchreColorProperty,
          sameMassCubeOptions: {
            tag: MassTag.ONE_A.withColorProperty( MassTag.OBJECT_A_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'block1A' )
          },
          sameVolumeCubeOptions: {
            tag: MassTag.TWO_A.withColorProperty( MassTag.OBJECT_A_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'block2A' )
          },
          sameDensityCubeOptions: {
            tag: MassTag.THREE_A.withColorProperty( MassTag.OBJECT_A_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'block3A' )
          }
        }, {
          sameMassVolume: 0.01,
          sameVolumeMass: 2,
          sameDensityVolume: 0.01,
          colorProperty: DensityBuoyancyCommonColors.compareBlueColorProperty,
          sameMassCubeOptions: {
            tag: MassTag.ONE_B.withColorProperty( MassTag.OBJECT_B_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'block1B' )
          },
          sameVolumeCubeOptions: {
            tag: MassTag.TWO_B.withColorProperty( MassTag.OBJECT_B_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'block2B' )
          },
          sameDensityCubeOptions: {
            tag: MassTag.THREE_B.withColorProperty( MassTag.OBJECT_B_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'block3B' )
          }
        }
      ],

      positionMassesCallback: ( model, blockSet, masses ) => {
        assert && assert( masses.length === 2, 'two masses please' );
        switch( blockSet ) {
          case BlockSet.SAME_MASS:
            model.positionMassesLeft( [ masses[ 0 ] ] );
            model.positionMassesRight( [ masses[ 1 ] ] );
            break;
          case BlockSet.SAME_VOLUME:
            model.positionMassesLeft( [ masses[ 0 ] ] );
            model.positionMassesRight( [ masses[ 1 ] ] );
            break;
          case BlockSet.SAME_DENSITY:
            model.positionMassesLeft( [ masses[ 0 ] ] );
            model.positionMassesRight( [ masses[ 1 ] ] );
            break;
          default:
            throw new Error( `unknown blockSet: ${blockSet}` );
        }
      }
    }, providedOptions );

    super( options );


    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.70, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: providedOptions.tandem.createTandem( 'scale' ),
      canMove: true,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } ) );
  }
}


densityBuoyancyCommon.register( 'BuoyancyCompareModel', BuoyancyCompareModel );