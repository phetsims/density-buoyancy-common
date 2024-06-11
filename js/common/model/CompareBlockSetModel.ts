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
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
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
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

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

  // Support for using non-custom materials as the initial materials of the blocks, but only if their densities are
  // the same. Once the variable changes for the given block set, these are ignored, and custom materials are used. Use
  // an empty list to opt out of this feature.
  initialMaterials?: Material[];
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

      initialMaterials: [],

      // BlockSetModel options
      initialMode: BlockSet.SAME_MASS,
      BlockSet: BlockSet.enumeration,
      regenerateMassesCallback: _.noop // Compare blocks live for the lifetime of the sim, and are just mutated.

    }, providedOptions );

    const tandem = options.tandem;
    const blockSetsTandem = tandem.createTandem( 'blockSets' );

    const massProperty = new HasChangedNumberProperty( options.sameMassValue, {
      range: options.sameMassRange,
      tandem: blockSetsTandem.createTandem( BlockSet.SAME_MASS.tandemName ).createTandem( 'massProperty' ),
      phetioFeatured: true,
      units: 'kg'
    } );

    const volumeProperty = new HasChangedNumberProperty( options.sameVolumeValue, {
      range: options.sameVolumeRange,
      tandem: blockSetsTandem.createTandem( BlockSet.SAME_VOLUME.tandemName ).createTandem( 'volumeProperty' ),
      phetioFeatured: true,
      units: 'm^3'
    } );

    const densityProperty = new HasChangedNumberProperty( options.sameDensityValue, {
      range: options.sameDensityRange,

      tandem: blockSetsTandem.createTandem( BlockSet.SAME_DENSITY.tandemName ).createTandem( 'densityProperty' ),
      phetioFeatured: true,
      units: 'kg/m^3'
    } );

    const commonCubeOptions = {
      minVolume: DensityBuoyancyCommonConstants.MIN_CUBE_VOLUME,
      maxVolume: DensityBuoyancyCommonConstants.MAX_CUBE_VOLUME
    };

    const cubesData: CubeDataInternal[] = options.cubesData.map( cubeData => {
      const sameMassDensityProperty = new NumberProperty( options.sameMassValue / cubeData.sameMassVolume );
      const sameVolumeDensityProperty = new NumberProperty( cubeData.sameVolumeMass / options.sameVolumeValue );
      const sameDensityDensityProperty = new NumberProperty( options.sameDensityValue, {
        range: options.sameDensityRange
      } );

      return merge( {

        sameMassDensityProperty: sameMassDensityProperty,
        sameMassMaterialProperty: CompareBlockSetModel.createMaterialProperty( cubeData.colorProperty, sameMassDensityProperty,
          massProperty.hasChangedProperty, options.initialMaterials ),

        sameVolumeDensityProperty: sameVolumeDensityProperty,
        sameVolumeMaterialProperty: CompareBlockSetModel.createMaterialProperty( cubeData.colorProperty, sameVolumeDensityProperty,
          volumeProperty.hasChangedProperty, options.initialMaterials ),

        sameDensityDensityProperty: sameDensityDensityProperty,
        sameDensityMaterialProperty: CompareBlockSetModel.createMaterialProperty( cubeData.colorProperty, sameDensityDensityProperty,
          densityProperty.hasChangedProperty, options.initialMaterials )

      }, cubeData );
    } );

    const createMasses = ( model: DensityBuoyancyModel, blockSet: BlockSet ) => {

      // In the following code, the cube instance persists for the lifetime of the simulation and the listeners
      // don't need to be removed.
      return blockSet === BlockSet.SAME_MASS ?
             cubesData.map( cubeData => {
               const cube = Cube.createWithMass( model.engine, cubeData.sameMassMaterialProperty.value, Vector2.ZERO,
                 massProperty.value, combineOptions<CubeOptions>( {}, commonCubeOptions, cubeData.sameMassCubeOptions ) );

               cubeData.sameMassMaterialProperty.link( material => cube.materialProperty.set( material ) );
               massProperty.lazyLink( massValue => cubeData.sameMassDensityProperty.set( massValue / cube.volumeProperty.value ) );

               return cube;
             } ) :

             blockSet === BlockSet.SAME_VOLUME ?
             cubesData.map( cubeData => {
               const cube = Cube.createWithMass( model.engine, cubeData.sameVolumeMaterialProperty.value, Vector2.ZERO,
                 cubeData.sameVolumeMass, combineOptions<CubeOptions>( {}, commonCubeOptions, cubeData.sameVolumeCubeOptions ) );

               cubeData.sameVolumeMaterialProperty.link( material => cube.materialProperty.set( material ) );

               volumeProperty.lazyLink( volume => {
                 const size = Cube.boundsFromVolume( volume );
                 cube.updateSize( size );

                 // Our volume listener is triggered AFTER the cubes have phet-io applyState run, so we can't rely on
                 // inspecting their mass at that time (and instead need an external reference from the data).
                 // See https://github.com/phetsims/density/issues/111
                 cubeData.sameVolumeDensityProperty.value = cubeData.sameVolumeMass / volume;
               } );

               return cube;
             } ) :
             cubesData.map( cubeData => {
               const startingMass = options.sameDensityValue * cubeData.sameDensityVolume;

               const cube = Cube.createWithMass( model.engine, cubeData.sameDensityMaterialProperty.value, Vector2.ZERO,
                 startingMass, combineOptions<CubeOptions>( {}, commonCubeOptions, cubeData.sameDensityCubeOptions ) );

               cubeData.sameDensityMaterialProperty.link( material => cube.materialProperty.set( material ) );
               densityProperty.lazyLink( density => cubeData.sameDensityDensityProperty.set( density ) );

               return cube;
             } );
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

  private static createMaterialProperty( colorProperty: TProperty<Color>, myDensityProperty: TProperty<number>,
                                         blockSetValueChangedProperty: TProperty<boolean>, initialMaterials: Material[] ): TReadOnlyProperty<Material> {
    return new DerivedProperty( [ colorProperty, myDensityProperty, blockSetValueChangedProperty ],
      ( color, density, blockSetValueChanged ) => {

        if ( !blockSetValueChanged ) {
          for ( let i = 0; i < initialMaterials.length; i++ ) {
            const material = initialMaterials[ i ];
            if ( material.density === density ) {
              return material;
            }
          }
        }

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

// NumberProperty that composes an additional Property that monitors if that Property's value has changed or not.
class HasChangedNumberProperty extends NumberProperty {

  // Has the value changed? Will stay true even if set 0->1->0 when 0 is the initial value. True until reset.
  public hasChangedProperty: Property<boolean>;

  public constructor( initialValue: number, options: NumberPropertyOptions ) {
    super( initialValue, options );
    this.hasChangedProperty = new BooleanProperty( false, {
      tandem: options.tandem?.createTandem( 'hasChangedProperty' ),
      phetioReadOnly: true
    } );
    this.lazyLink( () => { this.hasChangedProperty.value = true; } );
  }

  public override reset(): void {
    super.reset();

    // Reset after the potenial value change in the super call
    this.hasChangedProperty.reset();
  }

  public override dispose(): void {
    this.hasChangedProperty.dispose();
    super.dispose();
  }
}

// The tandem where all cubes should be nested under
export const BLOCK_SETS_TANDEM_NAME = 'blockSets';

densityBuoyancyCommon.register( 'CompareBlockSetModel', CompareBlockSetModel );