// Copyright 2022, University of Colorado Boulder

/**
 * Represents different materials that solids/liquids in the simulations can take, including density/viscosity/color.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Color, IColor } from '../../../../scenery/js/imports.js';
import { ColorProperty } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColors from '../view/DensityBuoyancyCommonColors.js';

type MaterialOptions = {
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
  customColor?: IReadOnlyProperty<Color> | null;

  // Uses the alpha channel for opacity
  liquidColor?: IReadOnlyProperty<Color> | null;
};

class Material {

  readonly name: string;
  readonly identifier: string | null;
  readonly tandemName: string | null;
  readonly density: number;
  readonly viscosity: number;
  readonly custom: boolean;
  readonly hidden: boolean;
  readonly customColor: IReadOnlyProperty<Color> | null;
  readonly liquidColor: IReadOnlyProperty<Color> | null;

  constructor( providedConfig: MaterialOptions ) {

    const config = optionize<MaterialOptions, MaterialOptions>( {
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
    const lightness = Material.getCustomLightness( density );

    return new ColorProperty( new Color( lightness, lightness, lightness, 0.8 * ( 1 - lightness / 255 ) ) );
  }

  /**
   * Similar to getCustomLightness, but returns the generated color
   */
  static getCustomSolidColor( density: number ): IColor {
    const lightness = Material.getCustomLightness( density );

    return new ColorProperty( new Color( lightness, lightness, lightness ) );
  }

  // @public (read-only) {Material} - "Solids"

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

  // @public (read-only) {Material} - "Liquids".

  static AIR = new Material( {
    name: densityBuoyancyCommonStrings.material.air,
    tandemName: 'air',
    identifier: 'AIR',
    density: 1.2,
    viscosity: 0,
    liquidColor: DensityBuoyancyCommonColors.materialAirColorProperty
  } );

  static DENSITY_P = new Material( {
    name: densityBuoyancyCommonStrings.material.densityP,
    tandemName: 'densityP',
    identifier: 'DENSITY_P',
    density: 200,
    liquidColor: DensityBuoyancyCommonColors.materialDensityPColorProperty,
    hidden: true
  } );

  static DENSITY_Q = new Material( {
    name: densityBuoyancyCommonStrings.material.densityQ,
    tandemName: 'densityQ',
    identifier: 'DENSITY_Q',
    density: 4000,
    liquidColor: DensityBuoyancyCommonColors.materialDensityQColorProperty,
    hidden: true
  } );

  static DENSITY_R = new Material( {
    name: densityBuoyancyCommonStrings.material.densityR,
    tandemName: 'densityR',
    identifier: 'DENSITY_R',
    density: 200,
    liquidColor: DensityBuoyancyCommonColors.materialDensityRColorProperty,
    hidden: true
  } );

  static DENSITY_S = new Material( {
    name: densityBuoyancyCommonStrings.material.densityS,
    tandemName: 'densityS',
    identifier: 'DENSITY_S',
    density: 4000,
    liquidColor: DensityBuoyancyCommonColors.materialDensitySColorProperty,
    hidden: true
  } );

  static DENSITY_X = new Material( {
    name: densityBuoyancyCommonStrings.material.densityX,
    tandemName: 'densityX',
    identifier: 'DENSITY_X',
    density: 500,
    liquidColor: DensityBuoyancyCommonColors.materialDensityXColorProperty,
    hidden: true
  } );

  static DENSITY_Y = new Material( {
    name: densityBuoyancyCommonStrings.material.densityY,
    tandemName: 'densityY',
    identifier: 'DENSITY_Y',
    density: 5000,
    liquidColor: DensityBuoyancyCommonColors.materialDensityYColorProperty,
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
  Material.DENSITY_P,
  Material.DENSITY_Q,
  Material.DENSITY_X,
  Material.DENSITY_Y,
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

// @public (read-only) {IOType}
Material.MaterialIO = new IOType( 'MaterialIO', {
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
  toStateObject( material: Material ) {

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
  fromStateObject( obj: any ) {
    if ( obj.identifier ) {
      const material = Material[ obj.identifier as keyof typeof Material ];
      assert && assert( material, `Unkonwn material: ${obj.identifier}` );
      return material;
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
export default Material;
export type { MaterialOptions };