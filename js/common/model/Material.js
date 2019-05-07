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
  const materialGlassString = require( 'string!DENSITY_BUOYANCY_COMMON/material.glass' );
  const materialHumanString = require( 'string!DENSITY_BUOYANCY_COMMON/material.human' );
  const materialIceString = require( 'string!DENSITY_BUOYANCY_COMMON/material.ice' );
  const materialSteelString = require( 'string!DENSITY_BUOYANCY_COMMON/material.steel' );
  const materialStyrofoamString = require( 'string!DENSITY_BUOYANCY_COMMON/material.styrofoam' );
  const materialTitaniumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.titanium' );
  const materialWoodString = require( 'string!DENSITY_BUOYANCY_COMMON/material.wood' );
  const materialWaterString = require( 'string!DENSITY_BUOYANCY_COMMON/material.water' );

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

        // {number} - in SI (Pa * s)
        viscosity: 1000,

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
  }

  Material.AIR = new Material( {
    name: materialAirString,
    density: 1.2
  } );
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
  Material.WATER = new Material( {
    name: materialWaterString,
    density: 1000,
    viscosity: 890
  } );
  Material.WOOD = new Material( {
    name: materialWoodString,
    density: 400
  } );

  Material.MATERIALS = [
    Material.AIR,
    Material.ALUMINUM,
    Material.BRICK,
    Material.COPPER,
    Material.GLASS,
    Material.HUMAN,
    Material.ICE,
    Material.STEEL,
    Material.STYROFOAM,
    Material.TITANIUM,
    Material.WATER,
    Material.WOOD
  ];

  return densityBuoyancyCommon.register( 'Material', Material );
} );
