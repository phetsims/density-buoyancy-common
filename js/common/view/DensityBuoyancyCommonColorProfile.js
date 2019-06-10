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
    skyBottom: { default: new Color( 174, 205, 220 ) },

    waterIndicatorHighlight: { default: new Color( 255, 0, 0 ) }
  } );

  densityBuoyancyCommon.register( 'DensityBuoyancyCommonColorProfile', DensityBuoyancyCommonColorProfile );

  return DensityBuoyancyCommonColorProfile;
} );
