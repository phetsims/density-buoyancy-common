// Copyright 2021-2024, University of Colorado Boulder

/**
 * Supertype for the NumberControls in the Compare screen
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import TRangedProperty from '../../../../axon/js/TRangedProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export type ComparisonNumberControlOptions = NumberControlOptions;

export const DEFAULT_COMPARISON_TRACK_SIZE = new Dimension2( 120, 0.5 );

export default class ComparisonNumberControl extends NumberControl {
  public constructor(
    property: TRangedProperty,
    titleStringProperty: TReadOnlyProperty<string>,
    valuePatternStringProperty: TReadOnlyProperty<string>,
    valueName: string,
    options?: ComparisonNumberControlOptions
  ) {
    super( titleStringProperty, property, property.range, combineOptions<NumberControlOptions>( {
      layoutFunction: NumberControl.createLayoutFunction4( {
        sliderPadding: 5
      } ),
      delta: DensityBuoyancyCommonConstants.NUMBER_CONTROL_DELTA,
      titleNodeOptions: {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 80,
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      },
      numberDisplayOptions: {
        textOptions: {
          font: DensityBuoyancyCommonConstants.READOUT_FONT
        },
        // Backward compatibility
        valuePattern: new PatternStringProperty( valuePatternStringProperty, {
          [ valueName ]: SunConstants.VALUE_NAMED_PLACEHOLDER
        }, { tandem: Tandem.OPT_OUT } ),
        maxWidth: 100,
        decimalPlaces: 2,
        useRichText: true,
        useFullHeight: true
      },
      arrowButtonOptions: {
        scale: DensityBuoyancyCommonConstants.ARROW_BUTTON_SCALE
      },

      sliderOptions: {
        constrainValue: ( value: number ) => {
          return property.range.constrainValue( Utils.roundToInterval( value, 0.05 ) );
        },
        keyboardStep: DensityBuoyancyCommonConstants.SLIDER_KEYBOARD_STEP,
        pageKeyboardStep: DensityBuoyancyCommonConstants.SLIDER_KEYBOARD_PAGE_STEP,
        shiftKeyboardStep: DensityBuoyancyCommonConstants.SLIDER_KEYBOARD_SHIFT_STEP,
        majorTickLength: 5,
        thumbSize: new Dimension2( 13, 22 ),
        thumbTouchAreaXDilation: 5,
        thumbTouchAreaYDilation: 4,
        majorTicks: [ {
          value: property.range.min,
          label: new Text( property.range.min, { font: new PhetFont( 12 ), maxWidth: 50 } )
        }, {
          value: property.range.max,
          label: new Text( property.range.max, { font: new PhetFont( 12 ), maxWidth: 50 } )
        } ],
        trackSize: DEFAULT_COMPARISON_TRACK_SIZE
      }
    }, options ) );
  }
}

densityBuoyancyCommon.register( 'ComparisonNumberControl', ComparisonNumberControl );