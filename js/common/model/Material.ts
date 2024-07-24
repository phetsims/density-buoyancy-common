// Copyright 2022-2024, University of Colorado Boulder

/**
 * Represents different materials that solids/liquids in the simulations can take, including density/viscosity/color.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Color } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColors from '../view/DensityBuoyancyCommonColors.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import { HasValueProperty } from './MappedWrappedProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

type SelfOptions = {
  nameProperty?: TReadOnlyProperty<string>;

  // in SI (kg/m^3)
  density?: number;

  // What potential densities can this Material accept? (mostly applies to custom materials)
  densityRange?: Range;

  // in SI (Pa * s). For reference a poise is 1e-2 Pa*s, and a centipoise is 1e-3 Pa*s.
  viscosity?: number;

  // Whether the material is custom (can be modified by the user)
  custom?: boolean;

  // If true, don't show the density in number pickers/readouts, often called a "mystery" material elsewhere in the code.
  hidden?: boolean;

  // Uses the color for a solid material's color
  colorProperty?: ReadOnlyProperty<Color> | null;

  // Used for the color of depth lines added on top of the Material
  depthLinesColorProperty?: TReadOnlyProperty<Color>;
};

export type MaterialOptions = SelfOptions & StrictOmit<PhetioObjectOptions, 'tandem'>;

const MATERIALS_TANDEM = Tandem.GLOBAL_MODEL.createTandem( 'materials' );
const SOLIDS_TANDEM = MATERIALS_TANDEM.createTandem( 'solids' );
const FLUIDS_TANDEM = MATERIALS_TANDEM.createTandem( 'fluids' );

// TODO: Material should wire up color properties https://github.com/phetsims/density-buoyancy-common/issues/268
// TODO: Material should know its density range https://github.com/phetsims/density-buoyancy-common/issues/268
export default class Material extends PhetioObject implements HasValueProperty {

  public readonly nameProperty: TReadOnlyProperty<string>;
  public readonly viscosity: number;
  public readonly custom: boolean;
  public readonly hidden: boolean;
  public colorProperty: ReadOnlyProperty<Color> | null;
  public depthLinesColorProperty: TReadOnlyProperty<Color>;
  public readonly densityProperty: NumberProperty;

  public constructor( tandem: Tandem, providedOptions: MaterialOptions ) {

    const options = optionize<MaterialOptions, SelfOptions, PhetioObjectOptions>()( {
      nameProperty: new TinyProperty( 'unknown' ),
      density: 1,
      densityRange: new Range( 0.8, 27000 ),
      viscosity: 1e-3,
      custom: false,
      hidden: false,
      colorProperty: null,
      depthLinesColorProperty: DensityBuoyancyCommonColors.depthLinesDarkColorProperty
    }, providedOptions );

    assert && assert( isFinite( options.density ), 'density should be finite, but it was: ' + options.density );

    super( {
      tandem: tandem,
      phetioState: false
    } );

    this.nameProperty = options.nameProperty;
    this.densityProperty = new NumberProperty( options.density, {
      tandem: this.tandem.createTandem( 'densityProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Density of the material',
      range: options.densityRange,
      units: 'kg/m^3'
    } );
    this.viscosity = options.viscosity;
    this.custom = options.custom;
    this.hidden = options.hidden;
    this.colorProperty = options.colorProperty;
    this.depthLinesColorProperty = options.depthLinesColorProperty;

    assert && assert( !( this.custom && this.hidden ), 'cannot be a mystery custom material' );
  }

  /**
   * Get the current density value of the densityProperty. Convenience accessor which is used numerous times in the simulation.
   */
  public get density(): number {
    return this.densityProperty.value;
  }

  public get valueProperty(): NumberProperty {
    return this.densityProperty;
  }

  public reset(): void {
    this.densityProperty.reset();
  }

  /**
   * Returns a custom material that can be modified at will.
   */
  public static createCustomMaterial( tandem: Tandem, options: MaterialOptions ): Material {
    return new Material( tandem, combineOptions<MaterialOptions>( {
      nameProperty: DensityBuoyancyCommonStrings.material.customStringProperty,
      custom: true
    }, options ) );
  }

  /**
   * Returns a lightness factor from 0-1 that can be used to map a density to a desired color.
   * TODO: This has a poor dynamic range for the bottle inside material, but is used elsewhere. Should it be changed/split/improved? https://github.com/phetsims/density-buoyancy-common/issues/268
   */
  public static getNormalizedLightness( density: number, densityRange: Range ): number {
    const scaleFactor = 1000;
    const scaleMax = Utils.log10( densityRange.max / scaleFactor ); // 1 for the default
    const scaleMin = Utils.log10( densityRange.min / scaleFactor ); // -2 for the default
    const scaleValue = Utils.log10( density / scaleFactor );
    return Utils.clamp( Utils.linear( scaleMax, scaleMin, 0, 1, scaleValue ), 0, 1 );
  }

  /**
   * Similar to getCustomLightness, but returns the generated color, with an included alpha effect.
   */
  public static getCustomLiquidColor( density: number, densityRange: Range ): Color {
    const lightnessFactor = Material.getNormalizedLightness( density, densityRange );
    return Color.interpolateRGBA(
      DensityBuoyancyCommonColors.customFluidDarkColorProperty.value,
      DensityBuoyancyCommonColors.customFluidLightColorProperty.value,
      lightnessFactor );
  }

  /**
   * TODO: a couple thoughts. https://github.com/phetsims/density-buoyancy-common/issues/268
   *  1. could this be solved is MaterialProperty.colorProperty was a dynamic property, then these usages would just link to that to update the THREE mesh.
   *  2. At the very least, move this to a prototype method on MaterialProperty.
   *
   * Keep a material's color and opacity to match the liquid color from a given Property<Material>
   *
   * NOTE: Only call this for things that exist for the lifetime of this simulation (otherwise it would leak memory)
   */
  public static linkColorProperty( property: TProperty<Material>, threeMaterial: THREE.MeshPhongMaterial | THREE.MeshLambertMaterial | THREE.MeshBasicMaterial ): void {
    new DynamicProperty<Color, Color, Material>( property, {
      derive: material => {
        assert && assert( material.colorProperty );

        return material.colorProperty!;
      }
    } ).link( ( color: Color ) => {
      threeMaterial.color = ThreeUtils.colorToThree( color );
      threeMaterial.opacity = color.alpha;
    } );
  }

  ////////////////// SOLIDS //////////////////

  public static readonly ALUMINUM = new Material( SOLIDS_TANDEM.createTandem( 'aluminum' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.aluminumStringProperty,
    density: 2700
  } );

  public static readonly APPLE = new Material( SOLIDS_TANDEM.createTandem( 'apple' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.appleStringProperty,
    // "Some Physical Properties of Apple" - Averaged the two cultivars' densities for this
    // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.548.1131&rep=rep1&type=pdf
    density: 832
  } );

  // In essence identical to aluminum, but with a different name for the Density readout
  // TODO: Unify the names body vs hull, see https://github.com/phetsims/density-buoyancy-common/issues/123
  public static readonly BOAT_BODY = new Material( SOLIDS_TANDEM.createTandem( 'boatHull' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.boatHullStringProperty,
    density: Material.ALUMINUM.density
  } );

  public static readonly BRICK = new Material( SOLIDS_TANDEM.createTandem( 'brick' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.brickStringProperty,
    density: 2000,
    depthLinesColorProperty: DensityBuoyancyCommonColors.depthLinesLightColorProperty
  } );

  public static readonly CONCRETE = new Material( SOLIDS_TANDEM.createTandem( 'concrete' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.concreteStringProperty,
    density: 3150,
    colorProperty: DensityBuoyancyCommonColors.materialConcreteColorProperty
  } );

  public static readonly COPPER = new Material( SOLIDS_TANDEM.createTandem( 'copper' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.copperStringProperty,
    density: 8960,
    colorProperty: DensityBuoyancyCommonColors.materialCopperColorProperty
  } );

  public static readonly DIAMOND = new Material( SOLIDS_TANDEM.createTandem( 'diamond' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.diamondStringProperty,
    density: 3510
  } );

  public static readonly GLASS = new Material( SOLIDS_TANDEM.createTandem( 'glass' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.glassStringProperty,
    density: 2700
  } );

  public static readonly GOLD = new Material( SOLIDS_TANDEM.createTandem( 'gold' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.goldStringProperty,
    density: 19320
  } );

  public static readonly HUMAN = new Material( SOLIDS_TANDEM.createTandem( 'human' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.humanStringProperty,
    density: 950
  } );

  public static readonly ICE = new Material( SOLIDS_TANDEM.createTandem( 'ice' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.iceStringProperty,
    density: 919
  } );

  public static readonly LEAD = new Material( SOLIDS_TANDEM.createTandem( 'lead' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.leadStringProperty,
    density: 11342
  } );

  public static readonly PLATINUM = new Material( SOLIDS_TANDEM.createTandem( 'platinum' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.platinumStringProperty,
    density: 21450
  } );

  public static readonly PVC = new Material( SOLIDS_TANDEM.createTandem( 'pvc' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.pvcStringProperty,
    density: 1440
  } );

  public static readonly PYRITE = new Material( SOLIDS_TANDEM.createTandem( 'pyrite' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.pyriteStringProperty,
    density: 5010
  } );

  public static readonly SILVER = new Material( SOLIDS_TANDEM.createTandem( 'silver' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.silverStringProperty,
    density: 10490
  } );

  public static readonly STEEL = new Material( SOLIDS_TANDEM.createTandem( 'steel' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.steelStringProperty,
    density: 7800
  } );

  public static readonly STYROFOAM = new Material( SOLIDS_TANDEM.createTandem( 'styrofoam' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.styrofoamStringProperty,
    // From Flash version: between 25 and 200 according to http://wiki.answers.com/Q/What_is_the_density_of_styrofoam;
    // chose 150, so it isn't too low to show on slider, but not 200, so it's not half of wood
    density: 150
  } );

  public static readonly TANTALUM = new Material( SOLIDS_TANDEM.createTandem( 'tantalum' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.tantalumStringProperty,
    density: 16650
  } );

  public static readonly TITANIUM = new Material( SOLIDS_TANDEM.createTandem( 'titanium' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.titaniumStringProperty,
    density: 4500
  } );

  public static readonly WOOD = new Material( SOLIDS_TANDEM.createTandem( 'wood' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.woodStringProperty,
    density: 400,
    depthLinesColorProperty: DensityBuoyancyCommonColors.depthLinesLightColorProperty
  } );

  ////////////////// LIQUIDS //////////////////

  public static readonly AIR = new Material( FLUIDS_TANDEM.createTandem( 'air' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.airStringProperty,
    density: 1.2,
    viscosity: 0
  } );

  public static readonly FLUID_A = new Material( FLUIDS_TANDEM.createTandem( 'fluidA' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidAStringProperty,
    density: 3100,
    colorProperty: DensityBuoyancyCommonColors.materialFluidAColorProperty,
    hidden: true
  } );

  public static readonly FLUID_B = new Material( FLUIDS_TANDEM.createTandem( 'fluidB' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidBStringProperty,
    density: 790,
    colorProperty: DensityBuoyancyCommonColors.materialFluidBColorProperty,
    hidden: true
  } );

  public static readonly FLUID_C = new Material( FLUIDS_TANDEM.createTandem( 'fluidC' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidCStringProperty,
    density: 490,
    colorProperty: DensityBuoyancyCommonColors.materialFluidCColorProperty,
    hidden: true
  } );

  public static readonly FLUID_D = new Material( FLUIDS_TANDEM.createTandem( 'fluidD' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidDStringProperty,
    density: 2890,
    colorProperty: DensityBuoyancyCommonColors.materialFluidDColorProperty,
    hidden: true
  } );

  public static readonly FLUID_E = new Material( FLUIDS_TANDEM.createTandem( 'fluidE' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidEStringProperty,
    density: 1260,
    colorProperty: DensityBuoyancyCommonColors.materialFluidEColorProperty,
    hidden: true
  } );

  public static readonly FLUID_F = new Material( FLUIDS_TANDEM.createTandem( 'fluidF' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidFStringProperty,
    density: 6440,
    colorProperty: DensityBuoyancyCommonColors.materialFluidFColorProperty,
    hidden: true
  } );

  public static readonly GASOLINE = new Material( FLUIDS_TANDEM.createTandem( 'gasoline' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.gasolineStringProperty,
    density: 680,
    viscosity: 6e-4,
    colorProperty: DensityBuoyancyCommonColors.materialGasolineColorProperty
  } );

  public static readonly HONEY = new Material( FLUIDS_TANDEM.createTandem( 'honey' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.honeyStringProperty,
    density: 1440,
    viscosity: 0.03, // NOTE: actual value around 2.5, but we can get away with this for animation
    colorProperty: DensityBuoyancyCommonColors.materialHoneyColorProperty
  } );

  public static readonly MERCURY = new Material( FLUIDS_TANDEM.createTandem( 'mercury' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.mercuryStringProperty,
    density: 13593,
    viscosity: 1.53e-3,
    colorProperty: DensityBuoyancyCommonColors.materialMercuryColorProperty
  } );

  public static readonly OIL = new Material( FLUIDS_TANDEM.createTandem( 'oil' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.oilStringProperty,
    density: 920,
    viscosity: 0.02, // Too much bigger and it won't work, not particularly physical
    colorProperty: DensityBuoyancyCommonColors.materialOilColorProperty
  } );

  public static readonly SAND = new Material( FLUIDS_TANDEM.createTandem( 'sand' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.sandStringProperty,
    density: 1442,
    viscosity: 0.03, // Too much bigger and it won't work, not particularly physical
    colorProperty: DensityBuoyancyCommonColors.materialSandColorProperty
  } );

  public static readonly SEAWATER = new Material( FLUIDS_TANDEM.createTandem( 'seawater' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.seawaterStringProperty,
    density: 1029,
    viscosity: 1.88e-3,
    colorProperty: DensityBuoyancyCommonColors.materialSeawaterColorProperty
  } );

  public static readonly WATER = new Material( FLUIDS_TANDEM.createTandem( 'water' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.waterStringProperty,
    density: 1000,
    viscosity: 8.9e-4,
    colorProperty: DensityBuoyancyCommonColors.materialWaterColorProperty
  } );

  ////////////////// MYSTERY MATERIALS //////////////////

  public static readonly MATERIAL_O = new Material( SOLIDS_TANDEM.createTandem( 'materialO' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.materialOStringProperty,
    hidden: true,
    colorProperty: DensityBuoyancyCommonColors.materialOColorProperty,
    density: 950 // Same as the Human's average density
  } );

  public static readonly MATERIAL_P = new Material( SOLIDS_TANDEM.createTandem( 'materialP' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.materialPStringProperty,
    hidden: true,
    colorProperty: DensityBuoyancyCommonColors.materialPColorProperty,
    density: Material.DIAMOND.density
  } );

  public static readonly MATERIAL_R = new Material( SOLIDS_TANDEM.createTandem( 'materialR' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.materialRStringProperty,
    hidden: true,
    colorProperty: DensityBuoyancyCommonColors.materialRColorProperty,
    density: Material.ICE.density
  } );

  public static readonly MATERIAL_S = new Material( SOLIDS_TANDEM.createTandem( 'materialS' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.materialSStringProperty,
    hidden: true,
    colorProperty: DensityBuoyancyCommonColors.materialSColorProperty,
    density: Material.LEAD.density
  } );

  public static readonly MATERIAL_V = new Material( SOLIDS_TANDEM.createTandem( 'materialV' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.materialVStringProperty,
    hidden: true,
    colorProperty: DensityBuoyancyCommonColors.materialVColorProperty,
    density: Material.TITANIUM.density
  } );

  public static readonly MATERIAL_W = new Material( SOLIDS_TANDEM.createTandem( 'materialW' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.materialWStringProperty,
    hidden: true,
    colorProperty: DensityBuoyancyCommonColors.materialWColorProperty,
    density: Material.MERCURY.density
  } );

  public static readonly MATERIAL_X = new Material( SOLIDS_TANDEM.createTandem( 'materialX' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.materialXStringProperty,
    hidden: true,
    density: Material.PYRITE.density
  } );

  public static readonly MATERIAL_Y = new Material( SOLIDS_TANDEM.createTandem( 'mysteryY' ), {
    nameProperty: DensityBuoyancyCommonStrings.material.materialYStringProperty,
    hidden: true,
    density: Material.GOLD.density
  } );

  public static readonly DENSITY_MYSTERY_MATERIALS = [
    Material.WOOD,
    Material.GASOLINE,
    Material.APPLE,
    Material.ICE,
    Material.HUMAN,
    Material.WATER,
    Material.GLASS,
    Material.DIAMOND,
    Material.TITANIUM,
    Material.STEEL,
    Material.COPPER,
    Material.LEAD,
    Material.GOLD
  ];

  public static readonly SIMPLE_MASS_MATERIALS = [
    Material.STYROFOAM,
    Material.WOOD,
    Material.ICE,
    Material.PVC,
    Material.BRICK,
    Material.ALUMINUM
  ];

  public static readonly BUOYANCY_FLUID_MATERIALS = [
    Material.GASOLINE,
    Material.OIL,
    Material.WATER,
    Material.SEAWATER,
    Material.HONEY,
    Material.MERCURY
  ];

  public static readonly BUOYANCY_FLUID_MYSTERY_MATERIALS = [
    Material.FLUID_A,
    Material.FLUID_B,
    Material.FLUID_C,
    Material.FLUID_D,
    Material.FLUID_E,
    Material.FLUID_F
  ];
}

export class CustomSolidMaterial extends Material {
  public constructor( tandem: Tandem, providedOptions: MaterialOptions ) {

    const options = optionize<MaterialOptions, EmptySelfOptions, MaterialOptions>()( {
      nameProperty: DensityBuoyancyCommonStrings.material.customStringProperty,
      custom: true
    }, providedOptions );

    super( tandem, options );

    assert && assert( this.custom, 'SolidMaterial should only be used for custom materials' );

    if ( !this.colorProperty ) {

      // TODO: can we make this field readonly again? https://github.com/phetsims/density-buoyancy-common/issues/268
      this.colorProperty = new DerivedProperty( [ this.densityProperty, this.densityProperty.rangeProperty ], ( density, densityRange ) => {

        // TODO: The dynamic range for the bottle interior solid material flattens out quickly past 4 kg/L, see https://github.com/phetsims/density-buoyancy-common/issues/268

        // Returns a value suitable for use in colors (0-255 value) that should be used as a grayscale value for
        // a material of a given density. The mappíng is inverted, i.e. larger densities yield darker colors.
        const lightness = Utils.roundSymmetric( Material.getNormalizedLightness( density, densityRange ) * 255 );
        return new Color( lightness, lightness, lightness );
      } );
    }

    this.depthLinesColorProperty = new DerivedProperty( [
      this.colorProperty,
      DensityBuoyancyCommonColors.depthLinesLightColorProperty,
      DensityBuoyancyCommonColors.depthLinesDarkColorProperty
    ], ( color, depthLinesLightColor, depthLinesDarkColor ) => {

      // The lighter depth line color has better contrast, so use that for more than half
      const isDark = ( color.r + color.g + color.b ) / 3 < 255 * 0.6;
      return isDark ? depthLinesLightColor : depthLinesDarkColor;
    } );
  }
}

export class CustomLiquidMaterial extends Material {
  public constructor( tandem: Tandem, providedOptions: MaterialOptions ) {

    const options = optionize<MaterialOptions, EmptySelfOptions, MaterialOptions>()( {
      nameProperty: DensityBuoyancyCommonStrings.material.customStringProperty,
      custom: true
    }, providedOptions );

    super( tandem, options );
    // TODO: This could be custom color given a "liquid" flag/subtype, https://github.com/phetsims/density-buoyancy-common/issues/268
    if ( !this.colorProperty && this.custom ) {
      // TODO: can we make this field readonly again? https://github.com/phetsims/density-buoyancy-common/issues/268
      this.colorProperty = new DerivedProperty( [ this.densityProperty, this.densityProperty.rangeProperty ], ( density, densityRange ) => {
        return Material.getCustomLiquidColor( density, densityRange );
      } );
    }
  }
}

densityBuoyancyCommon.register( 'Material', Material );