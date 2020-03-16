// Copyright 2019-2020, University of Colorado Boulder

/**
 * Constants for the density/buoyancy sims
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import densityBuoyancyCommon from '../densityBuoyancyCommon.js';
import DensityBuoyancyCommonColorProfile from './view/DensityBuoyancyCommonColorProfile.js';

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
  RADIO_BUTTON_FONT: new PhetFont( {
    size: 16
  } ),
  COMBO_BOX_ITEM_FONT: new PhetFont( {
    size: 14
  } ),
  READOUT_FONT: new PhetFont( 14 ),

  // {Object}
  PANEL_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    fill: DensityBuoyancyCommonColorProfile.panelBackgroundProperty,
    xMargin: 10,
    yMargin: 10
  },

  // {Object}
  ACCORDION_BOX_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    titleYMargin: 5,
    buttonXMargin: 5,
    titleAlignX: 'left',
    fill: DensityBuoyancyCommonColorProfile.panelBackgroundProperty
  }
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonConstants', DensityBuoyancyCommonConstants );

export default DensityBuoyancyCommonConstants;