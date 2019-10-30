// Copyright 2019, University of Colorado Boulder

/**
 * Colors for the density/buoyancy simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const ColorProfile = require( 'SCENERY_PHET/ColorProfile' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );

  // Initial colors for each profile, by string key. Only profile currently is default (still helpful for making color
  // tweaks with the top-level files)
  const DensityBuoyancyCommonColorProfile = new ColorProfile( [ 'default' ], {
    skyBottom: { default: new Color( 255, 255, 255 ) },
    skyTop: { default: new Color( 19, 165, 224 ) },
    ground: { default: new Color( 161, 101, 47 ) },
    grassClose: { default: new Color( 107, 165, 75 ) },
    grassFar: { default: new Color( 107, 165, 75 ).colorUtilsDarker( 0.7 ) },
    poolSurface: { default: new Color( 170, 170, 170 ) },

    waterIndicatorHighlight: { default: new Color( 255, 0, 0 ) },

    contactForce: { default: new Color( 234, 150, 62 ) },
    gravityForce: { default: new Color( 41, 59, 139 ) },
    buoyancyForce: { default: new Color( 218, 51, 138 ) },

    massLabelBackground: { default: Color.WHITE },

    labelA: { default: new Color( 237, 55, 50 ) },
    labelB: { default: new Color( 48, 89, 166 ) },

    comparingYellow: { default: new Color( 252, 246, 80 ) },
    comparingBlue: { default: new Color( 46, 88, 166 ) },
    comparingGreen: { default: new Color( 125, 195, 52 ) },
    comparingRed: { default: new Color( 233, 55, 50 ) },
    comparingPurple: { default: new Color( 131, 43, 126 ) }
  } );

  densityBuoyancyCommon.register( 'DensityBuoyancyCommonColorProfile', DensityBuoyancyCommonColorProfile );

  return DensityBuoyancyCommonColorProfile;
} );
