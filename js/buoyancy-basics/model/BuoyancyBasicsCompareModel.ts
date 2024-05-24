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
import VolumelessScale from '../../common/model/VolumelessScale.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import CompareBlockSetModel, { BLOCK_SETS_TANDEM_NAME, CompareBlockSetModelOptions } from '../../common/model/CompareBlockSetModel.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PoolScaleHeightProperty from '../../common/model/PoolScaleHeightProperty.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';

export type BuoyancyBasicsCompareModelOptions = StrictOmit<CompareBlockSetModelOptions, 'positionMassesCallback' | 'cubesData'>;

export default class BuoyancyBasicsCompareModel extends CompareBlockSetModel {
  public readonly poolScaleHeightProperty: NumberProperty;
  public readonly poolScale: Scale;

  public constructor( providedOptions: BuoyancyBasicsCompareModelOptions ) {

    const tandem = providedOptions.tandem;
    const blockSetsTandem = tandem.createTandem( BLOCK_SETS_TANDEM_NAME );

    const options = optionize<BuoyancyBasicsCompareModelOptions, EmptySelfOptions, CompareBlockSetModelOptions>()( {
      showMassValuesDefault: true,

      supportsDepthLines: true,
      usePoolScale: false, // create out own based on the ScaleHeightControl

      cubesData: [
        {
          sameMassVolume: 0.002,
          sameVolumeMass: 2,
          sameDensityVolume: 0.005,
          colorProperty: DensityBuoyancyCommonColors.compareOchreColorProperty,
          sameMassCubeOptions: {
            tag: MassTag.ONE_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'blockA' )
          },
          sameVolumeCubeOptions: {
            tag: MassTag.TWO_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'blockA' )
          },
          sameDensityCubeOptions: {
            tag: MassTag.THREE_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'blockA' )
          }
        }, {
          sameMassVolume: 0.01,
          sameVolumeMass: 10,
          sameDensityVolume: 0.01,
          colorProperty: DensityBuoyancyCommonColors.compareBlueColorProperty,
          sameMassCubeOptions: {
            tag: MassTag.ONE_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'blockB' )
          },
          sameVolumeCubeOptions: {
            tag: MassTag.TWO_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'blockB' )
          },
          sameDensityCubeOptions: {
            tag: MassTag.THREE_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY ),
            tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'blockB' )
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
      tandem: providedOptions.tandem.createTandem( 'scale1' ),
      canMove: true,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } ) );

    this.poolScaleHeightProperty = new PoolScaleHeightProperty( DensityBuoyancyCommonConstants.POOL_SCALE_INITIAL_HEIGHT, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'poolScaleHeightProperty' )
    } );

    // Pool scale
    this.poolScale = new VolumelessScale( this.engine, this.gravityProperty, {
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'poolScale' ),
      canMove: false, // No input listeners, but the ScaleHeightControl can still move it
      inputEnabledPropertyOptions: {
        phetioReadOnly: true
      }
    } );

    // Make sure to render it
    this.availableMasses.push( this.poolScale );
  }

  public override reset(): void {
    super.reset();

    // This has to be called after the super reset
    this.poolScaleHeightProperty.reset();
  }
}


densityBuoyancyCommon.register( 'BuoyancyBasicsCompareModel', BuoyancyBasicsCompareModel );