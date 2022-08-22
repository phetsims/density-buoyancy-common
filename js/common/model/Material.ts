// Copyright 2022, University of Colorado Boulder

/**
 * Represents different materials that solids/liquids in the simulations can take, including density/viscosity/color.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Color, ColorProperty, ColorState } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO, { NumberStateObject } from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO, { ReferenceIOState } from '../../../../tandem/js/types/ReferenceIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColors from '../view/DensityBuoyancyCommonColors.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';

export type MaterialOptions = {
  name?: TReadOnlyProperty<string>;

  // If set, this material will be available at Material[ identifier ] as a global
  identifier?: string | null;

  // Used for tandems
  tandemName?: string | null;

  // in SI (kg/m^3)
  density?: number;

  // in SI (Pa * s). For reference a poise is 1e-2 Pa*s, and a centipoise is 1e-3 Pa*s.
  viscosity?: number;

  custom?: boolean;

  // If true, don't show the density in number pickers/readouts
  hidden?: boolean;

  // Uses the color for a solid material's color
  customColor?: Property<Color> | null;

  // Uses the alpha channel for opacity
  liquidColor?: Property<Color> | null;
};

export default class Material {

  public readonly name: TReadOnlyProperty<string>;
  public readonly identifier: string | null;
  public readonly tandemName: string | null;
  public readonly density: number;
  public readonly viscosity: number;
  public readonly custom: boolean;
  public readonly hidden: boolean;
  public readonly customColor: Property<Color> | null;
  public readonly liquidColor: Property<Color> | null;

  public constructor( providedConfig: MaterialOptions ) {

    const config = optionize<MaterialOptions, MaterialOptions>()( {
      name: new TinyProperty( 'unknown' ),
      identifier: null,
      tandemName: null,
      density: 1,
      viscosity: 1e-3,
      custom: false,
      hidden: false,
      customColor: null,
      liquidColor: null
    }, providedConfig );

    assert && assert( isFinite( config.density ) );

    this.name = config.name;
    this.identifier = config.identifier;
    this.tandemName = config.tandemName;
    this.density = config.density;
    this.viscosity = config.viscosity;
    this.custom = config.custom;
    this.hidden = config.hidden;
    this.customColor = config.customColor;
    this.liquidColor = config.liquidColor;
  }

  /**
   * Returns a custom material that can be modified at will.
   */
  public static createCustomMaterial( config: MaterialOptions ): Material {
    return new Material( combineOptions<MaterialOptions>( {
      name: densityBuoyancyCommonStrings.material.customProperty,
      tandemName: 'custom',
      custom: true
    }, config ) );
  }

  /**
   * Returns a custom material that can be modified at will, but with a liquid color specified.
   */
  public static createCustomLiquidMaterial( config: MaterialOptions & Required<Pick<MaterialOptions, 'density'>> ): Material {
    return Material.createCustomMaterial( combineOptions<MaterialOptions>( {
      liquidColor: Material.getCustomLiquidColor( config.density )
    }, config ) );
  }

  /**
   * Returns a custom material that can be modified at will, but with a solid color specified
   */
  public static createCustomSolidMaterial( config: MaterialOptions & Required<Pick<MaterialOptions, 'density'>> ): Material {
    return Material.createCustomMaterial( combineOptions<MaterialOptions>( {
      liquidColor: Material.getCustomSolidColor( config.density )
    }, config ) );
  }

  /**
   * Returns a value suitable for use in colors (0-255 value) that should be used as a grayscale value for
   * a material of a given density.
   */
  public static getCustomLightness( density: number ): number {
    return Utils.roundSymmetric( Utils.clamp( Utils.linear( 1, -2, 0, 255, Utils.log10( density / 1000 ) ), 0, 255 ) );
  }

  /**
   * Similar to getCustomLightness, but returns the generated color, with an included alpha effect.
   */
  public static getCustomLiquidColor( density: number ): ColorProperty {
    const lightness = Material.getCustomLightness( density * 0.25 );

    return new ColorProperty( new Color( lightness, lightness, lightness, 0.8 * ( 1 - lightness / 255 ) ) );
  }

  /**
   * Similar to getCustomLightness, but returns the generated color
   */
  public static getCustomSolidColor( density: number ): ColorProperty {
    const lightness = Material.getCustomLightness( density );

    return new ColorProperty( new Color( lightness, lightness, lightness ) );
  }

  /**
   * Keep a material's color and opacity to match the liquid color from a given Property<Material>
   *
   * NOTE: Only call this for things that exist for the lifetime of this simulation (otherwise it would leak memory)
   */
  public static linkLiquidColor( property: TProperty<Material>, threeMaterial: THREE.MeshPhongMaterial | THREE.MeshLambertMaterial | THREE.MeshBasicMaterial ): void {
    new DynamicProperty<Color, Color, Material>( property, {
      derive: material => {
        assert && assert( material.liquidColor );

        return material.liquidColor!;
      }
    } ).link( ( color: Color ) => {
      threeMaterial.color = ThreeUtils.colorToThree( color );
      threeMaterial.opacity = color.alpha;
    } );
  }

  // (read-only) {Material} - "Solids"

  public static ALUMINUM = new Material( {
    name: densityBuoyancyCommonStrings.material.aluminumProperty,
    tandemName: 'aluminum',
    identifier: 'ALUMINUM',
    density: 2700
  } );

  public static APPLE = new Material( {
    name: densityBuoyancyCommonStrings.material.appleProperty,
    tandemName: 'apple',
    identifier: 'APPLE',
    // "Some Physical Properties of Apple" - Averaged the two cultivars' densities for this
    // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.548.1131&rep=rep1&type=pdf
    density: 832
  } );

  public static BRICK = new Material( {
    name: densityBuoyancyCommonStrings.material.brickProperty,
    tandemName: 'brick',
    identifier: 'BRICK',
    density: 2000
  } );

  public static CEMENT = new Material( {
    name: densityBuoyancyCommonStrings.material.cementProperty,
    tandemName: 'cement',
    identifier: 'CEMENT',
    density: 3150,
    liquidColor: DensityBuoyancyCommonColors.materialCementColorProperty
  } );

  public static COPPER = new Material( {
    name: densityBuoyancyCommonStrings.material.copperProperty,
    tandemName: 'copper',
    identifier: 'COPPER',
    density: 8960,
    liquidColor: DensityBuoyancyCommonColors.materialCopperColorProperty
  } );

  public static DIAMOND = new Material( {
    name: densityBuoyancyCommonStrings.material.diamondProperty,
    tandemName: 'diamond',
    identifier: 'DIAMOND',
    density: 3510
  } );

  public static GLASS = new Material( {
    name: densityBuoyancyCommonStrings.material.glassProperty,
    tandemName: 'glass',
    identifier: 'GLASS',
    density: 2700
  } );

  public static GOLD = new Material( {
    name: densityBuoyancyCommonStrings.material.goldProperty,
    tandemName: 'gold',
    identifier: 'GOLD',
    density: 19320
  } );

  public static HUMAN = new Material( {
    name: densityBuoyancyCommonStrings.material.humanProperty,
    tandemName: 'human',
    identifier: 'HUMAN',
    density: 950
  } );

  public static ICE = new Material( {
    name: densityBuoyancyCommonStrings.material.iceProperty,
    tandemName: 'ice',
    identifier: 'ICE',
    density: 919
  } );

  public static LEAD = new Material( {
    name: densityBuoyancyCommonStrings.material.leadProperty,
    tandemName: 'lead',
    identifier: 'LEAD',
    density: 11342,
    liquidColor: DensityBuoyancyCommonColors.materialLeadColorProperty
  } );

  public static PLATINUM = new Material( {
    name: densityBuoyancyCommonStrings.material.platinumProperty,
    tandemName: 'platinum',
    identifier: 'PLATINUM',
    density: 21450
  } );

  public static PYRITE = new Material( {
    name: densityBuoyancyCommonStrings.material.pyriteProperty,
    tandemName: 'pyrite',
    identifier: 'PYRITE',
    density: 5010
  } );

  public static SILVER = new Material( {
    name: densityBuoyancyCommonStrings.material.silverProperty,
    tandemName: 'silver',
    identifier: 'SILVER',
    density: 10490
  } );

  public static STEEL = new Material( {
    name: densityBuoyancyCommonStrings.material.steelProperty,
    tandemName: 'steel',
    identifier: 'STEEL',
    density: 7800
  } );

  public static STYROFOAM = new Material( {
    name: densityBuoyancyCommonStrings.material.styrofoamProperty,
    tandemName: 'styrofoam',
    identifier: 'STYROFOAM',
    // From Flash version: between 25 and 200 according to http://wiki.answers.com/Q/What_is_the_density_of_styrofoam;
    // chose 150 so it isn't too low to show on slider, but not 200 so it's not half of wood
    density: 150
  } );

  public static TANTALUM = new Material( {
    name: densityBuoyancyCommonStrings.material.tantalumProperty,
    tandemName: 'tantalum',
    identifier: 'TANTALUM',
    density: 16650
  } );

  public static TITANIUM = new Material( {
    name: densityBuoyancyCommonStrings.material.titaniumProperty,
    tandemName: 'titanium',
    identifier: 'TITANIUM',
    density: 4500
  } );

  public static WOOD = new Material( {
    name: densityBuoyancyCommonStrings.material.woodProperty,
    tandemName: 'wood',
    identifier: 'WOOD',
    density: 400
  } );

  // (read-only) {Material} - "Liquids".

  public static AIR = new Material( {
    name: densityBuoyancyCommonStrings.material.airProperty,
    tandemName: 'air',
    identifier: 'AIR',
    density: 1.2,
    viscosity: 0,
    liquidColor: DensityBuoyancyCommonColors.materialAirColorProperty
  } );

  public static DENSITY_A = new Material( {
    name: densityBuoyancyCommonStrings.material.densityAProperty,
    tandemName: 'densityA',
    identifier: 'DENSITY_A',
    density: 3100,
    liquidColor: DensityBuoyancyCommonColors.materialDensityAColorProperty,
    hidden: true
  } );

  public static DENSITY_B = new Material( {
    name: densityBuoyancyCommonStrings.material.densityBProperty,
    tandemName: 'densityB',
    identifier: 'DENSITY_B',
    density: 790,
    liquidColor: DensityBuoyancyCommonColors.materialDensityBColorProperty,
    hidden: true
  } );

  public static DENSITY_C = new Material( {
    name: densityBuoyancyCommonStrings.material.densityCProperty,
    tandemName: 'densityC',
    identifier: 'DENSITY_C',
    density: 490,
    liquidColor: DensityBuoyancyCommonColors.materialDensityCColorProperty,
    hidden: true
  } );

  public static DENSITY_D = new Material( {
    name: densityBuoyancyCommonStrings.material.densityDProperty,
    tandemName: 'densityD',
    identifier: 'DENSITY_D',
    density: 2890,
    liquidColor: DensityBuoyancyCommonColors.materialDensityDColorProperty,
    hidden: true
  } );

  public static DENSITY_E = new Material( {
    name: densityBuoyancyCommonStrings.material.densityEProperty,
    tandemName: 'densityE',
    identifier: 'DENSITY_E',
    density: 1260,
    liquidColor: DensityBuoyancyCommonColors.materialDensityEColorProperty,
    hidden: true
  } );

  public static DENSITY_F = new Material( {
    name: densityBuoyancyCommonStrings.material.densityFProperty,
    tandemName: 'densityF',
    identifier: 'DENSITY_F',
    density: 6440,
    liquidColor: DensityBuoyancyCommonColors.materialDensityFColorProperty,
    hidden: true
  } );

  public static GASOLINE = new Material( {
    name: densityBuoyancyCommonStrings.material.gasolineProperty,
    tandemName: 'gasoline',
    identifier: 'GASOLINE',
    density: 680,
    viscosity: 6e-4,
    liquidColor: DensityBuoyancyCommonColors.materialGasolineColorProperty
  } );

  public static HONEY = new Material( {
    name: densityBuoyancyCommonStrings.material.honeyProperty,
    tandemName: 'honey',
    identifier: 'HONEY',
    density: 1440,
    viscosity: 0.03, // NOTE: actual value around 2.5, but we can get away with this for animation
    liquidColor: DensityBuoyancyCommonColors.materialHoneyColorProperty
  } );

  public static MERCURY = new Material( {
    name: densityBuoyancyCommonStrings.material.mercuryProperty,
    tandemName: 'mercury',
    identifier: 'MERCURY',
    density: 13593,
    viscosity: 1.53e-3,
    liquidColor: DensityBuoyancyCommonColors.materialMercuryColorProperty
  } );

  public static OIL = new Material( {
    name: densityBuoyancyCommonStrings.material.oilProperty,
    tandemName: 'oil',
    identifier: 'OIL',
    density: 920,
    viscosity: 0.02, // Too much bigger and it won't work, not particularly physical
    liquidColor: DensityBuoyancyCommonColors.materialOilColorProperty
  } );

  public static SAND = new Material( {
    name: densityBuoyancyCommonStrings.material.sandProperty,
    tandemName: 'sand',
    identifier: 'SAND',
    density: 1442,
    viscosity: 0.03, // Too much bigger and it won't work, not particularly physical
    liquidColor: DensityBuoyancyCommonColors.materialSandColorProperty
  } );

  public static SEAWATER = new Material( {
    name: densityBuoyancyCommonStrings.material.seawaterProperty,
    tandemName: 'seawater',
    identifier: 'SEAWATER',
    density: 1029,
    viscosity: 1.88e-3,
    liquidColor: DensityBuoyancyCommonColors.materialSeawaterColorProperty
  } );

  public static WATER = new Material( {
    name: densityBuoyancyCommonStrings.material.waterProperty,
    tandemName: 'water',
    identifier: 'WATER',
    density: 1000,
    viscosity: 8.9e-4,
    liquidColor: DensityBuoyancyCommonColors.materialWaterColorProperty
  } );

  public static MATERIALS: Material[];
  public static MaterialIO: IOType;
}

Material.MATERIALS = [
  Material.AIR,
  Material.ALUMINUM,
  Material.APPLE,
  Material.BRICK,
  Material.CEMENT,
  Material.COPPER,
  Material.DENSITY_E,
  Material.DENSITY_F,
  Material.DENSITY_A,
  Material.DENSITY_B,
  Material.DIAMOND,
  Material.GASOLINE,
  Material.GLASS,
  Material.GOLD,
  Material.HONEY,
  Material.HUMAN,
  Material.ICE,
  Material.LEAD,
  Material.MERCURY,
  Material.OIL,
  Material.PLATINUM,
  Material.PYRITE,
  Material.SAND,
  Material.SEAWATER,
  Material.SILVER,
  Material.STEEL,
  Material.STYROFOAM,
  Material.TANTALUM,
  Material.TITANIUM,
  Material.WATER,
  Material.WOOD
];

const NullableColorPropertyReferenceType = NullableIO( ReferenceIO( Property.PropertyIO( Color.ColorIO ) ) );

type MaterialState = {
  identifier: null | string;
  name: ReferenceIOState;
  tandemName: string | null;
  density: NumberStateObject;
  viscosity: NumberStateObject;
  custom: boolean;
  hidden: boolean;
  staticCustomColor: null | ColorState;
  customColor: null | ColorState;
  staticLiquidColor: null | ColorState;
  liquidColor: null | ColorState;
};

// (read-only) {IOType}
Material.MaterialIO = new IOType<Material, MaterialState>( 'MaterialIO', {
  valueType: Material,
  documentation: 'Represents different materials that solids/liquids in the simulations can take, including density (kg/m^3), viscosity (Pa * s), and color.',
  stateSchema: {
    name: ReferenceIO( ReadOnlyProperty.PropertyIO( StringIO ) ),
    identifier: NullableIO( StringIO ),
    tandemName: NullableIO( StringIO ),
    density: NumberIO,
    viscosity: NumberIO,
    custom: BooleanIO,
    hidden: BooleanIO,
    staticCustomColor: NullableIO( Color.ColorIO ),
    customColor: NullableColorPropertyReferenceType,
    staticLiquidColor: NullableIO( Color.ColorIO ),
    liquidColor: NullableColorPropertyReferenceType
  },
  toStateObject( material: Material ): MaterialState {

    const isCustomColorUninstrumented = material.customColor && !material.customColor.isPhetioInstrumented();
    const isLiquidColorUninstrumented = material.liquidColor && !material.liquidColor.isPhetioInstrumented();

    return {
      name: ReferenceIO( ReadOnlyProperty.PropertyIO( StringIO ) ).toStateObject( material.name ),
      identifier: NullableIO( StringIO ).toStateObject( material.identifier ),
      tandemName: NullableIO( StringIO ).toStateObject( material.tandemName ),
      density: NumberIO.toStateObject( material.density ),
      viscosity: NumberIO.toStateObject( material.viscosity ),
      custom: BooleanIO.toStateObject( material.custom ),
      hidden: BooleanIO.toStateObject( material.hidden ),
      staticCustomColor: NullableIO( Color.ColorIO ).toStateObject( isCustomColorUninstrumented ? material.customColor.value : null ),
      customColor: NullableColorPropertyReferenceType.toStateObject( isCustomColorUninstrumented ? null : material.customColor ),
      staticLiquidColor: NullableIO( Color.ColorIO ).toStateObject( isLiquidColorUninstrumented ? material.liquidColor.value : null ),
      liquidColor: NullableColorPropertyReferenceType.toStateObject( isLiquidColorUninstrumented ? null : material.liquidColor )
    };
  },
  fromStateObject( obj: MaterialState ): Material {
    if ( obj.identifier ) {
      const material = Material[ obj.identifier as keyof typeof Material ];
      assert && assert( material, `Unknown material: ${obj.identifier}` );
      return material as Material;
    }
    else {
      const staticCustomColor = NullableIO( Color.ColorIO ).fromStateObject( obj.staticCustomColor );
      const staticLiquidColor = NullableIO( Color.ColorIO ).fromStateObject( obj.staticLiquidColor );
      return new Material( {
        name: ReferenceIO( ReadOnlyProperty.PropertyIO( StringIO ) ).fromStateObject( obj.name ),
        identifier: NullableIO( StringIO ).fromStateObject( obj.identifier ),
        tandemName: NullableIO( StringIO ).fromStateObject( obj.tandemName ),
        density: NumberIO.fromStateObject( obj.density ),
        viscosity: NumberIO.fromStateObject( obj.viscosity ),
        custom: BooleanIO.fromStateObject( obj.custom ),
        hidden: BooleanIO.fromStateObject( obj.hidden ),
        customColor: staticCustomColor ? new ColorProperty( staticCustomColor ) : NullableColorPropertyReferenceType.fromStateObject( obj.customColor ),
        liquidColor: staticLiquidColor ? new ColorProperty( staticLiquidColor ) : NullableColorPropertyReferenceType.fromStateObject( obj.liquidColor )
      } );
    }
  }
} );

densityBuoyancyCommon.register( 'Material', Material );
