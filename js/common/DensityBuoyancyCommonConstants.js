// Copyright 2019-2021, University of Colorado Boulder

/**
 * Constants for the density/buoyancy sims
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import densityBuoyancyCommon from '../densityBuoyancyCommon.js';
import densityBuoyancyCommonColorProfile from './view/densityBuoyancyCommonColorProfile.js';

const CORNER_RADIUS = 5;

const DensityBuoyancyCommonConstants = {
  // @public {number} - Used for margins from the offset of screens or between panels/boxes
  MARGIN: 10,

  // @public {number} - Used for panels/boxes by default
  CORNER_RADIUS: CORNER_RADIUS,

  // @public {Font}
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

  // @public {Object}
  PANEL_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    fill: densityBuoyancyCommonColorProfile.panelBackgroundProperty,
    xMargin: 10,
    yMargin: 10
  },

  // @public {Object}
  ACCORDION_BOX_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    titleYMargin: 5,
    buttonXMargin: 5,
    titleAlignX: 'left',
    fill: densityBuoyancyCommonColorProfile.panelBackgroundProperty
  }
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonConstants', DensityBuoyancyCommonConstants );

export default DensityBuoyancyCommonConstants;