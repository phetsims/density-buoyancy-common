// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cube, { CubeOptions } from '../../common/model/Cube.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassTag from '../../common/model/MassTag.js';
import BlockSetModel, { BlockSetModelOptions } from '../../common/model/BlockSetModel.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import BlockSet from '../../common/model/BlockSet.js';
import VolumelessScale from '../../common/model/VolumelessScale.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { Color } from '../../../../scenery/js/imports.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';

// TODO: range, https://github.com/phetsims/buoyancy-basics/issues/5
const COLOR_DENSITY_RANGE = new Range( 10, 10000 );

export type BuoyancyBasicsCompareModelOptions = StrictOmit<BlockSetModelOptions<BlockSet>, 'initialMode' | 'BlockSet' | 'createMassesCallback' | 'regenerateMassesCallback' | 'positionMassesCallback'>;

export default class BuoyancyBasicsCompareModel extends BlockSetModel<BlockSet> {
  public readonly densityExpandedProperty = new BooleanProperty( false );
  public readonly percentageSubmergedExpandedProperty = new BooleanProperty( false );
  public readonly poolScaleHeightProperty: NumberProperty;
  public readonly poolScale: Scale;

  public readonly massProperty: NumberProperty;
  public readonly volumeProperty: NumberProperty;
  public readonly densityProperty: NumberProperty;

  public constructor( providedOptions: BuoyancyBasicsCompareModelOptions ) {
    const tandem = providedOptions.tandem;

    const blockSetsTandem = tandem.createTandem( 'blockSets' );
    const sameMassTandem = blockSetsTandem.createTandem( 'sameMass' );
    const sameVolumeTandem = blockSetsTandem.createTandem( 'sameVolume' );
    const sameDensityTandem = blockSetsTandem.createTandem( 'sameDensity' );

    const massProperty = new NumberProperty( 5, {
      range: new Range( 1, 10 ),
      tandem: tandem.createTandem( 'massProperty' ),
      units: 'kg'
    } );

    const volumeProperty = new NumberProperty( 0.005, {
      range: new Range( 0.001, 0.01 ),
      tandem: tandem.createTandem( 'volumeProperty' ),
      units: 'm^3'
    } );

    const densityProperty = new NumberProperty( 400, {
      range: new Range( 100, 2000 ),

      tandem: tandem.createTandem( 'densityProperty' ),
      units: 'kg/m^3'
    } );

    // TODO: duplicated https://github.com/phetsims/buoyancy-basics/issues/5
    const createMaterialProperty = ( colorProperty: TProperty<Color>, myDensityProperty: TProperty<number> ) => {
      return new DerivedProperty( [ colorProperty, myDensityProperty ], ( color, density ) => {
        const lightness = Material.getNormalizedLightness( density, COLOR_DENSITY_RANGE ); // 0-1

        const modifier = 0.1;
        const rawValue = ( lightness * 2 - 1 ) * ( 1 - modifier ) + modifier;
        const power = 0.7;
        const modifiedColor = color.colorUtilsBrightness( Math.sign( rawValue ) * Math.pow( Math.abs( rawValue ), power ) );

        return Material.createCustomMaterial( {
          density: density,
          customColor: new Property( modifiedColor, { tandem: Tandem.OPT_OUT } )
        } );
      }, {
        tandem: Tandem.OPT_OUT
      } );
    };

    // TODO: wat? https://github.com/phetsims/buoyancy-basics/issues/5
    const minScreenVolume = DensityBuoyancyCommonConstants.DENSITY_MIN_SCREEN_VOLUME;
    const maxScreenVolume = DensityBuoyancyCommonConstants.DENSITY_MAX_SCREEN_VOLUME;

    const commonCubeOptions = {
      minVolume: minScreenVolume,
      maxVolume: maxScreenVolume
    };

    const sameMassRedDensityProperty = new NumberProperty( 500, { tandem: Tandem.OPT_OUT } );
    const sameMassBlueDensityProperty = new NumberProperty( 2500, { tandem: Tandem.OPT_OUT } );

    const sameVolumeRedDensityProperty = new NumberProperty( 400, { tandem: Tandem.OPT_OUT } );
    const sameVolumeBlueDensityProperty = new NumberProperty( 2000, { tandem: Tandem.OPT_OUT } );

    const sameDensityRedDensityProperty = new NumberProperty( 400, { tandem: Tandem.OPT_OUT } );
    const sameDensityBlueDensityProperty = new NumberProperty( 400, { tandem: Tandem.OPT_OUT } );

    const sameMassRedMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareRedColorProperty, sameMassRedDensityProperty );
    const sameMassBlueMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareBlueColorProperty, sameMassBlueDensityProperty );

    const sameVolumeRedMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareRedColorProperty, sameVolumeRedDensityProperty );
    const sameVolumeBlueMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareBlueColorProperty, sameVolumeBlueDensityProperty );

    const sameDensityRedMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareRedColorProperty, sameDensityRedDensityProperty );
    const sameDensityBlueMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareBlueColorProperty, sameDensityBlueDensityProperty );

    // TODO: supertype creates this based on an array of block-data https://github.com/phetsims/buoyancy-basics/issues/5
    const createMasses = ( model: DensityBuoyancyModel, blockSet: BlockSet ) => {
      let masses;
      switch( blockSet ) {
        case BlockSet.SAME_MASS: {
          const sameMassRedMass = Cube.createWithMass(
            model.engine,
            sameMassRedMaterialProperty.value,
            Vector2.ZERO,
            massProperty.value,
            combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY ), tandem: sameMassTandem.createTandem( 'blockA' ) } )
          );
          const sameMassBlueMass = Cube.createWithMass(
            model.engine,
            sameMassBlueMaterialProperty.value,
            Vector2.ZERO,
            massProperty.value,
            combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.ONE_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY ), tandem: sameMassTandem.createTandem( 'blockB' ) } )
          );

          sameMassRedMaterialProperty.link( material => { sameMassRedMass.materialProperty.value = material; } );
          sameMassBlueMaterialProperty.link( material => { sameMassBlueMass.materialProperty.value = material; } );

          masses = [ sameMassRedMass, sameMassBlueMass ];

          // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
          massProperty.lazyLink( massValue => {
            sameMassRedDensityProperty.value = massValue / sameMassRedMass.volumeProperty.value;
            sameMassBlueDensityProperty.value = massValue / sameMassBlueMass.volumeProperty.value;
          } );
        }
          break;
        case BlockSet.SAME_VOLUME: {
          // Our volume listener is triggered AFTER the cubes have phet-io applyState run, so we can't rely on
          // inspecting their mass at that time (and instead need an external reference).
          // See https://github.com/phetsims/density/issues/111
          const massValues = {
            red: 2,
            blue: 10
          };
          const sameVolumeRedMass = Cube.createWithMass(
            model.engine,
            sameVolumeRedMaterialProperty.value,
            Vector2.ZERO,
            massValues.red,
            combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY ), tandem: sameVolumeTandem.createTandem( 'blockA' ) } )
          );
          const sameVolumeBlueMass = Cube.createWithMass(
            model.engine,
            sameVolumeBlueMaterialProperty.value,
            Vector2.ZERO,
            massValues.blue,
            combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.TWO_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY ), tandem: sameVolumeTandem.createTandem( 'blockB' ) } )
          );

          sameVolumeRedMaterialProperty.link( material => { sameVolumeRedMass.materialProperty.value = material; } );
          sameVolumeBlueMaterialProperty.link( material => { sameVolumeBlueMass.materialProperty.value = material; } );

          masses = [ sameVolumeRedMass, sameVolumeBlueMass ];

          // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
          volumeProperty.lazyLink( volume => {
            const size = Cube.boundsFromVolume( volume );
            sameVolumeRedMass.updateSize( size );
            sameVolumeBlueMass.updateSize( size );

            sameVolumeRedDensityProperty.value = massValues.red / volume;
            sameVolumeBlueDensityProperty.value = massValues.blue / volume;
          } );
        }
          break;
        case BlockSet.SAME_DENSITY: {
          const sameDensityRedMass = Cube.createWithMass(
            model.engine,
            sameDensityRedMaterialProperty.value,
            Vector2.ZERO,
            2,
            combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY ), tandem: sameDensityTandem.createTandem( 'blockA' ) } )
          );
          const sameDensityBlueMass = Cube.createWithMass(
            model.engine,
            sameDensityBlueMaterialProperty.value,
            Vector2.ZERO,
            4,
            combineOptions<CubeOptions>( {}, commonCubeOptions, { tag: MassTag.THREE_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY ), tandem: sameDensityTandem.createTandem( 'blockB' ) } )
          );

          sameDensityRedMaterialProperty.link( material => { sameDensityRedMass.materialProperty.value = material; } );
          sameDensityBlueMaterialProperty.link( material => { sameDensityBlueMass.materialProperty.value = material; } );

          masses = [ sameDensityRedMass, sameDensityBlueMass ];

          // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
          densityProperty.lazyLink( density => {
            sameDensityRedDensityProperty.value = density;
            sameDensityBlueDensityProperty.value = density;
          } );
        }
          break;
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }

      return masses;
    };

    const options = optionize<BuoyancyBasicsCompareModelOptions, EmptySelfOptions, BlockSetModelOptions<BlockSet>>()( {
      initialMode: BlockSet.SAME_MASS,
      BlockSet: BlockSet.enumeration,
      showMassesDefault: true,

      supportsDepthLines: true,
      usePoolScale: false, // create out own based on the ScaleHeightControl

      createMassesCallback: createMasses,

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

    this.massProperty = massProperty;
    this.volumeProperty = volumeProperty;
    this.densityProperty = densityProperty;


    // TODO: not sure about this. https://github.com/phetsims/buoyancy-basics/issues/5
    this.uninterpolateMasses();

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