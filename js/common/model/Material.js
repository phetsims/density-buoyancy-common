// Copyright 2019-2021, University of Colorado Boulder

/**
 * Represents different materials that solids/liquids in the simulations can take, including density/viscosity/color.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import Color from '../../../../scenery/js/util/Color.js';
import ColorProperty from '../../../../scenery/js/util/ColorProperty.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColors from '../view/DensityBuoyancyCommonColors.js';

class Material {
  /**
   * @param {Object} config
   */
  constructor( config ) {

    config = merge( {
      // {string}
      name: 'unknown',

      // {string|null} - If set, this material will be available at Material[ identifier ] as a global
      identifier: null,

      // {number} - in SI (kg/m^3)
      density: 1,

      // {number} - in SI (Pa * s). For reference a poise is 1e-2 Pa*s, and a centipoise is 1e-3 Pa*s.
      viscosity: 1e-3,

      // {boolean} - optional
      custom: false,

      // {boolean} - optional - if true, don't show the density in number pickers/readouts
      hidden: false,

      // {Property.<Color>|null} - optional, uses the color for a solid material's color
      customColor: null,

      // {Property.<Color>|null} - optional, uses the alpha channel for opacity
      liquidColor: null
    }, config );

    // @public (read-only) {string}
    this.name = config.name;

    // @public (read-only) {string|null}
    this.identifier = config.identifier;

    // @public (read-only) {number}
    this.density = config.density;

    // @public (read-only) {number}
    this.viscosity = config.viscosity;

    // @public (read-only) {boolean}
    this.custom = config.custom;

    // @public (read-only) {boolean}
    this.hidden = config.hidden;

    // @public (read-only) {Property.<Color>|null}
    this.customColor = config.customColor;

    // @public (read-only) {Property.<Color>|null}
    this.liquidColor = config.liquidColor;
  }

  /**
   * Returns a custom material that can be modified at will.
   * @public
   *
   * @param {Object} config
   * @returns {Material}
   */
  static createCustomMaterial( config ) {
    return new Material( merge( {
      name: densityBuoyancyCommonStrings.material.custom,
      custom: true
    }, config ) );
  }

  /**
   * Returns a custom material that can be modified at will, but with a liquid color specified.
   * @public
   *
   * @param {Object} config
   * @returns {Material}
   */
  static createCustomLiquidMaterial( config ) {
    return Material.createCustomMaterial( merge( {
      liquidColor: Material.getCustomLiquidColor( config.density )
    }, config ) );
  }

  /**
   * Returns a custom material that can be modified at will, but with a solid color specified
   * @public
   *
   * @param {Object} config
   * @returns {Material}
   */
  static createCustomSolidMaterial( config ) {
    return Material.createCustomMaterial( merge( {
      liquidColor: Material.getCustomSolidColor( config.density )
    }, config ) );
  }

  /**
   * Returns a value suitable for use in colors (0-255 value) that should be used as a grayscale value for
   * a material of a given density.
   * @public
   *
   * @param {number} density
   * @returns {number}
   */
  static getCustomLightness( density ) {
    return Utils.roundSymmetric( Utils.clamp( Utils.linear( 1, -2, 0, 255, Utils.log10( density / 1000 ) ), 0, 255 ) );
  }

  /**
   * Similar to getCustomLightness, but returns the generated color, with an included alpha effect.
   * @public
   *
   * @param {number} density
   * @returns {ColorDef}
   */
  static getCustomLiquidColor( density ) {
    const lightness = Material.getCustomLightness( density );

    return new ColorProperty( new Color( lightness, lightness, lightness, 0.8 * ( 1 - lightness / 255 ) ) );
  }

  /**
   * Similar to getCustomLightness, but returns the generated color
   * @public
   *
   * @param {number} density
   * @returns {ColorDef}
   */
  static getCustomSolidColor( density ) {
    const lightness = Material.getCustomLightness( density );

    return new ColorProperty( new Color( lightness, lightness, lightness ) );
  }
}

// @public (read-only) {Material} - "Solids"
Material.ALUMINUM = new Material( {
  name: densityBuoyancyCommonStrings.material.aluminum,
  identifier: 'ALUMINUM',
  density: 2700
} );
Material.APPLE = new Material( {
  name: densityBuoyancyCommonStrings.material.apple,
  identifier: 'APPLE',
  // "Some Physical Properties of Apple" - Averaged the two cultivars' densities for this
  // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.548.1131&rep=rep1&type=pdf
  density: 832
} );
Material.BRICK = new Material( {
  name: densityBuoyancyCommonStrings.material.brick,
  identifier: 'BRICK',
  density: 2000
} );
Material.CEMENT = new Material( {
  name: densityBuoyancyCommonStrings.material.cement,
  identifier: 'CEMENT',
  density: 3150,
  liquidColor: DensityBuoyancyCommonColors.materialCementColorProperty
} );
Material.COPPER = new Material( {
  name: densityBuoyancyCommonStrings.material.copper,
  identifier: 'COPPER',
  density: 8960,
  liquidColor: DensityBuoyancyCommonColors.materialCopperColorProperty
} );
Material.DIAMOND = new Material( {
  name: densityBuoyancyCommonStrings.material.diamond,
  identifier: 'DIAMOND',
  density: 3510
} );
Material.GLASS = new Material( {
  name: densityBuoyancyCommonStrings.material.glass,
  identifier: 'GLASS',
  density: 2700
} );
Material.GOLD = new Material( {
  name: densityBuoyancyCommonStrings.material.gold,
  identifier: 'GOLD',
  density: 19320
} );
Material.HUMAN = new Material( {
  name: densityBuoyancyCommonStrings.material.human,
  identifier: 'HUMAN',
  density: 950
} );
Material.ICE = new Material( {
  name: densityBuoyancyCommonStrings.material.ice,
  identifier: 'ICE',
  density: 919
} );
Material.LEAD = new Material( {
  name: densityBuoyancyCommonStrings.material.lead,
  identifier: 'LEAD',
  density: 11342,
  liquidColor: DensityBuoyancyCommonColors.materialLeadColorProperty
} );
Material.PLATINUM = new Material( {
  name: densityBuoyancyCommonStrings.material.platinum,
  identifier: 'PLATINUM',
  density: 21450
} );
Material.PYRITE = new Material( {
  name: densityBuoyancyCommonStrings.material.pyrite,
  identifier: 'PYRITE',
  density: 5010
} );
Material.SILVER = new Material( {
  name: densityBuoyancyCommonStrings.material.silver,
  identifier: 'SILVER',
  density: 10490
} );
Material.STEEL = new Material( {
  name: densityBuoyancyCommonStrings.material.steel,
  identifier: 'STEEL',
  density: 7800
} );
Material.STYROFOAM = new Material( {
  name: densityBuoyancyCommonStrings.material.styrofoam,
  identifier: 'STYROFOAM',
  // From Flash version: between 25 and 200 according to http://wiki.answers.com/Q/What_is_the_density_of_styrofoam;
  // chose 150 so it isn't too low to show on slider, but not 200 so it's not half of wood
  density: 150
} );
Material.TANTALUM = new Material( {
  name: densityBuoyancyCommonStrings.material.tantalum,
  identifier: 'TANTALUM',
  density: 16650
} );
Material.TITANIUM = new Material( {
  name: densityBuoyancyCommonStrings.material.titanium,
  identifier: 'TITANIUM',
  density: 4500
} );
Material.WOOD = new Material( {
  name: densityBuoyancyCommonStrings.material.wood,
  identifier: 'WOOD',
  density: 400
} );

// @public (read-only) {Material} - "Liquids".
Material.AIR = new Material( {
  name: densityBuoyancyCommonStrings.material.air,
  identifier: 'AIR',
  density: 1.2,
  viscosity: 0,
  liquidColor: DensityBuoyancyCommonColors.materialAirColorProperty
} );
Material.DENSITY_P = new Material( {
  name: densityBuoyancyCommonStrings.material.densityP,
  identifier: 'DENSITY_P',
  density: 200,
  liquidColor: DensityBuoyancyCommonColors.materialDensityPColorProperty,
  hidden: true
} );
Material.DENSITY_Q = new Material( {
  name: densityBuoyancyCommonStrings.material.densityQ,
  identifier: 'DENSITY_Q',
  density: 4000,
  liquidColor: DensityBuoyancyCommonColors.materialDensityQColorProperty,
  hidden: true
} );
Material.DENSITY_R = new Material( {
  name: densityBuoyancyCommonStrings.material.densityR,
  identifier: 'DENSITY_R',
  density: 200,
  liquidColor: DensityBuoyancyCommonColors.materialDensityRColorProperty,
  hidden: true
} );
Material.DENSITY_S = new Material( {
  name: densityBuoyancyCommonStrings.material.densityS,
  identifier: 'DENSITY_S',
  density: 4000,
  liquidColor: DensityBuoyancyCommonColors.materialDensitySColorProperty,
  hidden: true
} );
Material.DENSITY_X = new Material( {
  name: densityBuoyancyCommonStrings.material.densityX,
  identifier: 'DENSITY_X',
  density: 500,
  liquidColor: DensityBuoyancyCommonColors.materialDensityXColorProperty,
  hidden: true
} );
Material.DENSITY_Y = new Material( {
  name: densityBuoyancyCommonStrings.material.densityY,
  identifier: 'DENSITY_Y',
  density: 5000,
  liquidColor: DensityBuoyancyCommonColors.materialDensityYColorProperty,
  hidden: true
} );
Material.GASOLINE = new Material( {
  name: densityBuoyancyCommonStrings.material.gasoline,
  identifier: 'GASOLINE',
  density: 680,
  viscosity: 6e-4,
  liquidColor: DensityBuoyancyCommonColors.materialGasolineColorProperty
} );
Material.HONEY = new Material( {
  name: densityBuoyancyCommonStrings.material.honey,
  identifier: 'HONEY',
  density: 1440,
  viscosity: 0.03, // NOTE: actual value around 2.5, but we can get away with this for animation
  liquidColor: DensityBuoyancyCommonColors.materialHoneyColorProperty
} );
Material.MERCURY = new Material( {
  name: densityBuoyancyCommonStrings.material.mercury,
  identifier: 'MERCURY',
  density: 13593,
  viscosity: 1.53e-3,
  liquidColor: DensityBuoyancyCommonColors.materialMercuryColorProperty
} );
Material.OIL = new Material( {
  name: densityBuoyancyCommonStrings.material.oil,
  identifier: 'OIL',
  density: 920,
  viscosity: 0.02, // Too much bigger and it won't work, not particularly physical
  liquidColor: DensityBuoyancyCommonColors.materialOilColorProperty
} );
Material.SAND = new Material( {
  name: densityBuoyancyCommonStrings.material.sand,
  identifier: 'SAND',
  density: 1442,
  viscosity: 0.03, // Too much bigger and it won't work, not particularly physical
  liquidColor: DensityBuoyancyCommonColors.materialSandColorProperty
} );
Material.SEAWATER = new Material( {
  name: densityBuoyancyCommonStrings.material.seawater,
  identifier: 'SEAWATER',
  density: 1029,
  viscosity: 1.88e-3,
  liquidColor: DensityBuoyancyCommonColors.materialSeawaterColorProperty
} );
Material.WATER = new Material( {
  name: densityBuoyancyCommonStrings.material.water,
  identifier: 'WATER',
  density: 1000,
  viscosity: 8.9e-4,
  liquidColor: DensityBuoyancyCommonColors.materialWaterColorProperty
} );

// @public (read-only) {Array.<Material>}
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
  documentation: 'Represents different materials that solids/liquids in the simulations can take, including density/viscosity/color.',
  stateSchema: {
    name: StringIO,
    identifier: NullableIO( StringIO ),
    density: NumberIO,
    viscosity: NumberIO,
    custom: BooleanIO,
    hidden: BooleanIO,
    staticCustomColor: NullableIO( Color.ColorIO ),
    customColor: NullableColorPropertyReferenceType,
    staticLiquidColor: NullableIO( Color.ColorIO ),
    liquidColor: NullableColorPropertyReferenceType
  },
  toStateObject( material ) {

    const isCustomColorUninstrumented = material.customColor && !material.customColor.isPhetioInstrumented();
    const isLiquidColorUninstrumented = material.liquidColor && !material.liquidColor.isPhetioInstrumented();

    return {
      name: StringIO.toStateObject( material.name ),
      identifier: NullableIO( StringIO ).toStateObject( material.identifier ),
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
  fromStateObject( obj ) {
    if ( obj.identifier ) {
      const material = Material[ obj.identifier ];
      assert && assert( material, `Unkonwn material: ${obj.identifier}` );
      return material;
    }
    else {
      const staticCustomColor = NullableIO( Color.ColorIO ).fromStateObject( obj.staticCustomColor );
      const staticLiquidColor = NullableIO( Color.ColorIO ).fromStateObject( obj.staticLiquidColor );
      return new Material( {
        name: StringIO.fromStateObject( obj.name ),
        identifier: NullableIO( StringIO ).fromStateObject( obj.identifier ),
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