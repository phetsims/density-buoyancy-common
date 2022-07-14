// Copyright 2022, University of Colorado Boulder

/**
 * Represents different materials that solids/liquids in the simulations can take, including density/viscosity/color.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import IProperty from '../../../../axon/js/IProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Color, ColorProperty, IColor, ColorState } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO, { NumberStateObject } from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColors from '../view/DensityBuoyancyCommonColors.js';

export type MaterialOptions = {
  name?: string;

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

  readonly name: string;
  readonly identifier: string | null;
  readonly tandemName: string | null;
  readonly density: number;
  readonly viscosity: number;
  readonly custom: boolean;
  readonly hidden: boolean;
  readonly customColor: Property<Color> | null;
  readonly liquidColor: Property<Color> | null;

  constructor( providedConfig: MaterialOptions ) {

    const config = optionize<MaterialOptions, MaterialOptions>()( {
      name: 'unknown',
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
  static createCustomMaterial( config: MaterialOptions ): Material {
    return new Material( merge( {
      name: densityBuoyancyCommonStrings.material.custom,
      tandemName: 'custom',
      custom: true
    }, config ) );
  }

  /**
   * Returns a custom material that can be modified at will, but with a liquid color specified.
   */
  static createCustomLiquidMaterial( config: MaterialOptions & Required<Pick<MaterialOptions, 'density'>> ): Material {
    return Material.createCustomMaterial( merge( {
      liquidColor: Material.getCustomLiquidColor( config.density )
    }, config ) );
  }

  /**
   * Returns a custom material that can be modified at will, but with a solid color specified
   */
  static createCustomSolidMaterial( config: MaterialOptions & Required<Pick<MaterialOptions, 'density'>> ): Material {
    return Material.createCustomMaterial( merge( {
      liquidColor: Material.getCustomSolidColor( config.density )
    }, config ) );
  }

  /**
   * Returns a value suitable for use in colors (0-255 value) that should be used as a grayscale value for
   * a material of a given density.
   */
  static getCustomLightness( density: number ): number {
    return Utils.roundSymmetric( Utils.clamp( Utils.linear( 1, -2, 0, 255, Utils.log10( density / 1000 ) ), 0, 255 ) );
  }

  /**
   * Similar to getCustomLightness, but returns the generated color, with an included alpha effect.
   */
  static getCustomLiquidColor( density: number ): IColor {
    const lightness = Material.getCustomLightness( density * 0.25 );

    return new ColorProperty( new Color( lightness, lightness, lightness, 0.8 * ( 1 - lightness / 255 ) ) );
  }

  /**
   * Similar to getCustomLightness, but returns the generated color
   */
  static getCustomSolidColor( density: number ): IColor {
    const lightness = Material.getCustomLightness( density );

    return new ColorProperty( new Color( lightness, lightness, lightness ) );
  }

  /**
   * Keep a material's color and opacity to match the liquid color from a given Property<Material>
   *
   * NOTE: Only call this for things that exist for the lifetime of this simulation (otherwise it would leak memory)
   */
  static linkLiquidColor( property: IProperty<Material>, threeMaterial: THREE.MeshPhongMaterial | THREE.MeshLambertMaterial | THREE.MeshBasicMaterial ): void {
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

  static ALUMINUM = new Material( {
    name: densityBuoyancyCommonStrings.material.aluminum,
    tandemName: 'aluminum',
    identifier: 'ALUMINUM',
    density: 2700
  } );

  static APPLE = new Material( {
    name: densityBuoyancyCommonStrings.material.apple,
    tandemName: 'apple',
    identifier: 'APPLE',
    // "Some Physical Properties of Apple" - Averaged the two cultivars' densities for this
    // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.548.1131&rep=rep1&type=pdf
    density: 832
  } );

  static BRICK = new Material( {
    name: densityBuoyancyCommonStrings.material.brick,
    tandemName: 'brick',
    identifier: 'BRICK',
    density: 2000
  } );

  static CEMENT = new Material( {
    name: densityBuoyancyCommonStrings.material.cement,
    tandemName: 'cement',
    identifier: 'CEMENT',
    density: 3150,
    liquidColor: DensityBuoyancyCommonColors.materialCementColorProperty
  } );

  static COPPER = new Material( {
    name: densityBuoyancyCommonStrings.material.copper,
    tandemName: 'copper',
    identifier: 'COPPER',
    density: 8960,
    liquidColor: DensityBuoyancyCommonColors.materialCopperColorProperty
  } );

  static DIAMOND = new Material( {
    name: densityBuoyancyCommonStrings.material.diamond,
    tandemName: 'diamond',
    identifier: 'DIAMOND',
    density: 3510
  } );

  static GLASS = new Material( {
    name: densityBuoyancyCommonStrings.material.glass,
    tandemName: 'glass',
    identifier: 'GLASS',
    density: 2700
  } );

  static GOLD = new Material( {
    name: densityBuoyancyCommonStrings.material.gold,
    tandemName: 'gold',
    identifier: 'GOLD',
    density: 19320
  } );

  static HUMAN = new Material( {
    name: densityBuoyancyCommonStrings.material.human,
    tandemName: 'human',
    identifier: 'HUMAN',
    density: 950
  } );

  static ICE = new Material( {
    name: densityBuoyancyCommonStrings.material.ice,
    tandemName: 'ice',
    identifier: 'ICE',
    density: 919
  } );

  static LEAD = new Material( {
    name: densityBuoyancyCommonStrings.material.lead,
    tandemName: 'lead',
    identifier: 'LEAD',
    density: 11342,
    liquidColor: DensityBuoyancyCommonColors.materialLeadColorProperty
  } );

  static PLATINUM = new Material( {
    name: densityBuoyancyCommonStrings.material.platinum,
    tandemName: 'platinum',
    identifier: 'PLATINUM',
    density: 21450
  } );

  static PYRITE = new Material( {
    name: densityBuoyancyCommonStrings.material.pyrite,
    tandemName: 'pyrite',
    identifier: 'PYRITE',
    density: 5010
  } );

  static SILVER = new Material( {
    name: densityBuoyancyCommonStrings.material.silver,
    tandemName: 'silver',
    identifier: 'SILVER',
    density: 10490
  } );

  static STEEL = new Material( {
    name: densityBuoyancyCommonStrings.material.steel,
    tandemName: 'steel',
    identifier: 'STEEL',
    density: 7800
  } );

  static STYROFOAM = new Material( {
    name: densityBuoyancyCommonStrings.material.styrofoam,
    tandemName: 'styrofoam',
    identifier: 'STYROFOAM',
    // From Flash version: between 25 and 200 according to http://wiki.answers.com/Q/What_is_the_density_of_styrofoam;
    // chose 150 so it isn't too low to show on slider, but not 200 so it's not half of wood
    density: 150
  } );

  static TANTALUM = new Material( {
    name: densityBuoyancyCommonStrings.material.tantalum,
    tandemName: 'tantalum',
    identifier: 'TANTALUM',
    density: 16650
  } );

  static TITANIUM = new Material( {
    name: densityBuoyancyCommonStrings.material.titanium,
    tandemName: 'titanium',
    identifier: 'TITANIUM',
    density: 4500
  } );

  static WOOD = new Material( {
    name: densityBuoyancyCommonStrings.material.wood,
    tandemName: 'wood',
    identifier: 'WOOD',
    density: 400
  } );

  // (read-only) {Material} - "Liquids".

  static AIR = new Material( {
    name: densityBuoyancyCommonStrings.material.air,
    tandemName: 'air',
    identifier: 'AIR',
    density: 1.2,
    viscosity: 0,
    liquidColor: DensityBuoyancyCommonColors.materialAirColorProperty
  } );

  static DENSITY_A = new Material( {
    name: densityBuoyancyCommonStrings.material.densityA,
    tandemName: 'densityA',
    identifier: 'DENSITY_A',
    density: 3100,
    liquidColor: DensityBuoyancyCommonColors.materialDensityAColorProperty,
    hidden: true
  } );

  static DENSITY_B = new Material( {
    name: densityBuoyancyCommonStrings.material.densityB,
    tandemName: 'densityB',
    identifier: 'DENSITY_B',
    density: 790,
    liquidColor: DensityBuoyancyCommonColors.materialDensityBColorProperty,
    hidden: true
  } );

  static DENSITY_C = new Material( {
    name: densityBuoyancyCommonStrings.material.densityC,
    tandemName: 'densityC',
    identifier: 'DENSITY_C',
    density: 490,
    liquidColor: DensityBuoyancyCommonColors.materialDensityCColorProperty,
    hidden: true
  } );

  static DENSITY_D = new Material( {
    name: densityBuoyancyCommonStrings.material.densityD,
    tandemName: 'densityD',
    identifier: 'DENSITY_D',
    density: 2890,
    liquidColor: DensityBuoyancyCommonColors.materialDensityDColorProperty,
    hidden: true
  } );

  static DENSITY_E = new Material( {
    name: densityBuoyancyCommonStrings.material.densityE,
    tandemName: 'densityE',
    identifier: 'DENSITY_E',
    density: 1260,
    liquidColor: DensityBuoyancyCommonColors.materialDensityEColorProperty,
    hidden: true
  } );

  static DENSITY_F = new Material( {
    name: densityBuoyancyCommonStrings.material.densityF,
    tandemName: 'densityF',
    identifier: 'DENSITY_F',
    density: 6440,
    liquidColor: DensityBuoyancyCommonColors.materialDensityFColorProperty,
    hidden: true
  } );

  static GASOLINE = new Material( {
    name: densityBuoyancyCommonStrings.material.gasoline,
    tandemName: 'gasoline',
    identifier: 'GASOLINE',
    density: 680,
    viscosity: 6e-4,
    liquidColor: DensityBuoyancyCommonColors.materialGasolineColorProperty
  } );

  static HONEY = new Material( {
    name: densityBuoyancyCommonStrings.material.honey,
    tandemName: 'honey',
    identifier: 'HONEY',
    density: 1440,
    viscosity: 0.03, // NOTE: actual value around 2.5, but we can get away with this for animation
    liquidColor: DensityBuoyancyCommonColors.materialHoneyColorProperty
  } );

  static MERCURY = new Material( {
    name: densityBuoyancyCommonStrings.material.mercury,
    tandemName: 'mercury',
    identifier: 'MERCURY',
    density: 13593,
    viscosity: 1.53e-3,
    liquidColor: DensityBuoyancyCommonColors.materialMercuryColorProperty
  } );

  static OIL = new Material( {
    name: densityBuoyancyCommonStrings.material.oil,
    tandemName: 'oil',
    identifier: 'OIL',
    density: 920,
    viscosity: 0.02, // Too much bigger and it won't work, not particularly physical
    liquidColor: DensityBuoyancyCommonColors.materialOilColorProperty
  } );

  static SAND = new Material( {
    name: densityBuoyancyCommonStrings.material.sand,
    tandemName: 'sand',
    identifier: 'SAND',
    density: 1442,
    viscosity: 0.03, // Too much bigger and it won't work, not particularly physical
    liquidColor: DensityBuoyancyCommonColors.materialSandColorProperty
  } );

  static SEAWATER = new Material( {
    name: densityBuoyancyCommonStrings.material.seawater,
    tandemName: 'seawater',
    identifier: 'SEAWATER',
    density: 1029,
    viscosity: 1.88e-3,
    liquidColor: DensityBuoyancyCommonColors.materialSeawaterColorProperty
  } );

  static WATER = new Material( {
    name: densityBuoyancyCommonStrings.material.water,
    tandemName: 'water',
    identifier: 'WATER',
    density: 1000,
    viscosity: 8.9e-4,
    liquidColor: DensityBuoyancyCommonColors.materialWaterColorProperty
  } );

  static MATERIALS: Material[];
  static MaterialIO: IOType;
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
  name: string;
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
    name: StringIO,
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
      name: StringIO.toStateObject( material.name ),
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
        name: StringIO.fromStateObject( obj.name ),
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
