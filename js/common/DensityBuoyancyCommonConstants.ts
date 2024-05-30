// Copyright 2019-2024, University of Colorado Boulder

/**
 * Constants for the density/buoyancy sims
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Vector3 from '../../../dot/js/Vector3.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import densityBuoyancyCommon from '../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../DensityBuoyancyCommonStrings.js';
import Material from './model/Material.js';
import DensityBuoyancyCommonColors from './view/DensityBuoyancyCommonColors.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import DensityBuoyancyCommonPreferences from './model/DensityBuoyancyCommonPreferences.js';
import { VolumeUnits } from './DensityBuoyancyCommonQueryParameters.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { DEFAULT_FILL, DEFAULT_FILL_HIGHLIGHTED } from '../../../sun/js/SliderThumb.js';
import Vector2 from '../../../dot/js/Vector2.js';

const CORNER_RADIUS = 5;
const litersPatternStringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.litersPatternStringProperty, {
  liters: '{{value}}'
}, { tandem: Tandem.OPT_OUT } );
const decimetersCubedPatternStringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.decimetersCubedPatternStringProperty, {
  decimetersCubed: '{{value}}'
}, { tandem: Tandem.OPT_OUT } );

// Used for margins from the offset of screens or between panels/boxes or content margins of panels/boxes.
const MARGIN = 10;

// A value applied across the code to prevent unexpected rounding errors.
const TOLERANCE = 1e-7;

// Returns the number of decimal places to show for a given value. 1 for big values, 2 for smaller. i.e. 11.1 vs 1.11
export const chooseDecimalPlaces = ( value: number ): number => {
  return value >= 10 ? 1 : 2;
};

const DensityBuoyancyCommonConstants = {
  MARGIN: MARGIN,

  MARGIN_SMALL: MARGIN / 2,

  // (read-only) {number} - Used for panels/boxes by default
  CORNER_RADIUS: CORNER_RADIUS,

  // (read-only) {Font}
  TITLE_FONT: new PhetFont( {
    size: 16,
    weight: 'bold'
  } ),
  ITEM_FONT: new PhetFont( {
    size: 14,
    weight: 'bold'
  } ),
  RADIO_BUTTON_FONT: new PhetFont( {
    size: 16
  } ),
  COMBO_BOX_ITEM_FONT: new PhetFont( {
    size: 14
  } ),
  READOUT_FONT: new PhetFont( 14 ),

  THUMB_SIZE: new Dimension2( 13, 22 ),
  THUMB_FILL: DEFAULT_FILL,
  THUMB_HIGHLIGHT_FILL: DEFAULT_FILL_HIGHLIGHTED,

  ARROW_BUTTON_SCALE: 0.6,

  POOL_SCALE_INITIAL_HEIGHT: 0.75,

  TOLERANCE: TOLERANCE,

  // Not really used in Buoyancy, just Density
  MIN_CUBE_VOLUME: 0.001 - TOLERANCE,
  MAX_CUBE_VOLUME: 0.01 + TOLERANCE,

  // (read-only) {Object}
  PANEL_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    fill: DensityBuoyancyCommonColors.panelBackgroundProperty,
    xMargin: MARGIN,
    yMargin: MARGIN
  },

  // (read-only) {Object}
  ACCORDION_BOX_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    titleYMargin: 5,
    buttonXMargin: 5,
    contentXMargin: MARGIN,
    titleAlignX: 'left',
    fill: DensityBuoyancyCommonColors.panelBackgroundProperty
  } as const,

  // (read-only) {Vector3} cameraLookAt locations
  DENSITY_CAMERA_LOOK_AT: Vector3.ZERO,
  BUOYANCY_CAMERA_LOOK_AT: new Vector3( 0, -0.18, 0 ),
  BUOYANCY_BASICS_CAMERA_LOOK_AT: new Vector3( 0, -0.1, 0 ),

  // Shift on the screen view with respect to the camera's view
  BUOYANCY_BASICS_VIEW_OFFSET: new Vector2( -25, 0 ),

  // {Array.<Material>}
  DENSITY_MYSTERY_MATERIALS: [
    Material.WOOD,
    Material.GASOLINE,
    Material.APPLE,
    Material.ICE,
    Material.HUMAN,
    Material.WATER,
    Material.GLASS,
    Material.DIAMOND,
    Material.TITANIUM,
    Material.STEEL,
    Material.COPPER,
    Material.LEAD,
    Material.GOLD
  ],

  SIMPLE_MASS_MATERIALS: [
    Material.STYROFOAM,
    Material.WOOD,
    Material.ICE,
    Material.PVC,
    Material.BRICK,
    Material.ALUMINUM
  ],

  BUOYANCY_FLUID_MATERIALS: [
    Material.GASOLINE,
    Material.OIL,
    Material.WATER,
    Material.SEAWATER,
    Material.HONEY,
    Material.MERCURY
  ],

  BUOYANCY_FLUID_MYSTERY_MATERIALS: [
    Material.DENSITY_A,
    Material.DENSITY_B,
    Material.DENSITY_C,
    Material.DENSITY_D,
    Material.DENSITY_E,
    Material.DENSITY_F
  ],

  // In m^3, the value that we want the initial liquid volume to be (including the displacement of any volumes in the pool).
  DESIRED_STARTING_POOL_VOLUME: 0.1,

  // Model units for volume are most likely in m^3, multiply by this to convert to liters.
  // TODO: likely many more usages of "1000" in this repo should use this, https://github.com/phetsims/density-buoyancy-common/issues/95
  LITERS_IN_CUBIC_METER: 1000,

  VOLUME_PATTERN_STRING_PROPERTY: new DerivedProperty( [
    DensityBuoyancyCommonPreferences.volumeUnitsProperty,
    litersPatternStringProperty,
    decimetersCubedPatternStringProperty
  ], ( units: VolumeUnits, litersPatternString, decimetersCubedPatternString ) => {
    return units === 'liters' ? litersPatternString : decimetersCubedPatternString;
  } ),
  KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY: new DerivedProperty( [
    DensityBuoyancyCommonPreferences.volumeUnitsProperty,
    DensityBuoyancyCommonStrings.kilogramsPerLiterPatternStringProperty,
    DensityBuoyancyCommonStrings.kilogramsPerDecimeterCubedPatternStringProperty
  ], ( units: VolumeUnits, kilogramsPerLiterPatternString, kilogramsPerDecimeterCubedPatternString ) => {
    return units === 'liters' ? kilogramsPerLiterPatternString : kilogramsPerDecimeterCubedPatternString;
  } ),
  KILOGRAMS_PATTERN_STRING_PROPERTY: new PatternStringProperty( DensityBuoyancyCommonStrings.kilogramsPatternStringProperty, {
    kilograms: '{{value}}'
  }, { tandem: Tandem.OPT_OUT } ),
  GRAB_RELEASE_SOUND_CLIP_OPTIONS: {
    initialOutputLevel: 0.4
  }
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonConstants', DensityBuoyancyCommonConstants );

export default DensityBuoyancyCommonConstants;