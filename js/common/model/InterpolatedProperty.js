// Copyright 2019, University of Colorado Boulder

/**
 * A Property that is based on the step-based interpolation between a current and previous value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Property = require( 'AXON/Property' );

  class InterpolatedProperty extends Property {
    /**
     * @param {*} value - The initial value of the property
     * @param {Object} config - config
     */
    constructor( value, config ) {

      config = _.extend( {
        // {function} - function( a, b, ratio ), to interpolate
        interpolate: null
      }, config );

      super( value, config );

      // @private {function}
      this.interpolate = config.interpolate;

      // @public {*}
      this.currentValue = value;
      this.previousValue = value;

      // @public {number}
      this.ratio = 0;
    }

    /**
     * Sets the next value to be used (will NOT change the value of this Property).
     * @public
     *
     * @param {*} value
     */
    setNextValue( value ) {
      this.previousValue = this.currentValue;
      this.currentValue = value;
    }

    /**
     * Sets the ratio to use for interpolated values (WILL change the value of this Property generally).
     * @public
     *
     * @param {number} ratio
     */
    setRatio( ratio ) {
      this.ratio = ratio;

      this.value = this.interpolate( this.previousValue, this.currentValue, this.ratio );
    }

    /**
     * Resets the Property to its initial state.
     * @public
     * @override
     */
    reset() {
      super.reset();

      this.currentValue = this.value;
      this.previousValue = this.value;
      this.ratio = 0;
    }

    /**
     * Interpolation for numbers.
     * @public
     *
     * @param {number} a
     * @param {number} b
     * @param {number} ratio
     * @returns {number}
     */
    static interpolateNumber( a, b, ratio ) {
      return a + ( b - a ) * ratio;
    }

    /**
     * Interpolation for Vector2.
     * @public
     *
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {number} ratio
     * @returns {Vector2}
     */
    static interpolateVector2( a, b, ratio ) {
      return a.blend( b, ratio );
    }

    /**
     * Interpolation for Vector3.
     * @public
     *
     * @param {Vector3} a
     * @param {Vector3} b
     * @param {number} ratio
     * @returns {Vector3}
     */
    static interpolateVector3( a, b, ratio ) {
      return a.blend( b, ratio );
    }
  }

  return densityBuoyancyCommon.register( 'InterpolatedProperty', InterpolatedProperty );
} );
