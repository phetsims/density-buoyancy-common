// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommonStrings from '../../density-buoyancy-common-strings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

const gravityCustomString = densityBuoyancyCommonStrings.gravity.custom;
const gravityEarthString = densityBuoyancyCommonStrings.gravity.earth;
const gravityJupiterString = densityBuoyancyCommonStrings.gravity.jupiter;
const gravityMoonString = densityBuoyancyCommonStrings.gravity.moon;
const gravityPlanetXString = densityBuoyancyCommonStrings.gravity.planetX;

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
      name: gravityCustomString,
      value: value,
      custom: true
    } );
  }
}

// @public {Gravity}
Gravity.EARTH = new Gravity( {
  name: gravityEarthString,
  value: 9.8
} );
Gravity.JUPITER = new Gravity( {
  name: gravityJupiterString,
  value: 24.8
} );
Gravity.MOON = new Gravity( {
  name: gravityMoonString,
  value: 1.6
} );
Gravity.PLANET_X = new Gravity( {
  name: gravityPlanetXString,
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