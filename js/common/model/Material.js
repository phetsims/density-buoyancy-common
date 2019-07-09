// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );

  // strings
  const materialAirString = require( 'string!DENSITY_BUOYANCY_COMMON/material.air' );
  const materialAluminumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.aluminum' );
  const materialBrickString = require( 'string!DENSITY_BUOYANCY_COMMON/material.brick' );
  const materialCopperString = require( 'string!DENSITY_BUOYANCY_COMMON/material.copper' );
  const materialCustomString = require( 'string!DENSITY_BUOYANCY_COMMON/material.custom' );
  const materialDensityXString = require( 'string!DENSITY_BUOYANCY_COMMON/material.densityX' );
  const materialDensityYString = require( 'string!DENSITY_BUOYANCY_COMMON/material.densityY' );
  const materialGasolineString = require( 'string!DENSITY_BUOYANCY_COMMON/material.gasoline' );
  const materialGlassString = require( 'string!DENSITY_BUOYANCY_COMMON/material.glass' );
  const materialHoneyString = require( 'string!DENSITY_BUOYANCY_COMMON/material.honey' );
  const materialHumanString = require( 'string!DENSITY_BUOYANCY_COMMON/material.human' );
  const materialIceString = require( 'string!DENSITY_BUOYANCY_COMMON/material.ice' );
  const materialMercuryString = require( 'string!DENSITY_BUOYANCY_COMMON/material.mercury' );
  const materialSeawaterString = require( 'string!DENSITY_BUOYANCY_COMMON/material.seawater' );
  const materialSteelString = require( 'string!DENSITY_BUOYANCY_COMMON/material.steel' );
  const materialStyrofoamString = require( 'string!DENSITY_BUOYANCY_COMMON/material.styrofoam' );
  const materialTitaniumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.titanium' );
  const materialWaterString = require( 'string!DENSITY_BUOYANCY_COMMON/material.water' );
  const materialWoodString = require( 'string!DENSITY_BUOYANCY_COMMON/material.wood' );

  class Material {
    /**
     * @param {Object} config
     */
    constructor( config ) {

      config = _.extend( {
        // {string}
        name: 'unknown',

        // {number} - in SI (kg/m^3)
        density: 1,

        // {number} - in SI (Pa * s). For reference a poise is 1e-2 Pa*s, and a centipoise is 1e-3 Pa*s.
        viscosity: 1e-3,

        // {boolean} - optional
        custom: false
      }, config );

      // @public {string}
      this.name = config.name;

      // @public {number}
      this.density = config.density;

      // @public {number}
      this.viscosity = config.viscosity;

      // @public {boolean}
      this.custom = config.custom;
    }

    /**
     * Returns a custom material that can be modified at will.
     * @public
     *
     * @param {Object} config
     * @returns {Material}
     */
    static createCustomMaterial( config ) {
      return new Material( _.extend( {
        name: materialCustomString,
        custom: true
      }, config ));
    }
  }

  // @public {Material} - "Solids"
  Material.ALUMINUM = new Material( {
    name: materialAluminumString,
    density: 2700
  } );
  Material.BRICK = new Material( {
    name: materialBrickString,
    density: 2000
  } );
  Material.COPPER = new Material( {
    name: materialCopperString,
    density: 2700
  } );
  Material.GLASS = new Material( {
    name: materialGlassString,
    density: 2700
  } );
  Material.HUMAN = new Material( {
    name: materialHumanString,
    density: 950
  } );
  Material.ICE = new Material( {
    name: materialIceString,
    density: 919
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
    viscosity: 0
  } );
  Material.DENSITY_X = new Material( {
    name: materialDensityXString,
    density: 500
  } );
  Material.DENSITY_Y = new Material( {
    name: materialDensityYString,
    density: 5000
  } );
  Material.GASOLINE = new Material( {
    name: materialGasolineString,
    density: 680,
    viscosity: 6e-4
  } );
  Material.HONEY = new Material( {
    name: materialHoneyString,
    density: 1440,
    viscosity: 2.5
  } );
  Material.MERCURY = new Material( {
    name: materialMercuryString,
    density: 13593,
    viscosity: 1.53e-3
  } );
  Material.SEAWATER = new Material( {
    name: materialSeawaterString,
    density: 1029,
    viscosity: 1.88e-3
  } );
  Material.WATER = new Material( {
    name: materialWaterString,
    density: 1000,
    viscosity: 8.9e-4
  } );

  // @public {Array.<Material>}
  Material.MATERIALS = [
    Material.AIR,
    Material.ALUMINUM,
    Material.BRICK,
    Material.COPPER,
    Material.DENSITY_X,
    Material.DENSITY_Y,
    Material.GASOLINE,
    Material.GLASS,
    Material.HONEY,
    Material.HUMAN,
    Material.ICE,
    Material.MERCURY,
    Material.SEAWATER,
    Material.STEEL,
    Material.STYROFOAM,
    Material.TITANIUM,
    Material.WATER,
    Material.WOOD
  ];

  return densityBuoyancyCommon.register( 'Material', Material );
} );
