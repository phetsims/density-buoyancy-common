// Copyright 2021-2022, University of Colorado Boulder

/**
 * Supertype for the NumberControls in the Compare screen
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { RangedProperty } from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export type ComparisonNumberControlOptions = NumberControlOptions;

export default class ComparisonNumberControl extends NumberControl {
  constructor( property: RangedProperty, title: string, valuePattern: string, valueName: string, options?: ComparisonNumberControlOptions ) {
    super( title, property, property.range, combineOptions<NumberControlOptions>( {
      layoutFunction: NumberControl.createLayoutFunction4(),
      delta: 0.01,
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
        valuePattern: StringUtils.fillIn( valuePattern, { [ valueName ]: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
        maxWidth: 100,
        decimalPlaces: 2,
        useRichText: true,
        useFullHeight: true
      },
      arrowButtonOptions: { scale: 0.56 },

      sliderOptions: {
        // Constrain to 0.1 consistently, see https://github.com/phetsims/density/issues/75#issuecomment-896341332
        constrainValue: ( value: number ) => {
          return property.range.constrainValue( Utils.roundToInterval( value, 0.1 ) );
        },
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
        trackSize: new Dimension2( 120, 0.5 )
      }
    }, options ) );
  }
}

densityBuoyancyCommon.register( 'ComparisonNumberControl', ComparisonNumberControl );
