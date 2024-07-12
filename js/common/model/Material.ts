// Copyright 2022-2024, University of Colorado Boulder

/**
 * Represents different materials that solids/liquids in the simulations can take, including density/viscosity/color.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Property from '../../../../axon/js/Property.js';
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
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';

// TODO: get rid of this whole thing and MaterialName?, https://github.com/phetsims/density-buoyancy-common/issues/256
const nonCustomMaterialNames = [
  'ALUMINUM',
  'APPLE',
  'BOAT_BODY',
  'BRICK',
  'CONCRETE',
  'COPPER',
  'DIAMOND',
  'GLASS',
  'GOLD',
  'HUMAN',
  'ICE',
  'LEAD',
  'PLATINUM',
  'PVC',
  'PYRITE',
  'SILVER',
  'STEEL',
  'STYROFOAM',
  'TANTALUM',
  'TITANIUM',
  'WOOD',
  'AIR',
  'FLUID_A',
  'FLUID_B',
  'FLUID_C',
  'FLUID_D',
  'FLUID_E',
  'FLUID_F',
  'GASOLINE',
  'HONEY',
  'MERCURY',
  'OIL',
  'SAND',
  'SEAWATER',
  'WATER',
  'MATERIAL_O',
  'MATERIAL_P',
  'MATERIAL_R',
  'MATERIAL_S',
  'MATERIAL_V',
  'MATERIAL_W',
  'MATERIAL_X',
  'MATERIAL_Y' ] as const;

// TODO: phetioIDs for custom materials?  https://github.com/phetsims/density-buoyancy-common/issues/256
let customTandemIndex = 0;

type NonCustomMaterialName = typeof nonCustomMaterialNames[ number ];
export type MaterialName = NonCustomMaterialName | 'CUSTOM';

export type MaterialOptions = {
  nameProperty?: TReadOnlyProperty<string>;

  // If set, this material will be available at Material[ identifier ] as a global
  identifier: MaterialName;

  // Used for tandems
  tandemName: string;

  // in SI (kg/m^3)
  density?: number;

  // What potential densities can this Material accept? (mostly applies to custom materials)
  densityRange?: Range;

  // in SI (Pa * s). For reference a poise is 1e-2 Pa*s, and a centipoise is 1e-3 Pa*s.
  viscosity?: number;

  // TODO: Eliminate, see https://github.com/phetsims/density-buoyancy-common/issues/176
  custom?: boolean;

  // If true, don't show the density in number pickers/readouts, often called a "mystery" material elsewhere in the code.
  hidden?: boolean;

  // TODO: Can we combine custom/liquid colors? https://github.com/phetsims/density-buoyancy-common/issues/256
  // Uses the color for a solid material's color
  colorProperty?: ReadOnlyProperty<Color> | null;

  // Used for the color of depth lines added on top of the Material
  depthLinesColorProperty?: TReadOnlyProperty<Color>;
};
type NoIdentifierMaterialOptions = StrictOmit<MaterialOptions, 'identifier' | 'tandemName'>;

// TODO: Material should wire up color properties https://github.com/phetsims/density-buoyancy-common/issues/256
// TODO: Material only needs one freaking color Property, https://github.com/phetsims/density-buoyancy-common/issues/256
// TODO: Material should know its density range https://github.com/phetsims/density-buoyancy-common/issues/256
// TODO: Instrument Materials globally (and locally for custom), and their densityProperty too. https://github.com/phetsims/density-buoyancy-common/issues/256
export default class Material extends PhetioObject {

  public readonly nameProperty: TReadOnlyProperty<string>;
  public readonly identifier: MaterialName;
  public readonly tandemName: string | null;
  public readonly viscosity: number;

  // TODO: Eliminate custom as an orthogonal attribute, it can be determined from identifier. https://github.com/phetsims/density-buoyancy-common/issues/256
  public readonly custom: boolean;
  public readonly hidden: boolean;
  public colorProperty: ReadOnlyProperty<Color> | null;
  public depthLinesColorProperty: TReadOnlyProperty<Color>;
  public readonly densityProperty: NumberProperty;

  public constructor( providedOptions: MaterialOptions ) {

    const options = optionize<MaterialOptions, MaterialOptions>()( {
      nameProperty: new TinyProperty( 'unknown' ),
      density: 1,
      densityRange: new Range( 0.8, 23000 ),
      viscosity: 1e-3,
      custom: false,
      hidden: false,
      colorProperty: null,
      depthLinesColorProperty: DensityBuoyancyCommonColors.depthLinesDarkColorProperty
    }, providedOptions );

    assert && assert( isFinite( options.density ), 'density should be finite, but it was: ' + options.density );

    // TODO: better options pattern https://github.com/phetsims/density-buoyancy-common/issues/256
    super( {
      tandem: Tandem.GLOBAL_MODEL.createTandem( 'materials' ).createTandem( options.tandemName ),
      phetioState: false
    } );

    this.nameProperty = options.nameProperty;
    this.identifier = options.identifier;
    this.tandemName = options.tandemName;
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

    // TODO: make this happen less https://github.com/phetsims/density-buoyancy-common/issues/256
    console.log( 'hello new material' );
  }

  // TODO: do we need this pointer? https://github.com/phetsims/density-buoyancy-common/issues/256
  public get density(): number {
    return this.densityProperty.value;
  }

  /**
   * Returns a custom material that can be modified at will.
   */
  public static createCustomMaterial( options: NoIdentifierMaterialOptions ): Material {
    return new Material( combineOptions<MaterialOptions>( {
      nameProperty: DensityBuoyancyCommonStrings.material.customStringProperty,
      tandemName: `custom${++customTandemIndex}`,
      identifier: 'CUSTOM',
      custom: true
    }, options ) );
  }

  /**
   * Returns a custom material that can be modified at will, but with a liquid color specified.
   *
   * TODO: Delete once we better understand custom vs liquid colors, https://github.com/phetsims/density-buoyancy-common/issues/256
   */
  public static createCustomLiquidMaterial( options: NoIdentifierMaterialOptions ): Material {
    return new LiquidMaterial( combineOptions<MaterialOptions>( {
      nameProperty: DensityBuoyancyCommonStrings.material.customStringProperty,
      tandemName: `custom${++customTandemIndex}`,
      identifier: 'CUSTOM',
      custom: true
    }, options ) );
  }

  /**
   * Returns a custom material that can be modified at will, but with a solid color specified
   */
  public static createCustomSolidMaterial( options: NoIdentifierMaterialOptions ): Material {
    return new SolidMaterial( combineOptions<MaterialOptions>( {
      nameProperty: DensityBuoyancyCommonStrings.material.customStringProperty,
      tandemName: `custom${++customTandemIndex}`,
      identifier: 'CUSTOM',
      custom: true
    }, options ) );
  }

  /**
   * Returns a value suitable for use in colors (0-255 value) that should be used as a grayscale value for
   * a material of a given density. The mappíng is inverted, i.e. larger densities yield darker colors.
   */
  protected static getCustomLightness( density: number, densityRange: Range ): number {
    return Utils.roundSymmetric( this.getNormalizedLightness( density, densityRange ) * 255 );
  }

  /**
   * Returns a lightness factor from 0-1 that can be used to map a density to a desired color.
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
   * TODO: a couple thoughts. https://github.com/phetsims/density-buoyancy-common/issues/256
   *       1. could this be solved is MaterialProperty.colorProperty was a dynamic property, then these usages would just link to that to update the THREE mesh.
   *       2. At the very leas, move this to a prototype method on MaterialProperty.
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

  public static readonly ALUMINUM = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.aluminumStringProperty,
    tandemName: 'aluminum',
    identifier: 'ALUMINUM',
    density: 2700
  } );

  public static readonly APPLE = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.appleStringProperty,
    tandemName: 'apple',
    identifier: 'APPLE',
    // "Some Physical Properties of Apple" - Averaged the two cultivars' densities for this
    // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.548.1131&rep=rep1&type=pdf
    density: 832
  } );

  // In essence identical to aluminum, but with a different name for the Density readout
  public static readonly BOAT_BODY = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.boatHullStringProperty,
    tandemName: 'boatHull',
    identifier: 'BOAT_BODY',
    density: Material.ALUMINUM.density
  } );

  public static readonly BRICK = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.brickStringProperty,
    tandemName: 'brick',
    identifier: 'BRICK',
    density: 2000,
    depthLinesColorProperty: DensityBuoyancyCommonColors.depthLinesLightColorProperty
  } );

  public static readonly CONCRETE = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.concreteStringProperty,
    tandemName: 'concrete',
    identifier: 'CONCRETE',
    density: 3150,
    colorProperty: DensityBuoyancyCommonColors.materialConcreteColorProperty
  } );

  public static readonly COPPER = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.copperStringProperty,
    tandemName: 'copper',
    identifier: 'COPPER',
    density: 8960,
    colorProperty: DensityBuoyancyCommonColors.materialCopperColorProperty
  } );

  public static readonly DIAMOND = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.diamondStringProperty,
    tandemName: 'diamond',
    identifier: 'DIAMOND',
    density: 3510
  } );

  public static readonly GLASS = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.glassStringProperty,
    tandemName: 'glass',
    identifier: 'GLASS',
    density: 2700
  } );

  public static readonly GOLD = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.goldStringProperty,
    tandemName: 'gold',
    identifier: 'GOLD',
    density: 19320
  } );

  public static readonly HUMAN = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.humanStringProperty,
    tandemName: 'human',
    identifier: 'HUMAN',
    density: 950
  } );

  public static readonly ICE = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.iceStringProperty,
    tandemName: 'ice',
    identifier: 'ICE',
    density: 919
  } );

  public static readonly LEAD = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.leadStringProperty,
    tandemName: 'lead',
    identifier: 'LEAD',
    density: 11342,
    colorProperty: DensityBuoyancyCommonColors.materialLeadColorProperty
  } );

  public static readonly PLATINUM = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.platinumStringProperty,
    tandemName: 'platinum',
    identifier: 'PLATINUM',
    density: 21450
  } );

  public static readonly PVC = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.pvcStringProperty,
    tandemName: 'pvc',
    identifier: 'PVC',
    density: 1440
  } );

  public static readonly PYRITE = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.pyriteStringProperty,
    tandemName: 'pyrite',
    identifier: 'PYRITE',
    density: 5010
  } );

  public static readonly SILVER = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.silverStringProperty,
    tandemName: 'silver',
    identifier: 'SILVER',
    density: 10490
  } );

  public static readonly STEEL = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.steelStringProperty,
    tandemName: 'steel',
    identifier: 'STEEL',
    density: 7800
  } );

  public static readonly STYROFOAM = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.styrofoamStringProperty,
    tandemName: 'styrofoam',
    identifier: 'STYROFOAM',
    // From Flash version: between 25 and 200 according to http://wiki.answers.com/Q/What_is_the_density_of_styrofoam;
    // chose 150, so it isn't too low to show on slider, but not 200, so it's not half of wood
    density: 150
  } );

  public static readonly TANTALUM = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.tantalumStringProperty,
    tandemName: 'tantalum',
    identifier: 'TANTALUM',
    density: 16650
  } );

  public static readonly TITANIUM = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.titaniumStringProperty,
    tandemName: 'titanium',
    identifier: 'TITANIUM',
    density: 4500
  } );

  public static readonly WOOD = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.woodStringProperty,
    tandemName: 'wood',
    identifier: 'WOOD',
    density: 400,
    depthLinesColorProperty: DensityBuoyancyCommonColors.depthLinesLightColorProperty
  } );

  ////////////////// LIQUIDS //////////////////

  public static readonly AIR = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.airStringProperty,
    tandemName: 'air',
    identifier: 'AIR',
    density: 1.2,
    viscosity: 0,
    colorProperty: DensityBuoyancyCommonColors.materialAirColorProperty
  } );

  public static readonly FLUID_A = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidAStringProperty,
    tandemName: 'fluidA',
    identifier: 'FLUID_A',
    density: 3100,
    colorProperty: DensityBuoyancyCommonColors.materialDensityAColorProperty,
    hidden: true
  } );

  public static readonly FLUID_B = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidBStringProperty,
    tandemName: 'fluidB',
    identifier: 'FLUID_B',
    density: 790,
    colorProperty: DensityBuoyancyCommonColors.materialDensityBColorProperty,
    hidden: true
  } );

  public static readonly FLUID_C = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidCStringProperty,
    tandemName: 'fluidC',
    identifier: 'FLUID_C',
    density: 490,
    colorProperty: DensityBuoyancyCommonColors.materialDensityCColorProperty,
    hidden: true
  } );

  public static readonly FLUID_D = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidDStringProperty,
    tandemName: 'fluidD',
    identifier: 'FLUID_D',
    density: 2890,
    colorProperty: DensityBuoyancyCommonColors.materialDensityDColorProperty,
    hidden: true
  } );

  public static readonly FLUID_E = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidEStringProperty,
    tandemName: 'fluidE',
    identifier: 'FLUID_E',
    density: 1260,
    colorProperty: DensityBuoyancyCommonColors.materialDensityEColorProperty,
    hidden: true
  } );

  public static readonly FLUID_F = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.fluidFStringProperty,
    tandemName: 'fluidF',
    identifier: 'FLUID_F',
    density: 6440,
    colorProperty: DensityBuoyancyCommonColors.materialDensityFColorProperty,
    hidden: true
  } );

  public static readonly GASOLINE = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.gasolineStringProperty,
    tandemName: 'gasoline',
    identifier: 'GASOLINE',
    density: 680,
    viscosity: 6e-4,
    colorProperty: DensityBuoyancyCommonColors.materialGasolineColorProperty
  } );

  public static readonly HONEY = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.honeyStringProperty,
    tandemName: 'honey',
    identifier: 'HONEY',
    density: 1440,
    viscosity: 0.03, // NOTE: actual value around 2.5, but we can get away with this for animation
    colorProperty: DensityBuoyancyCommonColors.materialHoneyColorProperty
  } );

  public static readonly MERCURY = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.mercuryStringProperty,
    tandemName: 'mercury',
    identifier: 'MERCURY',
    density: 13593,
    viscosity: 1.53e-3,
    colorProperty: DensityBuoyancyCommonColors.materialMercuryColorProperty
  } );

  public static readonly OIL = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.oilStringProperty,
    tandemName: 'oil',
    identifier: 'OIL',
    density: 920,
    viscosity: 0.02, // Too much bigger and it won't work, not particularly physical
    colorProperty: DensityBuoyancyCommonColors.materialOilColorProperty
  } );

  public static readonly SAND = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.sandStringProperty,
    tandemName: 'sand',
    identifier: 'SAND',
    density: 1442,
    viscosity: 0.03, // Too much bigger and it won't work, not particularly physical
    colorProperty: DensityBuoyancyCommonColors.materialSandColorProperty
  } );

  public static readonly SEAWATER = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.seawaterStringProperty,
    tandemName: 'seawater',
    identifier: 'SEAWATER',
    density: 1029,
    viscosity: 1.88e-3,
    colorProperty: DensityBuoyancyCommonColors.materialSeawaterColorProperty
  } );

  public static readonly WATER = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.waterStringProperty,
    tandemName: 'water',
    identifier: 'WATER',
    density: 1000,
    viscosity: 8.9e-4,
    colorProperty: DensityBuoyancyCommonColors.materialWaterColorProperty
  } );

  ////////////////// MYSTERY MATERIALS //////////////////

  public static readonly MATERIAL_O = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.materialOStringProperty,
    tandemName: 'materialO',
    identifier: 'MATERIAL_O',
    hidden: true,
    colorProperty: new Property( new Color( '#f00' ) ),
    density: 950 // Same as the Human's average density
  } );

  public static readonly MATERIAL_P = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.materialPStringProperty,
    tandemName: 'materialP',
    identifier: 'MATERIAL_P',
    hidden: true,
    colorProperty: new Property( new Color( '#0f0' ) ),
    density: Material.DIAMOND.density
  } );

  public static readonly MATERIAL_R = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.materialRStringProperty,
    tandemName: 'materialR',
    identifier: 'MATERIAL_R',
    hidden: true,
    colorProperty: DensityBuoyancyCommonColors.materialRColorProperty,
    density: Material.ICE.density
  } );

  public static readonly MATERIAL_S = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.materialSStringProperty,
    tandemName: 'materialS',
    identifier: 'MATERIAL_S',
    hidden: true,
    colorProperty: DensityBuoyancyCommonColors.materialSColorProperty,
    density: Material.LEAD.density
  } );

  public static readonly MATERIAL_V = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.materialVStringProperty,
    tandemName: 'materialV',
    identifier: 'MATERIAL_V',
    hidden: true,
    colorProperty: new Property( new Color( '#ff0' ) ),
    density: Material.TITANIUM.density
  } );

  public static readonly MATERIAL_W = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.materialWStringProperty,
    tandemName: 'materialW',
    identifier: 'MATERIAL_W',
    hidden: true,
    colorProperty: new Property( new Color( '#0af' ) ),
    density: Material.MERCURY.density
  } );

  public static readonly MATERIAL_X = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.materialXStringProperty,
    tandemName: 'materialX',
    identifier: 'MATERIAL_X',
    hidden: true,
    density: Material.PYRITE.density
  } );

  public static readonly MATERIAL_Y = new Material( {
    nameProperty: DensityBuoyancyCommonStrings.material.materialYStringProperty,
    tandemName: 'mysteryY',
    identifier: 'MATERIAL_Y',
    hidden: true,
    density: Material.GOLD.density
  } );

  // TODO: Convert to an object literal like{AIR: new Material( ... ), ...} as const
  // TODO: Then we can lift the keys for a string union of "NonCustomMaterialName". https://github.com/phetsims/density-buoyancy-common/issues/176
  public static readonly MATERIALS = [
    Material.ALUMINUM,
    Material.APPLE,
    Material.BOAT_BODY,
    Material.BRICK,
    Material.CONCRETE,
    Material.COPPER,
    Material.DIAMOND,
    Material.GLASS,
    Material.GOLD,
    Material.HUMAN,
    Material.ICE,
    Material.LEAD,
    Material.PLATINUM,
    Material.PVC,
    Material.PYRITE,
    Material.SILVER,
    Material.STEEL,
    Material.STYROFOAM,
    Material.TANTALUM,
    Material.TITANIUM,
    Material.WOOD,
    Material.AIR,
    Material.FLUID_A,
    Material.FLUID_B,
    Material.FLUID_C,
    Material.FLUID_D,
    Material.FLUID_E,
    Material.FLUID_F,
    Material.GASOLINE,
    Material.HONEY,
    Material.MERCURY,
    Material.OIL,
    Material.SAND,
    Material.SEAWATER,
    Material.WATER,
    Material.MATERIAL_O,
    Material.MATERIAL_P,
    Material.MATERIAL_R,
    Material.MATERIAL_S,
    Material.MATERIAL_V,
    Material.MATERIAL_W,
    Material.MATERIAL_X,
    Material.MATERIAL_Y
  ] as const;

  public static getMaterial( materialName: MaterialName ): Material {
    const material = _.find( Material.MATERIALS, material => material.identifier === materialName )!;
    assert && assert( material, `unknown material name: ${materialName}` );
    return material;
  }

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

// TODO: SolidCustomMaterial? https://github.com/phetsims/density-buoyancy-common/issues/256
class SolidMaterial extends Material {
  public constructor( providedOptions: MaterialOptions ) {

    const options = optionize<MaterialOptions, EmptySelfOptions, MaterialOptions>()( {}, providedOptions );

    super( options );

    assert && assert( this.custom, 'SolidMaterial should only be used for custom materials' );

    if ( !this.colorProperty ) {

      // TODO: can we make this field readonly again? https://github.com/phetsims/density-buoyancy-common/issues/256
      this.colorProperty = new DerivedProperty( [ this.densityProperty, this.densityProperty.rangeProperty ], ( density, densityRange ) => {
        const lightness = Material.getCustomLightness( density, densityRange );
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

class LiquidMaterial extends Material {
  public constructor( providedOptions: MaterialOptions ) {

    const options = optionize<MaterialOptions, EmptySelfOptions, MaterialOptions>()( {}, providedOptions );

    super( options );
    // TODO: This could be custom color given a "liquid" flag/subtype, https://github.com/phetsims/density-buoyancy-common/issues/256
    if ( !this.colorProperty && this.custom ) {
      // TODO: can we make this field readonly again? https://github.com/phetsims/density-buoyancy-common/issues/256
      this.colorProperty = new DerivedProperty( [ this.densityProperty, this.densityProperty.rangeProperty ], ( density, densityRange ) => {
        return Material.getCustomLiquidColor( density, densityRange );
      } );
    }
  }
}

assert && assert( _.every( Material.MATERIALS, material => !( material.custom || material.identifier === 'CUSTOM' ) ),
  'custom materials not allowed in MATERIALS list' );
assert && assert( _.uniq( Material.MATERIALS ).length === Material.MATERIALS.length, 'duplicate in Material.MATERIALS' );

densityBuoyancyCommon.register( 'Material', Material );