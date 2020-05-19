// Copyright 2020, University of Colorado Boulder

/**
 * The main pool of liquid, cut into the ground.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Basin from './Basin.js';

class Pool extends Basin {
  /**
   * @param {Bounds3} bounds
   */
  constructor( bounds ) {

    const initialVolume = 0.1;

    super( {
      initialVolume: initialVolume,
      initialY: bounds.minY + initialVolume / ( bounds.width * bounds.depth )
    } );

    // @public {Bounds3}
    this.bounds = bounds;

    this.stepBottom = bounds.minY;
    this.stepTop = bounds.maxY;
  }

  /**
   * Returns whether a given mass is inside this basin (e.g. if filled with liquid, would it be displacing any
   * liquid).
   * @public
   * @override
   *
   * @param {Mass} mass
   * @returns {boolean}
   */
  isMassInside( mass ) {
    return mass.stepBottom < this.stepTop;
  }

  /**
   * Returns the maximum area that could be contained with liquid at a given y value.
   * @public
   * @override
   *
   * @param {number} y
   * @returns {number}
   */
  getMaximumArea( y ) {
    if ( y < this.bounds.minY || y > this.bounds.maxY ) {
      return 0;
    }
    else {
      return this.bounds.width * this.bounds.depth;
    }
  }

  /**
   * Returns the maximum volume that could be contained with liquid up to a given y value.
   * @public
   * @override
   *
   * @param {number} y
   * @returns {number}
   */
  getMaximumVolume( y ) {
    if ( y <= this.bounds.minY ) {
      return 0;
    }
    else if ( y >= this.bounds.maxY ) {
      return this.bounds.width * this.bounds.depth * this.bounds.height;
    }
    else {
      return this.bounds.width * this.bounds.depth * ( y - this.bounds.minY );
    }
  }
}

densityBuoyancyCommon.register( 'Pool', Pool );
export default Pool;