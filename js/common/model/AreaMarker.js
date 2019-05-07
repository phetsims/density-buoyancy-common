// Copyright 2019, University of Colorado Boulder

/**
 * Denotes a change in the cross-sectional area of an object at a specific y value.
 * Used for fast computation of the liquid height when objects are submerged inside.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Poolable = require( 'PHET_CORE/Poolable' );

  class AreaMarker {
    /**
     * @param {number} y
     * @param {number} delta
     */
    constructor( y, delta ) {
      this.initialize( y, delta );
    }

    /**
     * @param {number} y
     * @param {number} delta
     */
    initialize( y, delta ) {

      // @public {number}
      this.y = y;
      this.delta = delta;
    }

    /**
     * Sorts an array of AreaMarkers from bottom to top.
     * @public
     *
     * @param {Array.<AreaMarker>}
     */
    static sortMarkers( array ) {
      array.sort( ( a, b ) => a.y - b.y );
    }
  }

  Poolable.mixInto( AreaMarker, {
    initialize: AreaMarker.prototype.initialize
  } );

  return densityBuoyancyCommon.register( 'AreaMarker', AreaMarker );
} );
