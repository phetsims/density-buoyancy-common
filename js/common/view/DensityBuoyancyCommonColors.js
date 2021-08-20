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

const tandem = Tandem.GLOBAL_VIEW.createTandem( 'colorProfile' );

// Initial colors for each profile, by string key. Only profile currently is default (still helpful for making color
// tweaks with the top-level files)
const DensityBuoyancyCommonColors = {
  // Color recommended in https://github.com/phetsims/density/issues/6#issuecomment-600911868
  panelBackgroundProperty: new ProfileColorProperty( densityBuoyancyCommon, 'panelBackground', {
    default: new Color( 240, 240, 240 )
  } ),

  skyBottomProperty: new ProfileColorProperty( densityBuoyancyCommon, 'skyBottom', {
    default: new Color( 255, 255, 255 )
  } ),
  skyTopProperty: new ProfileColorProperty( densityBuoyancyCommon, 'skyTop', {
    default: new Color( 19, 165, 224 )
  } ),
  groundProperty: new ProfileColorProperty( densityBuoyancyCommon, 'ground', {
    default: new Color( 161, 101, 47 )
  } ),
  grassCloseProperty: new ProfileColorProperty( densityBuoyancyCommon, 'grassClose', {
    default: new Color( 107, 165, 75 )
  } ),
  grassFarProperty: new ProfileColorProperty( densityBuoyancyCommon, 'grassFar', {
    default: new Color( 107, 165, 75 ).colorUtilsDarker( 0.7 )
  } ),
  poolSurfaceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'poolSurface', {
    default: new Color( 170, 170, 170 )
  } ),

  waterIndicatorHighlightProperty: new ProfileColorProperty( densityBuoyancyCommon, 'waterIndicatorHighlight', {
    default: new Color( 255, 0, 0 )
  } ),

  contactForceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'contactForce', {
    default: new Color( 234, 150, 62 )
  } ),
  gravityForceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'gravityForce', {
    default: PhetColorScheme.GRAVITATIONAL_FORCE
  } ),
  buoyancyForceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'buoyancyForce', {
    default: new Color( 218, 51, 138 )
  } ),

  massLabelBackgroundProperty: new ProfileColorProperty( densityBuoyancyCommon, 'massLabelBackground', {
    default: Color.WHITE
  } ),

  labelAProperty: new ProfileColorProperty( densityBuoyancyCommon, 'labelA', {
    default: new Color( 237, 55, 50 )
  } ),
  labelBProperty: new ProfileColorProperty( densityBuoyancyCommon, 'labelB', {
    default: new Color( 48, 89, 166 )
  } ),

  comparingYellowColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'comparingYellow', {
    default: new Color( 252, 246, 80 )
  }, {
    tandem: tandem.createTandem( 'comparingYellowColorProperty' )
  } ),
  comparingBlueColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'comparingBlue', {
    default: new Color( 46, 88, 166 )
  }, {
    tandem: tandem.createTandem( 'comparingBlueColorProperty' )
  } ),
  comparingGreenColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'comparingGreen', {
    default: new Color( 125, 195, 52 )
  }, {
    tandem: tandem.createTandem( 'comparingGreenColorProperty' )
  } ),
  comparingRedColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'comparingRed', {
    default: new Color( 233, 55, 50 )
  }, {
    tandem: tandem.createTandem( 'comparingRedColorProperty' )
  } ),
  comparingPurpleColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'comparingPurple', {
    default: new Color( 131, 43, 126 )
  }, {
    tandem: tandem.createTandem( 'comparingPurpleColorProperty' )
  } ),

  mysteryPinkColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryPink', {
    default: new Color( 255, 192, 203 )
  }, {
    tandem: tandem.createTandem( 'mysteryPinkColorProperty' )
  } ),
  mysteryOrangeColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryOrange', {
    default: new Color( 255, 127, 0 )
  }, {
    tandem: tandem.createTandem( 'mysteryOrangeColorProperty' )
  } ),
  mysteryLightPurpleColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryLightPurple', {
    default: new Color( 177, 156, 217 )
  }, {
    tandem: tandem.createTandem( 'mysteryLightPurpleColorProperty' )
  } ),
  mysteryLightGreenColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryLightGreen', {
    default: new Color( 144, 238, 144 )
  }, {
    tandem: tandem.createTandem( 'mysteryLightGreenColorProperty' )
  } ),
  mysteryBrownColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryBrown', {
    default: new Color( 150, 75, 0 )
  }, {
    tandem: tandem.createTandem( 'mysteryBrownColorProperty' )
  } ),
  mysteryWhiteColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryWhite', {
    default: new Color( 255, 255, 255 )
  }, {
    tandem: tandem.createTandem( 'mysteryWhiteColorProperty' )
  } ),
  mysteryGrayColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryGray', {
    default: new Color( 140, 140, 140 )
  }, {
    tandem: tandem.createTandem( 'mysteryGrayColorProperty' )
  } ),
  mysteryMustardColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryMustard', {
    default: new Color( 225, 173, 0 )
  }, {
    tandem: tandem.createTandem( 'mysteryMustardColorProperty' )
  } ),
  mysteryPeachColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryPeach', {
    default: new Color( 255, 229, 180 )
  }, {
    tandem: tandem.createTandem( 'mysteryPeachColorProperty' )
  } ),
  mysteryMaroonColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryMaroon', {
    default: new Color( 128, 0, 0 )
  }, {
    tandem: tandem.createTandem( 'mysteryMaroonColorProperty' )
  } ),

  chartHeaderColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'chartHeader', {
    default: new Color( 230, 230, 230 )
  }, {
    tandem: tandem.createTandem( 'chartHeaderColorProperty' )
  } ),

  radioBorderColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'radioBorder', {
    default: PhetColorScheme.BUTTON_YELLOW
  }, {
    tandem: tandem.createTandem( 'radioBorderColorProperty' )
  } ),
  radioBackgroundColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'radioBackground', {
    default: Color.WHITE
  }, {
    tandem: tandem.createTandem( 'radioBackgroundColorProperty' )
  } ),

  // "liquid" material colors
  materialAirColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialAir', {
    default: new Color( 0, 0, 0, 0 )
  }, {
    tandem: tandem.createTandem( 'materialAirColorProperty' )
  } ),
  materialCementColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialCement', {
    default: new Color( 128, 130, 133 )
  }, {
    tandem: tandem.createTandem( 'materialCementColorProperty' )
  } ),
  materialCopperColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialCopper', {
    default: new Color( 184, 115, 51 )
  }, {
    tandem: tandem.createTandem( 'materialCopperColorProperty' )
  } ),
  materialDensityPColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityP', {
    default: new Color( 255, 128, 128, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityPColorProperty' )
  } ),
  materialDensityQColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityQ', {
    default: new Color( 128, 255, 128, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityQColorProperty' )
  } ),
  materialDensityRColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityR', {
    default: new Color( 255, 128, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityRColorProperty' )
  } ),
  materialDensitySColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityS', {
    default: new Color( 128, 255, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensitySColorProperty' )
  } ),
  materialDensityXColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityX', {
    default: new Color( 255, 255, 80, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityXColorProperty' )
  } ),
  materialDensityYColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityY', {
    default: new Color( 80, 255, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityYColorProperty' )
  } ),
  materialGasolineColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialGasoline', {
    default: new Color( 230, 255, 0, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialGasolineColorProperty' )
  } ),
  materialHoneyColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialHoney', {
    default: new Color( 238, 170, 0, 0.8 )
  }, {
    tandem: tandem.createTandem( 'materialHoneyColorProperty' )
  } ),
  materialLeadColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialLead', {
    default: new Color( 80, 85, 90 )
  }, {
    tandem: tandem.createTandem( 'materialLeadColorProperty' )
  } ),
  materialMercuryColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialMercury', {
    default: new Color( 219, 206, 202 )
  }, {
    tandem: tandem.createTandem( 'materialMercuryColorProperty' )
  } ),
  materialOilColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialOil', {
    default: new Color( 180, 230, 20, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialOilColorProperty' )
  } ),
  materialSandColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialSand', {
    default: new Color( 194, 178, 128 )
  }, {
    tandem: tandem.createTandem( 'materialSandColorProperty' )
  } ),
  materialSeawaterColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialSeawater', {
    default: new Color( 0, 150, 255, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialSeawaterColorProperty' )
  } ),
  materialWaterColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialWater', {
    default: new Color( 0, 128, 255, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialWaterColorProperty' )
  } )
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonColors', DensityBuoyancyCommonColors );

export default DensityBuoyancyCommonColors;