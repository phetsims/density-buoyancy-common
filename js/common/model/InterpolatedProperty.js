// Copyright 2019-2021, University of Colorado Boulder

/**
 * A Property that is based on the step-based interpolation between a current and previous value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class InterpolatedProperty extends Property {
  /**
   * @param {*} value - The initial value of the property
   * @param {Object} config - config
   */
  constructor( value, config ) {

    config = merge( {
      // {function(a:number, b:number, ratio:number)} - to interpolate
      interpolate: null
    }, config );

    super( value, config );

    // @private {function(a:number, b:number, ratio:number)}
    this.interpolate = config.interpolate;

    // @public (read-only) {*}
    this.currentValue = value;
    this.previousValue = value;

    // @public (read-only) {number}
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

// {Map.<IOType, IOType>} - Cache each parameterized PropertyIO based on
// the parameter type, so that it is only created once
const cache = new Map();

/**
 * @public
 * @param {IOType} parameterType
 * @returns {IOType}
 */
InterpolatedProperty.InterpolatedPropertyIO = parameterType => {
  assert && assert( parameterType, 'InterpolatedPropertyIO needs parameterType' );

  if ( !cache.has( parameterType ) ) {
    const PropertyIOImpl = Property.PropertyIO( parameterType );

    const ioType = new IOType( `InterpolatedPropertyIO<${parameterType.typeName}>`, {
      valueType: InterpolatedProperty,
      supertype: PropertyIOImpl,
      parameterTypes: [ parameterType ],
      documentation: 'Extends PropertyIO to interpolation (with a current/previous value, and a ratio between the two)',
      toStateObject: interpolatedProperty => {

        const parentStateObject = PropertyIOImpl.toStateObject( interpolatedProperty );

        parentStateObject.currentValue = parameterType.toStateObject( interpolatedProperty.currentValue );
        parentStateObject.previousValue = parameterType.toStateObject( interpolatedProperty.previousValue );
        parentStateObject.ratio = NumberIO.toStateObject( interpolatedProperty.ratio );

        return parentStateObject;
      },
      applyState: ( interpolatedProperty, stateObject ) => {
        PropertyIOImpl.applyState( interpolatedProperty, stateObject );
        interpolatedProperty.currentValue = parameterType.fromStateObject( stateObject.currentValue );
        interpolatedProperty.previousValue = parameterType.fromStateObject( stateObject.previousValue );
        interpolatedProperty.ratio = NumberIO.fromStateObject( stateObject.ratio );
      },
      stateSchema: {
        currentValue: parameterType,
        previousValue: parameterType,
        ratio: NumberIO
      }
    } );

    cache.set( parameterType, ioType );
  }

  return cache.get( parameterType );
};

densityBuoyancyCommon.register( 'InterpolatedProperty', InterpolatedProperty );
export default InterpolatedProperty;