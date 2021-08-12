// Copyright 2019-2021, University of Colorado Boulder

/**
 * Represents different gravity values, including a custom option.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';

class Gravity {
  /**
   * @param {Object} config
   */
  constructor( config ) {

    config = merge( {
      // {string}
      name: 'unknown',

      // {string|null}
      tandemName: null,

      // {number} - m/s^2
      value: 1,

      // {boolean} - optional
      custom: false,

      // {boolean} - optional
      hidden: false
    }, config );

    // @public (read-only) {string}
    this.name = config.name;

    // @public (read-only) {string}
    this.tandemName = config.tandemName;

    // @public (read-only) {number}
    this.value = config.value;

    // @public (read-only) {boolean}
    this.custom = config.custom;

    // @public (read-only) {boolean}
    this.hidden = config.hidden;
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
      tandemName: 'custom',
      value: value,
      custom: true
    } );
  }
}

// @public (read-only) {Gravity}
Gravity.EARTH = new Gravity( {
  name: densityBuoyancyCommonStrings.gravity.earth,
  tandemName: 'earth',
  value: 9.8
} );
Gravity.JUPITER = new Gravity( {
  name: densityBuoyancyCommonStrings.gravity.jupiter,
  tandemName: 'jupiter',
  value: 24.8
} );
Gravity.MOON = new Gravity( {
  name: densityBuoyancyCommonStrings.gravity.moon,
  tandemName: 'moon',
  value: 1.6
} );
Gravity.PLANET_X = new Gravity( {
  name: densityBuoyancyCommonStrings.gravity.planetX,
  tandemName: 'planetX',
  value: 19.6,
  hidden: true
} );

// @public (read-only) {Array.<Gravity>}
Gravity.GRAVITIES = [
  Gravity.EARTH,
  Gravity.JUPITER,
  Gravity.MOON,
  Gravity.PLANET_X
];

// @public (read-only) {IOType}
Gravity.GravityIO = new IOType( 'GravityIO', {
  valueType: Gravity,
  documentation: 'Represents a specific value of gravity',
  toStateObject: gravity => {
    return {
      name: gravity.name,
      tandemName: gravity.tandemName,
      value: gravity.value,
      custom: gravity.custom,
      hidden: gravity.hidden
    };
  },
  fromStateObject: stateObject => {
    if ( stateObject.custom ) {
      return new Gravity( stateObject );
    }
    else {
      return _.find( Gravity.GRAVITIES, gravity => gravity.value === stateObject.value );
    }
  },
  stateSchema: {
    name: StringIO,
    tandemName: NullableIO( StringIO ),
    value: NumberIO,
    custom: BooleanIO,
    hidden: BooleanIO
  }
} );

densityBuoyancyCommon.register( 'Gravity', Gravity );
export default Gravity;