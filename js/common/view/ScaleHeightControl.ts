// Copyright 2024, University of Colorado Boulder

/**
 * Slider control with tweaker buttons that changes the height of the Scale for some screens in the density-buoyancy
 * suite of sims.
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Slider from '../../../../sun/js/Slider.js';
import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Range from '../../../../dot/js/Range.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Scale from '../model/Scale.js';
import Utils from '../../../../dot/js/Utils.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';
import { THREEModelViewTransform } from './DensityBuoyancyScreenView.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Node, VBox } from '../../../../scenery/js/imports.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import Orientation from '../../../../phet-core/js/Orientation.js';

// constants
const DEFAULT_RANGE = new Range( 0, 1 );
const SCALE_X_POSITION = 0.35;

type ScaleHeightSliderOptions = EmptySelfOptions & NumberControlOptions;

export default class ScaleHeightControl extends NumberControl {

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

    const options = optionize<ScaleHeightSliderOptions, EmptySelfOptions, NumberControlOptions>()( {
      sliderOptions: {
        orientation: Orientation.VERTICAL,
        thumbNode: scaleHeightThumbNode,
        thumbYOffset: scaleHeightThumbNode.height / 2,
        trackSize: new Dimension2( 3, sliderTrackHeight )
      },
      titleNodeOptions: { tandem: Tandem.OPT_OUT },
      numberDisplayOptions: { tandem: Tandem.OPT_OUT },
      delta: DEFAULT_RANGE.getLength() / 100,
      layoutFunction( titleNode: Node, numberDisplay: NumberDisplay, slider: Slider, decrementButton: ArrowButton | null, incrementButton: ArrowButton | null ) {
        const actualIncrement = incrementButton!;
        const actualDecrement = decrementButton!;
        actualIncrement.rotate( -Math.PI / 2 );
        actualDecrement.rotate( -Math.PI / 2 );
        const margin = 2;
        const vBox = new VBox( {
          align: 'left',
          spacing: margin,
          children: [ actualIncrement, slider, actualDecrement ]
        } );

        // Set the origin to exactly where placement should be (at the bottom of the slider, to line up with the scale at the bottom
        vBox.y = -( actualIncrement.height + margin + slider.height - scaleHeightThumbNode.width / 2 );
        return vBox;
      }
    }, providedOptions );

    super( new Property( '' ), heightProperty, DEFAULT_RANGE, options );

    heightProperty.link( height => {
      const currentHeight = Utils.linear( 0, 1, minY, maxY, height );

      scale.matrix.set02( SCALE_X_POSITION );
      scale.matrix.set12( currentHeight + Scale.SCALE_HEIGHT / 2 );
      scale.writeData();
      scale.transformedEmitter.emit();
    } );
  }
}

densityBuoyancyCommon.register( 'ScaleHeightControl', ScaleHeightControl );