// Copyright 2019-2024, University of Colorado Boulder

/**
 * Colors for the density/buoyancy simulations.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import packageJSON from '../../../../joist/js/packageJSON.js';

const tandem = Tandem.COLORS;
const packageName = packageJSON.name;

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
    default: new Color( 230, 230, 80 )
  } ),
  poolSurfaceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'poolSurface', {
    default: new Color( 183, 159, 159 )
  } ),

  fluidIndicatorHighlightProperty: new ProfileColorProperty( densityBuoyancyCommon, 'fluidIndicatorHighlight', {
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

  tagAProperty: new ProfileColorProperty( densityBuoyancyCommon, 'tagA', {
    default: new Color( 237, 55, 50 )
  } ),
  tagBProperty: new ProfileColorProperty( densityBuoyancyCommon, 'tagB', {
    default: new Color( 48, 89, 166 )
  } ),

  compareYellowColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareYellow', {
    default: new Color( 252, 246, 80 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'compareYellowColorProperty' ) : Tandem.OPT_OUT
  } ),
  compareBlueColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareBlue', {
    default: new Color( 46, 88, 166 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'compareBlueColorProperty' ) : Tandem.OPT_OUT
  } ),
  compareGreenColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareGreen', {
    default: new Color( 125, 195, 52 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'compareGreenColorProperty' ) : Tandem.OPT_OUT
  } ),
  compareOchreColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareOchre', {
    default: new Color( 160, 140, 0 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'compareOchreColorProperty' ) : Tandem.OPT_OUT
  } ),
  compareRedColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareRed', {
    default: new Color( 233, 55, 50 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'compareRedColorProperty' ) : Tandem.OPT_OUT
  } ),
  comparePurpleColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'comparePurple', {
    default: new Color( 131, 43, 126 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'comparePurpleColorProperty' ) : Tandem.OPT_OUT
  } ),

  mysteryPinkColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryPink', {
    default: new Color( 255, 192, 203 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryPinkColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryOrangeColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryOrange', {
    default: new Color( 255, 127, 0 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryOrangeColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryLightPurpleColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryLightPurple', {
    default: new Color( 177, 156, 217 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryLightPurpleColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryLightGreenColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryLightGreen', {
    default: new Color( 144, 238, 144 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryLightGreenColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryBrownColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryBrown', {
    default: new Color( 150, 75, 0 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryBrownColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryWhiteColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryWhite', {
    default: new Color( 255, 255, 255 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryWhiteColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryGrayColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryGray', {
    default: new Color( 140, 140, 140 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryGrayColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryMustardColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryMustard', {
    default: new Color( 225, 173, 0 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryMustardColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryPeachColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryPeach', {
    default: new Color( 255, 229, 180 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryPeachColorProperty' ) : Tandem.OPT_OUT
  } ),
  mysteryMaroonColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryMaroon', {
    default: new Color( 128, 0, 0 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? tandem.createTandem( 'mysteryMaroonColorProperty' ) : Tandem.OPT_OUT
  } ),

  chartHeaderColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'chartHeader', {
    default: new Color( 230, 230, 230 )
  } ),

  radioBorderColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'radioBorder', {
    default: PhetColorScheme.BUTTON_YELLOW
  } ),
  radioBackgroundColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'radioBackground', {
    default: Color.WHITE
  } ),

  // "liquid" material colors
  materialConcreteColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialConcrete', {
    default: new Color( 128, 130, 133 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialConcreteColorProperty' )
  } ),
  materialCopperColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialCopper', {
    default: new Color( 184, 115, 51 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialCopperColorProperty' )
  } ),
  materialDensityAColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityA', {
    default: new Color( 255, 255, 80, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityAColorProperty' )
  } ),
  materialDensityBColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityB', {
    default: new Color( 80, 255, 255, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityBColorProperty' )
  } ),
  materialDensityCColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityC', {
    default: new Color( 255, 128, 255, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityCColorProperty' )
  } ),
  materialDensityDColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityD', {
    default: new Color( 128, 255, 255, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityDColorProperty' )
  } ),
  materialDensityEColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityE', {
    default: new Color( 255, 128, 128, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityEColorProperty' )
  } ),
  materialDensityFColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityF', {
    default: new Color( 128, 255, 128, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityFColorProperty' )
  } ),
  materialGasolineColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialGasoline', {
    default: new Color( 230, 255, 0, 0.4 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialGasolineColorProperty' )
  } ),
  materialHoneyColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialHoney', {
    default: new Color( 238, 170, 0, 0.5 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialHoneyColorProperty' )
  } ),
  materialMercuryColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialMercury', {
    default: new Color( 219, 206, 202, 0.8 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialMercuryColorProperty' )
  } ),
  materialOilColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialOil', {
    default: new Color( 180, 230, 20, 0.4 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialOilColorProperty' )
  } ),
  materialSandColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialSand', {
    default: new Color( 194, 178, 128 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialSandColorProperty' )
  } ),
  materialSeawaterColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialSeawater', {
    default: new Color( 0, 150, 255, 0.4 )
  }, {
    phetioReadOnly: true,
    tandem: packageName === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialSeawaterColorProperty' )
  } ),
  materialWaterColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialWater', {
    default: new Color( 0, 128, 255, 0.4 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'materialWaterColorProperty' )
  } ),
  materialRColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialR', {
    default: new Color( 'rgba(255,115,0,0.61)' )
  } ),
  materialSColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialS', {
    default: new Color( 'rgba(255,16,223,0.5)' )
  } ),
  customFluidLightColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'customFluidLight', {
    default: new Color( 255, 255, 255, 0.3 )
  } ),
  customFluidDarkColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'customFluidDark', {
    default: new Color( 0, 30, 255, 0.6 )
  } ),

  depthLinesDarkColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'depthLinesDark', {
    default: Color.DARK_GRAY
  } ),
  depthLinesLightColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'depthLinesLight', {
    default: Color.LIGHT_GRAY
  } )
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonColors', DensityBuoyancyCommonColors );

export default DensityBuoyancyCommonColors;