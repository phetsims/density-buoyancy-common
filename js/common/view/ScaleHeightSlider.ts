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
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Scale from '../model/Scale.js';
import Utils from '../../../../dot/js/Utils.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';

// constants
const DEFAULT_RANGE = new Range( 0, 1 );
const SCALE_X_POSITION = 0.35;

export default class ScaleHeightSlider extends VSlider {

  public constructor( scale: Scale, heightProperty: Property<number>,
                      poolBounds: Bounds3,
                      liquidYInterpolatedProperty: TReadOnlyProperty<number>,
                      providedOptions?: SliderOptions ) {

    const thumbNode = new PrecisionSliderThumb( {
      thumbFill: 'rgb( 50, 145, 184 )'
    } );

    const options = combineOptions<SliderOptions>( {
      thumbNode: thumbNode,
      thumbYOffset: thumbNode.height / 2,
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Control',
      trackSize: new Dimension2( 3, 150 )
    }, providedOptions );

    super( heightProperty, DEFAULT_RANGE, options );

    const halfScaleHeight = Scale.SCALE_HEIGHT / 2;

    // This magic number accomplishes two things:
    // 1. matching the liquid level exactly causes blue graphical fractals on the top of the scale
    // 2. Because the P2 engine has a non-infinite stiffness, masses overlap when contacting. This means that we want to
    //    raise the scale up above the pool so that the block can be the same weight as when measuring with the ground scale.
    const maxY = liquidYInterpolatedProperty.value - halfScaleHeight + 0.001;

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