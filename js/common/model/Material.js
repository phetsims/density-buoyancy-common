// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const merge = require( 'PHET_CORE/merge' );
  const Property = require( 'AXON/Property' );
  const Utils = require( 'DOT/Utils' );

  // strings
  const materialAirString = require( 'string!DENSITY_BUOYANCY_COMMON/material.air' );
  const materialAluminumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.aluminum' );
  const materialAppleString = require( 'string!DENSITY_BUOYANCY_COMMON/material.apple' );
  const materialBrickString = require( 'string!DENSITY_BUOYANCY_COMMON/material.brick' );
  const materialCementString = require( 'string!DENSITY_BUOYANCY_COMMON/material.cement' );
  const materialCopperString = require( 'string!DENSITY_BUOYANCY_COMMON/material.copper' );
  const materialCustomString = require( 'string!DENSITY_BUOYANCY_COMMON/material.custom' );
  const materialDensityPString = require( 'string!DENSITY_BUOYANCY_COMMON/material.densityP' );
  const materialDensityQString = require( 'string!DENSITY_BUOYANCY_COMMON/material.densityQ' );
  const materialDensityRString = require( 'string!DENSITY_BUOYANCY_COMMON/material.densityR' );
  const materialDensitySString = require( 'string!DENSITY_BUOYANCY_COMMON/material.densityS' );
  const materialDensityXString = require( 'string!DENSITY_BUOYANCY_COMMON/material.densityX' );
  const materialDensityYString = require( 'string!DENSITY_BUOYANCY_COMMON/material.densityY' );
  const materialDiamondString = require( 'string!DENSITY_BUOYANCY_COMMON/material.diamond' );
  const materialGasolineString = require( 'string!DENSITY_BUOYANCY_COMMON/material.gasoline' );
  const materialGlassString = require( 'string!DENSITY_BUOYANCY_COMMON/material.glass' );
  const materialGoldString = require( 'string!DENSITY_BUOYANCY_COMMON/material.gold' );
  const materialHoneyString = require( 'string!DENSITY_BUOYANCY_COMMON/material.honey' );
  const materialHumanString = require( 'string!DENSITY_BUOYANCY_COMMON/material.human' );
  const materialIceString = require( 'string!DENSITY_BUOYANCY_COMMON/material.ice' );
  const materialLeadString = require( 'string!DENSITY_BUOYANCY_COMMON/material.lead' );
  const materialMercuryString = require( 'string!DENSITY_BUOYANCY_COMMON/material.mercury' );
  const materialOilString = require( 'string!DENSITY_BUOYANCY_COMMON/material.oil' );
  const materialPlatinumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.platinum' );
  const materialPyriteString = require( 'string!DENSITY_BUOYANCY_COMMON/material.pyrite' );
  const materialSandString = require( 'string!DENSITY_BUOYANCY_COMMON/material.sand' );
  const materialSeawaterString = require( 'string!DENSITY_BUOYANCY_COMMON/material.seawater' );
  const materialSilverString = require( 'string!DENSITY_BUOYANCY_COMMON/material.silver' );
  const materialSteelString = require( 'string!DENSITY_BUOYANCY_COMMON/material.steel' );
  const materialStyrofoamString = require( 'string!DENSITY_BUOYANCY_COMMON/material.styrofoam' );
  const materialTantalumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.tantalum' );
  const materialTitaniumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.titanium' );
  const materialWaterString = require( 'string!DENSITY_BUOYANCY_COMMON/material.water' );
  const materialWoodString = require( 'string!DENSITY_BUOYANCY_COMMON/material.wood' );

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
        name: materialCustomString,
        custom: true
      }, config ));
    }

    static createCustomLiquidMaterial( config ) {
      return Material.createCustomMaterial( merge( {
        liquidColor: Material.getCustomLiquidColor( config.density )
      }, config ) );
    }

    static createCustomSolidMaterial( config ) {
      return Material.createCustomMaterial( merge( {
        liquidColor: Material.getCustomSolidColor( config.density )
      }, config ) );
    }

    static getCustomLightness( density ) {
      return Utils.roundSymmetric( Utils.clamp( Utils.linear( 1, -2, 0, 255, Utils.log10( density / 1000 ) ), 0, 255 ) );
    }

    static getCustomLiquidColor( density ) {
      const lightness = Material.getCustomLightness( density );

      return new Property( new Color( lightness, lightness, lightness, 0.8 * ( 1 - lightness / 255 ) ) );
    }

    static getCustomSolidColor( density ) {
      const lightness = Material.getCustomLightness( density );

      return new Property( new Color( lightness, lightness, lightness ) );
    }
  }

  // @public {Material} - "Solids"
  Material.ALUMINUM = new Material( {
    name: materialAluminumString,
    density: 2700
  } );
  Material.APPLE = new Material( {
    name: materialAppleString,
    // "Some Physical Properties of Apple" - Averaged the two cultivars' densities for this
    // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.548.1131&rep=rep1&type=pdf
    density: 832
  } );
  Material.BRICK = new Material( {
    name: materialBrickString,
    density: 2000
  } );
  Material.CEMENT = new Material( {
    name: materialCementString,
    density: 3150,
    liquidColor: DensityBuoyancyCommonColorProfile.materialCementProperty
  } );
  Material.COPPER = new Material( {
    name: materialCopperString,
    density: 8960,
    liquidColor: DensityBuoyancyCommonColorProfile.materialCopperProperty
  } );
  Material.DIAMOND = new Material( {
    name: materialDiamondString,
    density: 3510
  } );
  Material.GLASS = new Material( {
    name: materialGlassString,
    density: 2700
  } );
  Material.GOLD = new Material( {
    name: materialGoldString,
    density: 19320
  } );
  Material.HUMAN = new Material( {
    name: materialHumanString,
    density: 950
  } );
  Material.ICE = new Material( {
    name: materialIceString,
    density: 919
  } );
  Material.LEAD = new Material( {
    name: materialLeadString,
    density: 11342,
    liquidColor: DensityBuoyancyCommonColorProfile.materialLeadProperty
  } );
  Material.PLATINUM = new Material( {
    name: materialPlatinumString,
    density: 21450
  } );
  Material.PYRITE = new Material( {
    name: materialPyriteString,
    density: 5010
  } );
  Material.SILVER = new Material( {
    name: materialSilverString,
    density: 10490
  } );
  Material.STEEL = new Material( {
    name: materialSteelString,
    density: 7800
  } );
  Material.STYROFOAM = new Material( {
    name: materialStyrofoamString,
    // From Flash version: between 25 and 200 according to http://wiki.answers.com/Q/What_is_the_density_of_styrofoam;
    // chose 150 so it isn't too low to show on slider, but not 200 so it's not half of wood
    density: 150
  } );
  Material.TANTALUM = new Material( {
    name: materialTantalumString,
    density: 16650
  } );
  Material.TITANIUM = new Material( {
    name: materialTitaniumString,
    density: 4500
  } );
  Material.WOOD = new Material( {
    name: materialWoodString,
    density: 400
  } );

  // @public {Material} - "Liquids".
  Material.AIR = new Material( {
    name: materialAirString,
    density: 1.2,
    viscosity: 0,
    liquidColor: DensityBuoyancyCommonColorProfile.materialAirProperty
  } );
  Material.DENSITY_P = new Material( {
    name: materialDensityPString,
    density: 200,
    liquidColor: DensityBuoyancyCommonColorProfile.materialDensityPProperty
  } );
  Material.DENSITY_Q = new Material( {
    name: materialDensityQString,
    density: 4000,
    liquidColor: DensityBuoyancyCommonColorProfile.materialDensityQProperty
  } );
  Material.DENSITY_R = new Material( {
    name: materialDensityRString,
    density: 200,
    liquidColor: DensityBuoyancyCommonColorProfile.materialDensityRProperty
  } );
  Material.DENSITY_S = new Material( {
    name: materialDensitySString,
    density: 4000,
    liquidColor: DensityBuoyancyCommonColorProfile.materialDensitySProperty
  } );
  Material.DENSITY_X = new Material( {
    name: materialDensityXString,
    density: 500,
    liquidColor: DensityBuoyancyCommonColorProfile.materialDensityXProperty
  } );
  Material.DENSITY_Y = new Material( {
    name: materialDensityYString,
    density: 5000,
    liquidColor: DensityBuoyancyCommonColorProfile.materialDensityYProperty
  } );
  Material.GASOLINE = new Material( {
    name: materialGasolineString,
    density: 680,
    viscosity: 6e-4,
    liquidColor: DensityBuoyancyCommonColorProfile.materialGasolineProperty
  } );
  Material.HONEY = new Material( {
    name: materialHoneyString,
    density: 1440,
    viscosity: 0.03, // TODO: actual value around 2.5, but we can get away with this for animation
    liquidColor: DensityBuoyancyCommonColorProfile.materialHoneyProperty
  } );
  Material.MERCURY = new Material( {
    name: materialMercuryString,
    density: 13593,
    viscosity: 1.53e-3,
    liquidColor: DensityBuoyancyCommonColorProfile.materialMercuryProperty
  } );
  Material.OIL = new Material( {
    name: materialOilString,
    density: 920,
    viscosity: 0.02, // Too much bigger and it won't work, not particularly physical
    liquidColor: DensityBuoyancyCommonColorProfile.materialOilProperty
  } );
  Material.SAND = new Material( {
    name: materialSandString,
    density: 1442,
    viscosity: 0.03, // Too much bigger and it won't work, not particularly physical
    liquidColor: DensityBuoyancyCommonColorProfile.materialSandProperty
  } );
  Material.SEAWATER = new Material( {
    name: materialSeawaterString,
    density: 1029,
    viscosity: 1.88e-3,
    liquidColor: DensityBuoyancyCommonColorProfile.materialSeawaterProperty
  } );
  Material.WATER = new Material( {
    name: materialWaterString,
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

  return densityBuoyancyCommon.register( 'Material', Material );
} );
