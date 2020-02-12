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

  const CORNER_RADIUS = 5;

  const DensityBuoyancyCommonConstants = {
    // {number} - Used for margins from the offset of screens or between panels/boxes
    MARGIN: 10,

    // {number} - Used for panels/boxes by default
    CORNER_RADIUS: CORNER_RADIUS,

    // {Font}
    TITLE_FONT: new PhetFont( {
      size: 16,
      weight: 'bold'
    } ),
    COMBO_BOX_ITEM_FONT: new PhetFont( {
      size: 14
    } ),
    READOUT_FONT: new PhetFont( 14 ),

    // {Object}
    PANEL_OPTIONS: {
      cornerRadius: CORNER_RADIUS,
      xMargin: 10,
      yMargin: 10
    }
  };

  densityBuoyancyCommon.register( 'DensityBuoyancyCommonConstants', DensityBuoyancyCommonConstants );

  return DensityBuoyancyCommonConstants;
} );
