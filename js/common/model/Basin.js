// Copyright 2020, University of Colorado Boulder

/**
 * Represents a basin that a liquid can reside in at a specific level.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import InterpolatedProperty from './InterpolatedProperty.js';

class Basin {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {
      initialVolume: 0,
      initialY: 0
    }, options );

    // @public {Property.<number>} - in m^3
    this.liquidVolumeProperty = new NumberProperty( options.initialVolume );

    // @public {Property.<number>} - The y coordinate of the liquid level
    this.liquidYProperty = new InterpolatedProperty( options.initialY, {
      interpolate: InterpolatedProperty.interpolateNumber
    } );
  }

  /**
   * Resets to an initial state.
   * @public
   */
  reset() {
    this.liquidVolumeProperty.reset();
    this.liquidYProperty.reset();
  }
}

densityBuoyancyCommon.register( 'Basin', Basin );
export default Basin;