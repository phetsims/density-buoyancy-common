// Copyright 2019-2024, University of Colorado Boulder

/**
 * A Property that blends a Vector2 Property between the old and new value based on the distance between them.
 *
 * Please see BlendedNumberProperty to see the number implementation of this concept.
 *
 * @author Sam Reid
 *
 */

import Property from '../../../../axon/js/Property.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';

export default class BlendedVector2Property extends Property<Vector2> {
  public constructor( sourceProperty: TReadOnlyProperty<Vector2> ) {

    super( sourceProperty.value );

    sourceProperty.link( value => {

      const oldValue = this.value;
      const newValue = value;

      // choose the blendAmount based on the distance between values
      // This adds a hysteresis effect to the readout, which reduces flickering inherent to the model.
      const MIN_BLEND = 0.1; // When close, blend with the old value more
      const MAX_BLEND = 1; // When far apart, take the new value completely
      const blendAmount = Utils.clamp(
        Utils.linear( 0, 1, MIN_BLEND, MAX_BLEND, newValue.minus( oldValue ).magnitude ),
        MIN_BLEND, MAX_BLEND );

      // blend
      const result = oldValue.blend( newValue, blendAmount );

      this.value = result;
    } );
  }
}

densityBuoyancyCommon.register( 'BlendedVector2Property', BlendedVector2Property );