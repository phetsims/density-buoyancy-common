// Copyright 2024, University of Colorado Boulder

/**
 * Model set up to support a "comparison" BlockSet where you can "lock" one variable of the density equation such
 * that all cubes have that component value. That "locked" variable (for example "same mass"), can be adjusted with
 * a control to effect all Cubes in the model.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import BlockSetModel, { BlockSetModelOptions } from './BlockSetModel.js';
import BlockSet from './BlockSet.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { Color } from '../../../../scenery/js/imports.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Material from './Material.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyModel from './DensityBuoyancyModel.js';
import Cube, { CubeOptions } from './Cube.js';
import merge from '../../../../phet-core/js/merge.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';

// This hard coded range is a bit arbitrary, but it lends itself to better colors than the provided range in the options.
const COLOR_DENSITY_RANGE = new Range( 10, 10000 );

assert && assert( BlockSet.enumeration.values.length === 3, 'This class is very hard coded for the three "SAME" values of BlockSet' );

// Public API for specifying a cube in the BlockSet. A cube will exist in all BlockSet values.
type CubeData = {
  sameMassVolume: number;
  sameVolumeMass: number;
  sameDensityVolume: number;
  colorProperty: Property<Color>;
  sameMassCubeOptions: WithRequired<Partial<CubeOptions>, 'tandem'>;
  sameVolumeCubeOptions: WithRequired<Partial<CubeOptions>, 'tandem'>;
  sameDensityCubeOptions: WithRequired<Partial<CubeOptions>, 'tandem'>;
};

type CubeDataInternal = {
  sameMassDensityProperty: TProperty<number>;
  sameMassMaterialProperty: TReadOnlyProperty<Material>;
  sameVolumeDensityProperty: TProperty<number>;
  sameVolumeMaterialProperty: TReadOnlyProperty<Material>;
  sameDensityDensityProperty: TProperty<number>;
  sameDensityMaterialProperty: TReadOnlyProperty<Material>;
} & CubeData;

type SelfOptions = {
  cubesData: CubeData[];

  sameMassValue?: number;
  sameMassRange?: Range;
  sameVolumeValue?: number;
  sameVolumeRange?: Range;
  sameDensityValue?: number;
  sameDensityRange?: Range;
};

type ParentOptions = BlockSetModelOptions<BlockSet>;

type ExcludedParentOptions = 'initialMode' | 'BlockSet' | 'createMassesCallback' | 'regenerateMassesCallback';

export type CompareBlockSetModelOptions = SelfOptions & StrictOmit<ParentOptions, ExcludedParentOptions>;

// Filled in later, and so not needed by the optionize call
type OptionizeParent = StrictOmit<ParentOptions, 'createMassesCallback'>;

export default class CompareBlockSetModel extends BlockSetModel<BlockSet> {
  public readonly massProperty: NumberProperty;
  public readonly volumeProperty: NumberProperty;
  public readonly densityProperty: NumberProperty;

  public constructor( providedOptions: CompareBlockSetModelOptions ) {

    const options = optionize<CompareBlockSetModelOptions, SelfOptions, OptionizeParent>()( {
      sameMassValue: 5,
      sameMassRange: new Range( 1, 10 ),
      sameVolumeValue: 0.005,
      sameVolumeRange: new Range( 0.001, 0.01 ),
      sameDensityValue: 400,
      sameDensityRange: new Range( 100, 2000 ),

      // BlockSetModel options
      initialMode: BlockSet.SAME_MASS,
      BlockSet: BlockSet.enumeration,
      regenerateMassesCallback: _.noop // Compare blocks live for the lifetime of the sim, and are just mutated.

    }, providedOptions );


    const tandem = options.tandem;

    const massProperty = new NumberProperty( options.sameMassValue, {
      range: options.sameMassRange,
      tandem: tandem.createTandem( 'massProperty' ),
      phetioFeatured: true,
      units: 'kg'
    } );

    const volumeProperty = new NumberProperty( options.sameVolumeValue, {
      range: options.sameVolumeRange,
      tandem: tandem.createTandem( 'volumeProperty' ),
      units: 'm^3'
    } );

    const densityProperty = new NumberProperty( options.sameDensityValue, {
      range: options.sameDensityRange,

      tandem: tandem.createTandem( 'densityProperty' ),
      units: 'kg/m^3'
    } );

    const commonCubeOptions = {
      minVolume: DensityBuoyancyCommonConstants.MIN_CUBE_VOLUME,
      maxVolume: DensityBuoyancyCommonConstants.MAX_CUBE_VOLUME
    };

    const cubesData: CubeDataInternal[] = options.cubesData.map( cubeData => {
      const sameMassDensityProperty = new NumberProperty( options.sameMassValue / cubeData.sameMassVolume, { tandem: Tandem.OPT_OUT } );
      const sameVolumeDensityProperty = new NumberProperty( cubeData.sameVolumeMass / options.sameVolumeValue, { tandem: Tandem.OPT_OUT } );
      const sameDensityDensityProperty = new NumberProperty( options.sameDensityValue, {
        range: options.sameDensityRange,
        tandem: Tandem.OPT_OUT
      } );

      return merge( {
        sameMassDensityProperty: sameMassDensityProperty,
        sameMassMaterialProperty: CompareBlockSetModel.createMaterialProperty( cubeData.colorProperty, sameMassDensityProperty ),
        sameVolumeDensityProperty: sameVolumeDensityProperty,
        sameVolumeMaterialProperty: CompareBlockSetModel.createMaterialProperty( cubeData.colorProperty, sameVolumeDensityProperty ),
        sameDensityDensityProperty: sameDensityDensityProperty,
        sameDensityMaterialProperty: CompareBlockSetModel.createMaterialProperty( cubeData.colorProperty, sameDensityDensityProperty )
      }, cubeData );
    } );

    const createMasses = ( model: DensityBuoyancyModel, blockSet: BlockSet ) => {
      let masses;
      switch( blockSet ) {
        case BlockSet.SAME_MASS: {
          masses = cubesData.map( cubeData => {
            const cube = Cube.createWithMass(
              model.engine,
              cubeData.sameMassMaterialProperty.value,
              Vector2.ZERO,
              massProperty.value,
              combineOptions<CubeOptions>( {}, commonCubeOptions, cubeData.sameMassCubeOptions )
            );

            // This cube instance lives for the lifetime of the simulation, so we don't need to remove listeners.
            cubeData.sameMassMaterialProperty.link( material => { cube.materialProperty.value = material; } );

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            massProperty.lazyLink( massValue => { cubeData.sameMassDensityProperty.value = massValue / cube.volumeProperty.value; } );
            return cube;
          } );
        }
          break;
        case BlockSet.SAME_VOLUME: {

          masses = cubesData.map( cubeData => {
            const cube = Cube.createWithMass(
              model.engine,
              cubeData.sameVolumeMaterialProperty.value,
              Vector2.ZERO,
              cubeData.sameVolumeMass,
              combineOptions<CubeOptions>( {}, commonCubeOptions, cubeData.sameVolumeCubeOptions )
            );

            // This cube instance lives for the lifetime of the simulation, so we don't need to remove listeners.
            cubeData.sameVolumeMaterialProperty.link( material => { cube.materialProperty.value = material; } );

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            volumeProperty.lazyLink( volume => {
              const size = Cube.boundsFromVolume( volume );
              cube.updateSize( size );

              // Our volume listener is triggered AFTER the cubes have phet-io applyState run, so we can't rely on
              // inspecting their mass at that time (and instead need an external reference from the data).
              // See https://github.com/phetsims/density/issues/111
              cubeData.sameVolumeDensityProperty.value = cubeData.sameVolumeMass / volume;
            } );
            return cube;
          } );
        }
          break;
        case BlockSet.SAME_DENSITY: {
          masses = cubesData.map( cubeData => {
            const startingMass = options.sameDensityValue * cubeData.sameDensityVolume;

            const cube = Cube.createWithMass(
              model.engine,
              cubeData.sameDensityMaterialProperty.value,
              Vector2.ZERO,
              startingMass,
              combineOptions<CubeOptions>( {}, commonCubeOptions, cubeData.sameDensityCubeOptions )
            );

            // This cube instance lives for the lifetime of the simulation, so we don't need to remove listeners.
            cubeData.sameDensityMaterialProperty.link( material => { cube.materialProperty.value = material; } );

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            densityProperty.lazyLink( density => { cubeData.sameDensityDensityProperty.value = density; } );
            return cube;
          } );
        }
          break;
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }

      return masses;
    };

    // Using spread here is the best possible solution. We want to add in `createMassesCallback` but cannot change the
    // type of `options` after creation, so `options.createMassesCallback = ...` won't work. Because we are providing an
    // object literal here, there is excess property checking (main worry about object spread), and the output type is
    // cleaner than using `merge()`. By spreading the output of optionize, we ensure that all contents of that type
    // are behaving correctly (including excess property checking). Furthermore, if we didn't use `OptionizeParent`
    // above (like by providing an initial void function to be overwritten), then we would be hacking out a solution
    // in value space for something that really should be handled in type space.
    super( {
      createMassesCallback: createMasses,

      ...options // eslint-disable-line no-object-spread-on-non-literals
    } );

    this.massProperty = massProperty;
    this.volumeProperty = volumeProperty;
    this.densityProperty = densityProperty;
  }

  public override reset(): void {
    this.massProperty.reset();
    this.volumeProperty.reset();
    this.densityProperty.reset();
    super.reset();
  }

  private static createMaterialProperty( colorProperty: TProperty<Color>, myDensityProperty: TProperty<number> ): TReadOnlyProperty<Material> {
    return new DerivedProperty( [ colorProperty, myDensityProperty ], ( color, density ) => {
      const lightness = Material.getNormalizedLightness( density, COLOR_DENSITY_RANGE ); // 0-1

      const modifier = 0.1;
      const rawValue = ( lightness * 2 - 1 ) * ( 1 - modifier ) + modifier;
      const power = 0.7;
      const modifiedColor = color.colorUtilsBrightness( Math.sign( rawValue ) * Math.pow( Math.abs( rawValue ), power ) );

      return Material.createCustomSolidMaterial( {
        density: density,
        customColor: new Property( modifiedColor, { tandem: Tandem.OPT_OUT } )
      } );
    }, {
      strictAxonDependencies: false, // The DerivedProperty derivation triggers the creation of a DynamicProperty which calls .value on itself, which is safe
      tandem: Tandem.OPT_OUT
    } );
  }
}

// The tandem where all cubes should be nested under
export const BLOCK_SETS_TANDEM_NAME = 'blockSets';

densityBuoyancyCommon.register( 'CompareBlockSetModel', CompareBlockSetModel );