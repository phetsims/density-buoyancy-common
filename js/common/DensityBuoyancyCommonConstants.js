// Copyright 2019-2021, University of Colorado Boulder

/**
 * Constants for the density/buoyancy sims
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../dot/js/Vector3.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import densityBuoyancyCommon from '../densityBuoyancyCommon.js';
import DensityBuoyancyCommonColors from './view/DensityBuoyancyCommonColors.js';

const CORNER_RADIUS = 5;

const DensityBuoyancyCommonConstants = {
  // @public (read-only) {number} - Used for margins from the offset of screens or between panels/boxes
  MARGIN: 10,

  // @public (read-only) {number} - Used for panels/boxes by default
  CORNER_RADIUS: CORNER_RADIUS,

  // @public (read-only) {Font}
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

  // @public (read-only) {Object}
  PANEL_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    fill: DensityBuoyancyCommonColors.panelBackgroundProperty,
    xMargin: 10,
    yMargin: 10
  },

  // @public (read-only) {Object}
  ACCORDION_BOX_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    titleYMargin: 5,
    buttonXMargin: 5,
    titleAlignX: 'left',
    fill: DensityBuoyancyCommonColors.panelBackgroundProperty
  },

  // @public (read-only) {Vector3} cameraLookAt locations
  DENSITY_CAMERA_LOOK_AT: Vector3.ZERO,
  BUOYANCY_CAMERA_LOOK_AT: new Vector3( 0, -0.18, 0 )
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonConstants', DensityBuoyancyCommonConstants );

export default DensityBuoyancyCommonConstants;