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
import Scale from '../model/Scale.js';
import Utils from '../../../../dot/js/Utils.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';

// constants
const DEFAULT_RANGE = new Range( 0, 1 );
const THUMB_COLOR = new Color( 0x00ff00 );
const SCALE_X_POSITION = 0.35;

export default class ScaleHeightSlider extends VSlider {

  public constructor( scale: Scale, heightProperty: Property<number>,
                      poolBounds: Bounds3,
                      liquidYInterpolatedProperty: TReadOnlyProperty<number>,
                      providedOptions?: SliderOptions ) {

    const thumbNode = new SpectrumSliderThumb( heightProperty, {
      valueToColor: () => THUMB_COLOR,
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

    const halfScaleHeight = Scale.SCALE_HEIGHT / 2;

    // This exact top of pool renders fractals of water on the scale, so just a wee bit different.
    const maxY = liquidYInterpolatedProperty.value - halfScaleHeight + 0.00001;

    heightProperty.link( height => {
      const minY = poolBounds.minY + halfScaleHeight;
      const currentHeight = Utils.linear( 0, 1, minY, maxY, height );

      scale.matrix.set02( SCALE_X_POSITION );
      scale.matrix.set12( currentHeight );
      scale.writeData();
      scale.transformedEmitter.emit();
    } );
  }
}

densityBuoyancyCommon.register( 'ScaleHeightSlider', ScaleHeightSlider );