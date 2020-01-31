// Copyright 2019-2020, University of Colorado Boulder

/**
 * Constants for the density/buoyancy sims
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );

  const DensityBuoyancyCommonConstants = {
    // {number} - Used for margins from the offset of screens or between panels/boxes
    MARGIN: 10,

    // {Font}
    TITLE_FONT: new PhetFont( {
      size: 16,
      weight: 'bold'
    } )
  };

  densityBuoyancyCommon.register( 'DensityBuoyancyCommonConstants', DensityBuoyancyCommonConstants );

  return DensityBuoyancyCommonConstants;
} );
