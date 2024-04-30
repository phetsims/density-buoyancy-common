// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cube from '../../common/model/Cube.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassTag from '../../common/model/MassTag.js';
import BlockSetModel, { BlockSetModelOptions } from '../../common/model/BlockSetModel.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import BlockSet from '../../common/model/BlockSet.js';
import VolumelessScale from '../../common/model/VolumelessScale.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';

export type BuoyancyBasicsCompareModelOptions = StrictOmit<BlockSetModelOptions<BlockSet>, 'initialMode' | 'BlockSet' | 'createMassesCallback' | 'regenerateMassesCallback' | 'positionMassesCallback'>;

export default class BuoyancyBasicsCompareModel extends BlockSetModel<BlockSet> {
  public readonly densityExpandedProperty = new BooleanProperty( false );
  public readonly percentageSubmergedExpandedProperty = new BooleanProperty( false );
  public readonly poolScaleHeightProperty: NumberProperty;
  public readonly poolScale: Scale;

  public constructor( providedOptions: BuoyancyBasicsCompareModelOptions ) {
    const tandem = providedOptions.tandem;

    const blockSetsTandem = tandem.createTandem( 'blockSets' );
    const sameMassTandem = blockSetsTandem.createTandem( 'sameMass' );
    const sameVolumeTandem = blockSetsTandem.createTandem( 'sameVolume' );
    const sameDensityTandem = blockSetsTandem.createTandem( 'sameDensity' );

    const options = optionize<BuoyancyBasicsCompareModelOptions, EmptySelfOptions, BlockSetModelOptions<BlockSet>>()( {
      initialMode: BlockSet.SAME_MASS,
      BlockSet: BlockSet.enumeration,
      showMassesDefault: true,

      supportsDepthLines: true,
      usePoolScale: false, // create out own based on the ScaleHeightControl

      createMassesCallback: ( model, blockSet ) => {
        switch( blockSet ) {
          case BlockSet.SAME_MASS:
            return [
              Cube.createWithMass( model.engine,
                Material.createCustomMaterial( {
                  density: 500, // V=10L
                  customColor: DensityBuoyancyCommonColors.compareRedColorProperty
                } ), Vector2.ZERO, 5, {
                  tandem: sameMassTandem.createTandem( 'blockA' ),
                  adjustableMaterial: true,
                  tag: MassTag.ONE_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY )
                } ),
              Cube.createWithMass( model.engine,
                Material.createCustomMaterial( {
                  density: 2500, // V=2L
                  customColor: DensityBuoyancyCommonColors.compareBlueColorProperty
                } ), Vector2.ZERO, 5, {
                  tandem: sameMassTandem.createTandem( 'blockB' ),
                  adjustableMaterial: true,
                  tag: MassTag.ONE_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY )
                } )
            ];
          case BlockSet.SAME_VOLUME:
            return [
              Cube.createWithVolume( model.engine, Material.createCustomMaterial( {
                density: 400, // m=2kg
                customColor: DensityBuoyancyCommonColors.compareRedColorProperty
              } ), Vector2.ZERO, 0.005, {
                tandem: sameVolumeTandem.createTandem( 'blockA' ),
                adjustableMaterial: true,
                tag: MassTag.TWO_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY )
              } ),
              Cube.createWithVolume( model.engine, Material.createCustomMaterial( {
                density: 2000, // m=2kg
                customColor: DensityBuoyancyCommonColors.compareBlueColorProperty
              } ), Vector2.ZERO, 0.005, {
                tandem: sameVolumeTandem.createTandem( 'blockB' ),
                adjustableMaterial: true,
                tag: MassTag.TWO_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY )
              } )
            ];
          case BlockSet.SAME_DENSITY:
            return [
              Cube.createWithMass( model.engine, Material.createCustomMaterial( {
                density: 400, // V=5L
                customColor: DensityBuoyancyCommonColors.compareRedColorProperty
              } ), Vector2.ZERO, 2, {
                tandem: sameDensityTandem.createTandem( 'blockA' ),
                adjustableMaterial: true,
                tag: MassTag.THREE_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY )
              } ),
              Cube.createWithMass( model.engine, Material.createCustomMaterial( {
                density: 400, // V=10L
                customColor: DensityBuoyancyCommonColors.compareBlueColorProperty
              } ), Vector2.ZERO, 4, {
                tandem: sameDensityTandem.createTandem( 'blockB' ),
                adjustableMaterial: true,
                tag: MassTag.THREE_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY )
              } )
            ];
          default:
            throw new Error( `unknown blockSet: ${blockSet}` );
        }
      },

      regenerateMassesCallback: ( model, blockSet, masses ) => {
        // See subclass for implementation
      },

      positionMassesCallback: ( model, blockSet, masses ) => {
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
      matrix: Matrix3.translation( -0.77, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: providedOptions.tandem.createTandem( 'scale1' ),
      canMove: true,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } ) );

    this.poolScaleHeightProperty = new NumberProperty( 1, {
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
}


densityBuoyancyCommon.register( 'BuoyancyBasicsCompareModel', BuoyancyBasicsCompareModel );