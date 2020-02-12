// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );

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

  return densityBuoyancyCommon.register( 'PrecisionSliderThumb', PrecisionSliderThumb );
} );
