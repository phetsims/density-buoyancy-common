// Copyright 2019-2022, University of Colorado Boulder

/**
 * A Property that is based on the step-based interpolation between a current and previous value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { optionize3 } from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

type Interpolate<T> = ( a: T, b: T, ratio: number ) => T;
type SelfOptions<T> = {
  interpolate: Interpolate<T>;
};
export type InterpolatedPropertyOptions<T> = SelfOptions<T> & PropertyOptions<T>;

export default class InterpolatedProperty<T> extends Property<T> {

  // publicly read-only
  currentValue: T;
  previousValue: T;
  ratio: number;

  private interpolate: Interpolate<T>;

  constructor( initialValue: T, providedConfig: InterpolatedPropertyOptions<T> ) {

    const config = optionize3<InterpolatedPropertyOptions<T>, SelfOptions<T>, PropertyOptions<T>>()( {}, providedConfig );

    super( initialValue, config );

    this.interpolate = config.interpolate;

    this.currentValue = initialValue;
    this.previousValue = initialValue;

    this.ratio = 0;
  }

  /**
   * Sets the next value to be used (will NOT change the value of this Property).
   */
  setNextValue( value: T ) {
    this.previousValue = this.currentValue;
    this.currentValue = value;
  }

  /**
   * Sets the ratio to use for interpolated values (WILL change the value of this Property generally).
   */
  setRatio( ratio: number ) {
    this.ratio = ratio;

    this.value = this.interpolate( this.previousValue, this.currentValue, this.ratio );
  }

  /**
   * Resets the Property to its initial state.
   */
  override reset() {
    super.reset();

    this.currentValue = this.value;
    this.previousValue = this.value;
    this.ratio = 0;
  }

  /**
   * Interpolation for numbers.
   */
  static interpolateNumber( a: number, b: number, ratio: number ): number {
    return a + ( b - a ) * ratio;
  }

  /**
   * Interpolation for Vector2.
   */
  static interpolateVector2( a: Vector2, b: Vector2, ratio: number ): Vector2 {
    return a.blend( b, ratio );
  }

  /**
   * Interpolation for Vector3.
   */
  static interpolateVector3( a: Vector3, b: Vector3, ratio: number ): Vector3 {
    return a.blend( b, ratio );
  }

  static InterpolatedPropertyIO: ( parameterType: IOType ) => IOType;
}

// {Map.<IOType, IOType>} - Cache each parameterized PropertyIO based on
// the parameter type, so that it is only created once
const cache = new Map<IOType, IOType>();

InterpolatedProperty.InterpolatedPropertyIO = parameterType => {
  assert && assert( parameterType, 'InterpolatedPropertyIO needs parameterType' );

  if ( !cache.has( parameterType ) ) {
    const PropertyIOImpl = Property.PropertyIO( parameterType );

    const ioType = new IOType( `InterpolatedPropertyIO<${parameterType.typeName}>`, {
      valueType: InterpolatedProperty,
      supertype: PropertyIOImpl,
      parameterTypes: [ parameterType ],
      documentation: 'Extends PropertyIO to interpolation (with a current/previous value, and a ratio between the two)',
      toStateObject: ( interpolatedProperty: InterpolatedProperty<any> ) => {

        const parentStateObject = PropertyIOImpl.toStateObject( interpolatedProperty );

        parentStateObject.currentValue = parameterType.toStateObject( interpolatedProperty.currentValue );
        parentStateObject.previousValue = parameterType.toStateObject( interpolatedProperty.previousValue );
        parentStateObject.ratio = NumberIO.toStateObject( interpolatedProperty.ratio );

        return parentStateObject;
      },
      applyState: ( interpolatedProperty: InterpolatedProperty<any>, stateObject: any ) => {
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

  return cache.get( parameterType )!;
};

densityBuoyancyCommon.register( 'InterpolatedProperty', InterpolatedProperty );
