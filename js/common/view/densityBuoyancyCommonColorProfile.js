// Copyright 2019-2021, University of Colorado Boulder

/**
 * Colors for the density/buoyancy simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import Color from '../../../../scenery/js/util/Color.js';
import ProfileColorProperty from '../../../../scenery/js/util/ProfileColorProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// TODO: couldn't grab this from colorProfileProperty or another section when created, figure out how to find a better
// reference
const tandem = Tandem.GLOBAL_VIEW.createTandem( 'colorProfile' );

// Initial colors for each profile, by string key. Only profile currently is default (still helpful for making color
// tweaks with the top-level files)
const densityBuoyancyCommonColorProfile = {
  // Color recommended in https://github.com/phetsims/density/issues/6#issuecomment-600911868
  panelBackgroundProperty: new ProfileColorProperty( 'panelBackground', {
    default: new Color( 240, 240, 240 )
  } ),

  skyBottomProperty: new ProfileColorProperty( 'skyBottom', {
    default: new Color( 255, 255, 255 )
  } ),
  skyTopProperty: new ProfileColorProperty( 'skyTop', {
    default: new Color( 19, 165, 224 )
  } ),
  groundProperty: new ProfileColorProperty( 'ground', {
    default: new Color( 161, 101, 47 )
  } ),
  grassCloseProperty: new ProfileColorProperty( 'grassClose', {
    default: new Color( 107, 165, 75 )
  } ),
  grassFarProperty: new ProfileColorProperty( 'grassFar', {
    default: new Color( 107, 165, 75 ).colorUtilsDarker( 0.7 )
  } ),
  poolSurfaceProperty: new ProfileColorProperty( 'poolSurface', {
    default: new Color( 170, 170, 170 )
  } ),

  waterIndicatorHighlightProperty: new ProfileColorProperty( 'waterIndicatorHighlight', {
    default: new Color( 255, 0, 0 )
  } ),

  contactForceProperty: new ProfileColorProperty( 'contactForce', {
    default: new Color( 234, 150, 62 )
  } ),
  gravityForceProperty: new ProfileColorProperty( 'gravityForce', {
    default: new Color( 41, 59, 139 )
  } ),
  buoyancyForceProperty: new ProfileColorProperty( 'buoyancyForce', {
    default: new Color( 218, 51, 138 )
  } ),

  massLabelBackgroundProperty: new ProfileColorProperty( 'massLabelBackground', {
    default: Color.WHITE
  } ),

  labelAProperty: new ProfileColorProperty( 'labelA', {
    default: new Color( 237, 55, 50 )
  } ),
  labelBProperty: new ProfileColorProperty( 'labelB', {
    default: new Color( 48, 89, 166 )
  } ),

  comparingYellowColorProperty: new ProfileColorProperty( 'comparingYellow', {
    default: new Color( 252, 246, 80 )
  }, {
    tandem: tandem.createTandem( 'comparingYellowColorProperty' )
  } ),
  comparingBlueColorProperty: new ProfileColorProperty( 'comparingBlue', {
    default: new Color( 46, 88, 166 )
  }, {
    tandem: tandem.createTandem( 'comparingBlueColorProperty' )
  } ),
  comparingGreenColorProperty: new ProfileColorProperty( 'comparingGreen', {
    default: new Color( 125, 195, 52 )
  }, {
    tandem: tandem.createTandem( 'comparingGreenColorProperty' )
  } ),
  comparingRedColorProperty: new ProfileColorProperty( 'comparingRed', {
    default: new Color( 233, 55, 50 )
  }, {
    tandem: tandem.createTandem( 'comparingRedColorProperty' )
  } ),
  comparingPurpleColorProperty: new ProfileColorProperty( 'comparingPurple', {
    default: new Color( 131, 43, 126 )
  }, {
    tandem: tandem.createTandem( 'comparingPurpleColorProperty' )
  } ),

  mysteryPinkColorProperty: new ProfileColorProperty( 'mysteryPink', {
    default: new Color( 255, 192, 203 )
  }, {
    tandem: tandem.createTandem( 'mysteryPinkColorProperty' )
  } ),
  mysteryOrangeColorProperty: new ProfileColorProperty( 'mysteryOrange', {
    default: new Color( 255, 127, 0 )
  }, {
    tandem: tandem.createTandem( 'mysteryOrangeColorProperty' )
  } ),
  mysteryLightPurpleColorProperty: new ProfileColorProperty( 'mysteryLightPurple', {
    default: new Color( 177, 156, 217 )
  }, {
    tandem: tandem.createTandem( 'mysteryLightPurpleColorProperty' )
  } ),
  mysteryLightGreenColorProperty: new ProfileColorProperty( 'mysteryLightGreen', {
    default: new Color( 144, 238, 144 )
  }, {
    tandem: tandem.createTandem( 'mysteryLightGreenColorProperty' )
  } ),
  mysteryBrownColorProperty: new ProfileColorProperty( 'mysteryBrown', {
    default: new Color( 150, 75, 0 )
  }, {
    tandem: tandem.createTandem( 'mysteryBrownColorProperty' )
  } ),
  mysteryWhiteColorProperty: new ProfileColorProperty( 'mysteryWhite', {
    default: new Color( 255, 255, 255 )
  }, {
    tandem: tandem.createTandem( 'mysteryWhiteColorProperty' )
  } ),
  mysteryGrayColorProperty: new ProfileColorProperty( 'mysteryGray', {
    default: new Color( 140, 140, 140 )
  }, {
    tandem: tandem.createTandem( 'mysteryGrayColorProperty' )
  } ),
  mysteryMustardColorProperty: new ProfileColorProperty( 'mysteryMustard', {
    default: new Color( 225, 173, 0 )
  }, {
    tandem: tandem.createTandem( 'mysteryMustardColorProperty' )
  } ),
  mysteryPeachColorProperty: new ProfileColorProperty( 'mysteryPeach', {
    default: new Color( 255, 229, 180 )
  }, {
    tandem: tandem.createTandem( 'mysteryPeachColorProperty' )
  } ),
  mysteryMaroonColorProperty: new ProfileColorProperty( 'mysteryMaroon', {
    default: new Color( 128, 0, 0 )
  }, {
    tandem: tandem.createTandem( 'mysteryMaroonColorProperty' )
  } ),

  chartHeaderColorProperty: new ProfileColorProperty( 'chartHeader', {
    default: new Color( 230, 230, 230 )
  }, {
    tandem: tandem.createTandem( 'chartHeaderColorProperty' )
  } ),

  radioBorderColorProperty: new ProfileColorProperty( 'radioBorder', {
    default: PhetColorScheme.BUTTON_YELLOW
  }, {
    tandem: tandem.createTandem( 'radioBorderColorProperty' )
  } ),
  radioBackgroundColorProperty: new ProfileColorProperty( 'radioBackground', {
    default: Color.WHITE
  }, {
    tandem: tandem.createTandem( 'radioBackgroundColorProperty' )
  } ),

  // "liquid" material colors
  materialAirColorProperty: new ProfileColorProperty( 'materialAir', {
    default: new Color( 0, 0, 0, 0 )
  }, {
    tandem: tandem.createTandem( 'materialAirColorProperty' )
  } ),
  materialCementColorProperty: new ProfileColorProperty( 'materialCement', {
    default: new Color( 128, 130, 133 )
  }, {
    tandem: tandem.createTandem( 'materialCementColorProperty' )
  } ),
  materialCopperColorProperty: new ProfileColorProperty( 'materialCopper', {
    default: new Color( 184, 115, 51 )
  }, {
    tandem: tandem.createTandem( 'materialCopperColorProperty' )
  } ),
  materialDensityPColorProperty: new ProfileColorProperty( 'materialDensityP', {
    default: new Color( 255, 128, 128, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityPColorProperty' )
  } ),
  materialDensityQColorProperty: new ProfileColorProperty( 'materialDensityQ', {
    default: new Color( 128, 255, 128, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityQColorProperty' )
  } ),
  materialDensityRColorProperty: new ProfileColorProperty( 'materialDensityR', {
    default: new Color( 255, 128, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityRColorProperty' )
  } ),
  materialDensitySColorProperty: new ProfileColorProperty( 'materialDensityS', {
    default: new Color( 128, 255, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensitySColorProperty' )
  } ),
  materialDensityXColorProperty: new ProfileColorProperty( 'materialDensityX', {
    default: new Color( 255, 255, 80, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityXColorProperty' )
  } ),
  materialDensityYColorProperty: new ProfileColorProperty( 'materialDensityY', {
    default: new Color( 80, 255, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityYColorProperty' )
  } ),
  materialGasolineColorProperty: new ProfileColorProperty( 'materialGasoline', {
    default: new Color( 230, 255, 0, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialGasolineColorProperty' )
  } ),
  materialHoneyColorProperty: new ProfileColorProperty( 'materialHoney', {
    default: new Color( 238, 170, 0, 0.8 )
  }, {
    tandem: tandem.createTandem( 'materialHoneyColorProperty' )
  } ),
  materialLeadColorProperty: new ProfileColorProperty( 'materialLead', {
    default: new Color( 80, 85, 90 )
  }, {
    tandem: tandem.createTandem( 'materialLeadColorProperty' )
  } ),
  materialMercuryColorProperty: new ProfileColorProperty( 'materialMercury', {
    default: new Color( 219, 206, 202 )
  }, {
    tandem: tandem.createTandem( 'materialMercuryColorProperty' )
  } ),
  materialOilColorProperty: new ProfileColorProperty( 'materialOil', {
    default: new Color( 180, 230, 20, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialOilColorProperty' )
  } ),
  materialSandColorProperty: new ProfileColorProperty( 'materialSand', {
    default: new Color( 194, 178, 128 )
  }, {
    tandem: tandem.createTandem( 'materialSandColorProperty' )
  } ),
  materialSeawaterColorProperty: new ProfileColorProperty( 'materialSeawater', {
    default: new Color( 0, 150, 255, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialSeawaterColorProperty' )
  } ),
  materialWaterColorProperty: new ProfileColorProperty( 'materialWater', {
    default: new Color( 0, 128, 255, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialWaterColorProperty' )
  } )
};

densityBuoyancyCommon.register( 'densityBuoyancyCommonColorProfile', densityBuoyancyCommonColorProfile );

export default densityBuoyancyCommonColorProfile;