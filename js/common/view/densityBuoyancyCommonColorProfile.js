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

  comparingYellowProperty: new ProfileColorProperty( 'comparingYellow', {
    default: new Color( 252, 246, 80 )
  } ),
  comparingBlueProperty: new ProfileColorProperty( 'comparingBlue', {
    default: new Color( 46, 88, 166 )
  } ),
  comparingGreenProperty: new ProfileColorProperty( 'comparingGreen', {
    default: new Color( 125, 195, 52 )
  } ),
  comparingRedProperty: new ProfileColorProperty( 'comparingRed', {
    default: new Color( 233, 55, 50 )
  } ),
  comparingPurpleProperty: new ProfileColorProperty( 'comparingPurple', {
    default: new Color( 131, 43, 126 )
  } ),

  mysteryPinkProperty: new ProfileColorProperty( 'mysteryPink', {
    default: new Color( 255, 192, 203 )
  } ),
  mysteryOrangeProperty: new ProfileColorProperty( 'mysteryOrange', {
    default: new Color( 255, 127, 0 )
  } ),
  mysteryLightPurpleProperty: new ProfileColorProperty( 'mysteryLightPurple', {
    default: new Color( 177, 156, 217 )
  } ),
  mysteryLightGreenProperty: new ProfileColorProperty( 'mysteryLightGreen', {
    default: new Color( 144, 238, 144 )
  } ),
  mysteryBrownProperty: new ProfileColorProperty( 'mysteryBrown', {
    default: new Color( 150, 75, 0 )
  } ),
  mysteryWhiteProperty: new ProfileColorProperty( 'mysteryWhite', {
    default: new Color( 255, 255, 255 )
  } ),
  mysteryGrayProperty: new ProfileColorProperty( 'mysteryGray', {
    default: new Color( 140, 140, 140 )
  } ),
  mysteryMustardProperty: new ProfileColorProperty( 'mysteryMustard', {
    default: new Color( 225, 173, 0 )
  } ),
  mysteryPeachProperty: new ProfileColorProperty( 'mysteryPeach', {
    default: new Color( 255, 229, 180 )
  } ),
  mysteryMaroonProperty: new ProfileColorProperty( 'mysteryMaroon', {
    default: new Color( 128, 0, 0 )
  } ),

  chartHeaderProperty: new ProfileColorProperty( 'chartHeader', {
    default: new Color( 230, 230, 230 )
  } ),

  radioBorderProperty: new ProfileColorProperty( 'radioBorder', {
    default: PhetColorScheme.BUTTON_YELLOW
  } ),
  radioBackgroundProperty: new ProfileColorProperty( 'radioBackground', {
    default: Color.WHITE
  } ),

  // "liquid" material colors
  materialAirProperty: new ProfileColorProperty( 'materialAir', {
    default: new Color( 0, 0, 0, 0 )
  }, {
    tandem: tandem.createTandem( 'materialAirProperty' )
  } ),
  materialCementProperty: new ProfileColorProperty( 'materialCement', {
    default: new Color( 128, 130, 133 )
  }, {
    tandem: tandem.createTandem( 'materialCementProperty' )
  } ),
  materialCopperProperty: new ProfileColorProperty( 'materialCopper', {
    default: new Color( 184, 115, 51 )
  }, {
    tandem: tandem.createTandem( 'materialCopperProperty' )
  } ),
  materialDensityPProperty: new ProfileColorProperty( 'materialDensityP', {
    default: new Color( 255, 128, 128, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityPProperty' )
  } ),
  materialDensityQProperty: new ProfileColorProperty( 'materialDensityQ', {
    default: new Color( 128, 255, 128, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityQProperty' )
  } ),
  materialDensityRProperty: new ProfileColorProperty( 'materialDensityR', {
    default: new Color( 255, 128, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityRProperty' )
  } ),
  materialDensitySProperty: new ProfileColorProperty( 'materialDensityS', {
    default: new Color( 128, 255, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensitySProperty' )
  } ),
  materialDensityXProperty: new ProfileColorProperty( 'materialDensityX', {
    default: new Color( 255, 255, 80, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityXProperty' )
  } ),
  materialDensityYProperty: new ProfileColorProperty( 'materialDensityY', {
    default: new Color( 80, 255, 255, 0.6 )
  }, {
    tandem: tandem.createTandem( 'materialDensityYProperty' )
  } ),
  materialGasolineProperty: new ProfileColorProperty( 'materialGasoline', {
    default: new Color( 230, 255, 0, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialGasolineProperty' )
  } ),
  materialHoneyProperty: new ProfileColorProperty( 'materialHoney', {
    default: new Color( 238, 170, 0, 0.8 )
  }, {
    tandem: tandem.createTandem( 'materialHoneyProperty' )
  } ),
  materialLeadProperty: new ProfileColorProperty( 'materialLead', {
    default: new Color( 80, 85, 90 )
  }, {
    tandem: tandem.createTandem( 'materialLeadProperty' )
  } ),
  materialMercuryProperty: new ProfileColorProperty( 'materialMercury', {
    default: new Color( 219, 206, 202 )
  }, {
    tandem: tandem.createTandem( 'materialMercuryProperty' )
  } ),
  materialOilProperty: new ProfileColorProperty( 'materialOil', {
    default: new Color( 180, 230, 20, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialOilProperty' )
  } ),
  materialSandProperty: new ProfileColorProperty( 'materialSand', {
    default: new Color( 194, 178, 128 )
  }, {
    tandem: tandem.createTandem( 'materialSandProperty' )
  } ),
  materialSeawaterProperty: new ProfileColorProperty( 'materialSeawater', {
    default: new Color( 0, 150, 255, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialSeawaterProperty' )
  } ),
  materialWaterProperty: new ProfileColorProperty( 'materialWater', {
    default: new Color( 0, 128, 255, 0.4 )
  }, {
    tandem: tandem.createTandem( 'materialWaterProperty' )
  } )
};

densityBuoyancyCommon.register( 'densityBuoyancyCommonColorProfile', densityBuoyancyCommonColorProfile );

export default densityBuoyancyCommonColorProfile;