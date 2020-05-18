// Copyright 2020, University of Colorado Boulder

/**
 * Represents basin of the interior of the boat (that a liquid can reside in at a specific level).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Basin from '../../common/model/Basin.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class BoatBasin extends Basin {
  /**
   * @param {Boat} boat
   */
  constructor( boat ) {
    super( {
      initialVolume: 0,
      initialY: 0
    } );


  }
}

densityBuoyancyCommon.register( 'BoatBasin', BoatBasin );
export default BoatBasin;