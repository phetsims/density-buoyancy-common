// Copyright 2019-2020, University of Colorado Boulder

/**
 * Colors for the density/buoyancy simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ColorProfile from '../../../../scenery-phet/js/ColorProfile.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import Color from '../../../../scenery/js/util/Color.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// Initial colors for each profile, by string key. Only profile currently is default (still helpful for making color
// tweaks with the top-level files)
const DensityBuoyancyCommonColorProfile = new ColorProfile( [ 'default' ], {
  // Color recommended in https://github.com/phetsims/density/issues/6#issuecomment-600911868
  panelBackground: { default: new Color( 240, 240, 240 ) },

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
  comparingPurple: { default: new Color( 131, 43, 126 ) },

  mysteryPink: { default: new Color( 255, 192, 203 ) },
  mysteryOrange: { default: new Color( 255, 127, 0 ) },
  mysteryLightPurple: { default: new Color( 177, 156, 217 ) },
  mysteryLightGreen: { default: new Color( 144, 238, 144 ) },
  mysteryBrown: { default: new Color( 150, 75, 0 ) },
  mysteryWhite: { default: new Color( 255, 255, 255 ) },
  mysteryGray: { default: new Color( 140, 140, 140 ) },
  mysteryMustard: { default: new Color( 225, 173, 0 ) },
  mysteryPeach: { default: new Color( 255, 229, 180 ) },
  mysteryMaroon: { default: new Color( 128, 0, 0 ) },

  chartHeader: { default: new Color( 230, 230, 230 ) },

  radioBorder: { default: PhetColorScheme.BUTTON_YELLOW },
  radioBackground: { default: Color.WHITE },

  // "liquid" material colors
  materialAir: { default: new Color( 0, 0, 0, 0 ) },
  materialCement: { default: new Color( 128, 130, 133 ) },
  materialCopper: { default: new Color( 184, 115, 51 ) },
  materialDensityP: { default: new Color( 255, 128, 128, 0.6 ) },
  materialDensityQ: { default: new Color( 128, 255, 128, 0.6 ) },
  materialDensityR: { default: new Color( 255, 128, 255, 0.6 ) },
  materialDensityS: { default: new Color( 128, 255, 255, 0.6 ) },
  materialDensityX: { default: new Color( 255, 255, 80, 0.6 ) },
  materialDensityY: { default: new Color( 80, 255, 255, 0.6 ) },
  materialGasoline: { default: new Color( 230, 255, 0, 0.4 ) },
  materialHoney: { default: new Color( 238, 170, 0, 0.8 ) },
  materialLead: { default: new Color( 80, 85, 90 ) },
  materialMercury: { default: new Color( 219, 206, 202 ) },
  materialOil: { default: new Color( 180, 230, 20, 0.4 ) },
  materialSand: { default: new Color( 194, 178, 128 ) },
  materialSeawater: { default: new Color( 0, 150, 255, 0.4 ) },
  materialWater: { default: new Color( 0, 128, 255, 0.4 ) }
} );

densityBuoyancyCommon.register( 'DensityBuoyancyCommonColorProfile', DensityBuoyancyCommonColorProfile );

export default DensityBuoyancyCommonColorProfile;