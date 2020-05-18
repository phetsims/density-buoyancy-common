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
  }
}

densityBuoyancyCommon.register( 'Pool', Pool );
export default Pool;