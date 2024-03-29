// Copyright 2024, University of Colorado Boulder

/**
 * Slider that changes the height of the Scale for some screens in the density-buoyancy suite of sims.
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { SliderOptions } from '../../../../sun/js/Slider.js';
import Property from '../../../../axon/js/Property.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Range from '../../../../dot/js/Range.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import VSlider from '../../../../sun/js/VSlider.js';
import SpectrumSliderThumb from '../../../../scenery-phet/js/SpectrumSliderThumb.js';
import { Color } from '../../../../scenery/js/imports.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';

// constants
const DEFAULT_RANGE = new Range( 0, 1 );

/**
 * @param wavelengthProperty - wavelength, in nm
 * @param [options]
 * @constructor
 */
export default class ScaleHeightSlider extends VSlider {

  /**
   * @param wavelengthProperty - in nm
   * @param providedOptions
   */
  public constructor( heightProperty: Property<number>, providedOptions?: SliderOptions ) {

    const thumbNode = new SpectrumSliderThumb( heightProperty, {
      valueToColor: value => {
        return new Color( 0x00ff00 );
      },
      width: 15,
      height: 20,
      cursorHeight: 15,
      cursorWidth: 2,
      windowCursorOptions: {
        fill: 'black'
      }
    } );

    const options = combineOptions<SliderOptions>( {
      thumbNode: thumbNode,
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Control',
      trackSize: new Dimension2( 3, 150 )
    }, providedOptions );

    super( heightProperty, DEFAULT_RANGE, options );
  }
}

densityBuoyancyCommon.register( 'ScaleHeightSlider', ScaleHeightSlider );