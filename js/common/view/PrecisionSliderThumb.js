// Copyright 2020, University of Colorado Boulder

/**
 * A custom slider thumb (that appears like our wavelength sliders) with a thin line on the actual slider track.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import { Line } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class PrecisionSliderThumb extends Node {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {
      // {PaintDef}
      thumbFill: '#eee',
      thumbStroke: '#000',

      // {number}
      mainHeight: 15,
      taperHeight: 5,
      thumbWidth: 15,
      lineHeight: 5,
      touchXDilation: 5,
      touchYDilation: 10
    }, options );

    const precisionLine = new Line( 0, -options.lineHeight / 2, 0, options.lineHeight / 2, {
      stroke: options.thumbStroke
    } );

    const thumbShape = new Shape().moveTo( 0, options.lineHeight / 2 )
      .lineToRelative( options.thumbWidth / 2, options.taperHeight )
      .lineToRelative( 0, options.mainHeight )
      .lineToRelative( -options.thumbWidth, 0 )
      .lineToRelative( 0, -options.mainHeight )
      .close();

    const thumbPath = new Path( thumbShape, {
      fill: options.thumbFill,
      stroke: options.thumbStroke
    } );

    options.children = [
      precisionLine,
      thumbPath
    ];

    super( options );

    this.touchArea = this.localBounds.dilatedXY( options.touchXDilation, options.touchYDilation );
  }
}

densityBuoyancyCommon.register( 'PrecisionSliderThumb', PrecisionSliderThumb );
export default PrecisionSliderThumb;