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
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColorProfile from '../view/densityBuoyancyCommonColorProfile.js';

class Material {
  /**
   * @param {Object} config
   */
  constructor( config ) {

    config = merge( {
      // {string}
      name: 'unknown',

      // {number} - in SI (kg/m^3)
      density: 1,

      // {number} - in SI (Pa * s). For reference a poise is 1e-2 Pa*s, and a centipoise is 1e-3 Pa*s.
      viscosity: 1e-3,

      // {boolean} - optional
      custom: false,

      // {boolean} - optional
      hidden: false,

      // {Property.<Color>|null} - optional
      customColor: null,

      // {Property.<Color>|null} - optional, uses the alpha channel for opacity
      liquidColor: null
    }, config );

    // @public {string}
    this.name = config.name;

    // @public {number}
    this.density = config.density;

    // @public {number}
    this.viscosity = config.viscosity;

    // @public {boolean}
    this.custom = config.custom;

    // @public {boolean}
    this.hidden = config.hidden;

    // @public {Property.<Color>|null}
    this.customColor = config.customColor;

    // @public {Property.<Color>|null}
    this.liquidColor = config.liquidColor;

    // @public {number}
    this.liquidOpacity = config.liquidOpacity;
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

    return new Property( new Color( lightness, lightness, lightness, 0.8 * ( 1 - lightness / 255 ) ) );
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

    return new Property( new Color( lightness, lightness, lightness ) );
  }
}

// @public {Material} - "Solids"
Material.ALUMINUM = new Material( {
  name: densityBuoyancyCommonStrings.material.aluminum,
  density: 2700
} );
Material.APPLE = new Material( {
  name: densityBuoyancyCommonStrings.material.apple,
  // "Some Physical Properties of Apple" - Averaged the two cultivars' densities for this
  // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.548.1131&rep=rep1&type=pdf
  density: 832
} );
Material.BRICK = new Material( {
  name: densityBuoyancyCommonStrings.material.brick,
  density: 2000
} );
Material.CEMENT = new Material( {
  name: densityBuoyancyCommonStrings.material.cement,
  density: 3150,
  liquidColor: DensityBuoyancyCommonColorProfile.materialCementProperty
} );
Material.COPPER = new Material( {
  name: densityBuoyancyCommonStrings.material.copper,
  density: 8960,
  liquidColor: DensityBuoyancyCommonColorProfile.materialCopperProperty
} );
Material.DIAMOND = new Material( {
  name: densityBuoyancyCommonStrings.material.diamond,
  density: 3510
} );
Material.GLASS = new Material( {
  name: densityBuoyancyCommonStrings.material.glass,
  density: 2700
} );
Material.GOLD = new Material( {
  name: densityBuoyancyCommonStrings.material.gold,
  density: 19320
} );
Material.HUMAN = new Material( {
  name: densityBuoyancyCommonStrings.material.human,
  density: 950
} );
Material.ICE = new Material( {
  name: densityBuoyancyCommonStrings.material.ice,
  density: 919
} );
Material.LEAD = new Material( {
  name: densityBuoyancyCommonStrings.material.lead,
  density: 11342,
  liquidColor: DensityBuoyancyCommonColorProfile.materialLeadProperty
} );
Material.PLATINUM = new Material( {
  name: densityBuoyancyCommonStrings.material.platinum,
  density: 21450
} );
Material.PYRITE = new Material( {
  name: densityBuoyancyCommonStrings.material.pyrite,
  density: 5010
} );
Material.SILVER = new Material( {
  name: densityBuoyancyCommonStrings.material.silver,
  density: 10490
} );
Material.STEEL = new Material( {
  name: densityBuoyancyCommonStrings.material.steel,
  density: 7800
} );
Material.STYROFOAM = new Material( {
  name: densityBuoyancyCommonStrings.material.styrofoam,
  // From Flash version: between 25 and 200 according to http://wiki.answers.com/Q/What_is_the_density_of_styrofoam;
  // chose 150 so it isn't too low to show on slider, but not 200 so it's not half of wood
  density: 150
} );
Material.TANTALUM = new Material( {
  name: densityBuoyancyCommonStrings.material.tantalum,
  density: 16650
} );
Material.TITANIUM = new Material( {
  name: densityBuoyancyCommonStrings.material.titanium,
  density: 4500
} );
Material.WOOD = new Material( {
  name: densityBuoyancyCommonStrings.material.wood,
  density: 400
} );

// @public {Material} - "Liquids".
Material.AIR = new Material( {
  name: densityBuoyancyCommonStrings.material.air,
  density: 1.2,
  viscosity: 0,
  liquidColor: DensityBuoyancyCommonColorProfile.materialAirProperty
} );
Material.DENSITY_P = new Material( {
  name: densityBuoyancyCommonStrings.material.densityP,
  density: 200,
  liquidColor: DensityBuoyancyCommonColorProfile.materialDensityPProperty,
  hidden: true
} );
Material.DENSITY_Q = new Material( {
  name: densityBuoyancyCommonStrings.material.densityQ,
  density: 4000,
  liquidColor: DensityBuoyancyCommonColorProfile.materialDensityQProperty,
  hidden: true
} );
Material.DENSITY_R = new Material( {
  name: densityBuoyancyCommonStrings.material.densityR,
  density: 200,
  liquidColor: DensityBuoyancyCommonColorProfile.materialDensityRProperty,
  hidden: true
} );
Material.DENSITY_S = new Material( {
  name: densityBuoyancyCommonStrings.material.densityS,
  density: 4000,
  liquidColor: DensityBuoyancyCommonColorProfile.materialDensitySProperty,
  hidden: true
} );
Material.DENSITY_X = new Material( {
  name: densityBuoyancyCommonStrings.material.densityX,
  density: 500,
  liquidColor: DensityBuoyancyCommonColorProfile.materialDensityXProperty,
  hidden: true
} );
Material.DENSITY_Y = new Material( {
  name: densityBuoyancyCommonStrings.material.densityY,
  density: 5000,
  liquidColor: DensityBuoyancyCommonColorProfile.materialDensityYProperty,
  hidden: true
} );
Material.GASOLINE = new Material( {
  name: densityBuoyancyCommonStrings.material.gasoline,
  density: 680,
  viscosity: 6e-4,
  liquidColor: DensityBuoyancyCommonColorProfile.materialGasolineProperty
} );
Material.HONEY = new Material( {
  name: densityBuoyancyCommonStrings.material.honey,
  density: 1440,
  viscosity: 0.03, // NOTE: actual value around 2.5, but we can get away with this for animation
  liquidColor: DensityBuoyancyCommonColorProfile.materialHoneyProperty
} );
Material.MERCURY = new Material( {
  name: densityBuoyancyCommonStrings.material.mercury,
  density: 13593,
  viscosity: 1.53e-3,
  liquidColor: DensityBuoyancyCommonColorProfile.materialMercuryProperty
} );
Material.OIL = new Material( {
  name: densityBuoyancyCommonStrings.material.oil,
  density: 920,
  viscosity: 0.02, // Too much bigger and it won't work, not particularly physical
  liquidColor: DensityBuoyancyCommonColorProfile.materialOilProperty
} );
Material.SAND = new Material( {
  name: densityBuoyancyCommonStrings.material.sand,
  density: 1442,
  viscosity: 0.03, // Too much bigger and it won't work, not particularly physical
  liquidColor: DensityBuoyancyCommonColorProfile.materialSandProperty
} );
Material.SEAWATER = new Material( {
  name: densityBuoyancyCommonStrings.material.seawater,
  density: 1029,
  viscosity: 1.88e-3,
  liquidColor: DensityBuoyancyCommonColorProfile.materialSeawaterProperty
} );
Material.WATER = new Material( {
  name: densityBuoyancyCommonStrings.material.water,
  density: 1000,
  viscosity: 8.9e-4,
  liquidColor: DensityBuoyancyCommonColorProfile.materialWaterProperty
} );

// @public {Array.<Material>}
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

densityBuoyancyCommon.register( 'Material', Material );
export default Material;