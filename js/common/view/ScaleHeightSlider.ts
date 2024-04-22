// Copyright 2024, University of Colorado Boulder

/**
 * Slider that changes the height of the Scale for some screens in the density-buoyancy suite of sims.
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { SliderOptions } from '../../../../sun/js/Slider.js';
import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Range from '../../../../dot/js/Range.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import VSlider from '../../../../sun/js/VSlider.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Scale from '../model/Scale.js';
import Utils from '../../../../dot/js/Utils.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';
import { THREEModelViewTransform } from './DensityBuoyancyScreenView.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Node } from '../../../../scenery/js/imports.js';

// constants
const DEFAULT_RANGE = new Range( 0, 1 );
const SCALE_X_POSITION = 0.35;

type GetSliderTrackBottomPoint = () => Vector2;
type SelfOptions = {
  getSliderTrackBottomPoint: GetSliderTrackBottomPoint;
};
type ScaleHeightSliderOptions = SelfOptions & SliderOptions;

export default class ScaleHeightSlider extends VSlider {
  private readonly getSliderTrackBottomPoint: GetSliderTrackBottomPoint;
  private readonly scaleHeightThumbNode: Node;

  public constructor( scale: Scale, heightProperty: Property<number>,
                      poolBounds: Bounds3,
                      liquidYInterpolatedProperty: TReadOnlyProperty<number>,
                      modelViewTransform: THREEModelViewTransform,
                      providedOptions: ScaleHeightSliderOptions ) {

    const scaleHeightThumbNode = new PrecisionSliderThumb();

    // This magic number accomplishes two things:
    // 1. matching the liquid level exactly causes blue graphical fractals on the top of the scale
    // 2. Because the P2 engine has a non-infinite stiffness, masses overlap when contacting. This means that we want to
    //    raise the scale up above the pool so that the block can be the same weight as when measuring with the ground scale.
    const maxY = liquidYInterpolatedProperty.value - Scale.SCALE_HEIGHT + 0.001;
    const minY = poolBounds.minY;

    const sliderTrackHeight = modelViewTransform.modelToViewDelta( new Vector3( SCALE_X_POSITION, maxY, poolBounds.maxZ ), new Vector3( SCALE_X_POSITION, minY, poolBounds.maxZ ) ).y;

    const options = optionize<ScaleHeightSliderOptions, SelfOptions, SliderOptions>()( {
      thumbNode: scaleHeightThumbNode,
      thumbYOffset: scaleHeightThumbNode.height / 2,
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Control',
      trackSize: new Dimension2( 3, sliderTrackHeight )
    }, providedOptions );

    super( heightProperty, DEFAULT_RANGE, options );
    this.getSliderTrackBottomPoint = options.getSliderTrackBottomPoint;
    this.scaleHeightThumbNode = scaleHeightThumbNode;

    heightProperty.link( height => {
      const currentHeight = Utils.linear( 0, 1, minY, maxY, height );

      scale.matrix.set02( SCALE_X_POSITION );
      scale.matrix.set12( currentHeight + Scale.SCALE_HEIGHT / 2 );
      scale.writeData();
      scale.transformedEmitter.emit();
    } );
  }

  public layout(): void {

    const bottomPoint = this.getSliderTrackBottomPoint();

    // Position based on the track, not the thumb
    this.bottom = bottomPoint.y + this.scaleHeightThumbNode.height / 2;
    this.left = bottomPoint.x;
  }
}

densityBuoyancyCommon.register( 'ScaleHeightSlider', ScaleHeightSlider );