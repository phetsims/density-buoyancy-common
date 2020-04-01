// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class Gravity {
  /**
   * @param {Object} config
   */
  constructor( config ) {

    config = merge( {
      // {string}
      name: 'unknown',

      // {number} - m/s^2
      value: 1,

      // {boolean} - optional
      custom: false
    }, config );

    // @public {string}
    this.name = config.name;

    // @public {number}
    this.value = config.value;

    // @public {boolean}
    this.custom = config.custom;
  }

  /**
   * Returns a custom material that can be modified at will.
   * @public
   *
   * @param {number} value
   * @returns {Gravity}
   */
  static createCustomGravity( value ) {
    return new Gravity( {
      name: densityBuoyancyCommonStrings.gravity.custom,
      value: value,
      custom: true
    } );
  }
}

// @public {Gravity}
Gravity.EARTH = new Gravity( {
  name: densityBuoyancyCommonStrings.gravity.earth,
  value: 9.8
} );
Gravity.JUPITER = new Gravity( {
  name: densityBuoyancyCommonStrings.gravity.jupiter,
  value: 24.8
} );
Gravity.MOON = new Gravity( {
  name: densityBuoyancyCommonStrings.gravity.moon,
  value: 1.6
} );
Gravity.PLANET_X = new Gravity( {
  name: densityBuoyancyCommonStrings.gravity.planetX,
  value: 19.6
} );

// @public {Array.<Gravity>}
Gravity.GRAVITIES = [
  Gravity.EARTH,
  Gravity.JUPITER,
  Gravity.MOON,
  Gravity.PLANET_X
];

densityBuoyancyCommon.register( 'Gravity', Gravity );
export default Gravity;