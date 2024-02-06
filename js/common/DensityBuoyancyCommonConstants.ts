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

const CORNER_RADIUS = 5;
const litersPatternStringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.litersPatternStringProperty, {
  liters: '{{value}}'
}, { tandem: Tandem.OPT_OUT } );
const decimetersCubedPatternStringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.decimetersCubedPatternStringProperty, {
  decimetersCubed: '{{value}}'
}, { tandem: Tandem.OPT_OUT } );

const DensityBuoyancyCommonConstants = {
  // (read-only) {number} - Used for margins from the offset of screens or between panels/boxes
  MARGIN: 10,

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

  // (read-only) {Object}
  PANEL_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    fill: DensityBuoyancyCommonColors.panelBackgroundProperty,
    xMargin: 10,
    yMargin: 10
  },

  // (read-only) {Object}
  ACCORDION_BOX_OPTIONS: {
    cornerRadius: CORNER_RADIUS,
    titleYMargin: 5,
    buttonXMargin: 5,
    titleAlignX: 'left',
    fill: DensityBuoyancyCommonColors.panelBackgroundProperty
  } as const,

  // (read-only) {Vector3} cameraLookAt locations
  DENSITY_CAMERA_LOOK_AT: Vector3.ZERO,
  BUOYANCY_CAMERA_LOOK_AT: new Vector3( 0, -0.18, 0 ),

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
  }, { tandem: Tandem.OPT_OUT } )
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonConstants', DensityBuoyancyCommonConstants );

export default DensityBuoyancyCommonConstants;