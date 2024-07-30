// Copyright 2019-2024, University of Colorado Boulder

/**
 * A Property that is based on the step-based interpolation between a current (most recent value) and previous value
 * (two values ago). In addition, this Property wants to notify changes less often than it may update. This is why
 * its value is set much less often than currentValue.
 *
 * This interpolation is an established algorithm for handling excess DT when stepping based on fixed model steps
 * (which Density and Buoyancy do).
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import { ReadOnlyPropertyState } from '../../../../axon/js/ReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import IOTypeCache from '../../../../tandem/js/IOTypeCache.js';

type Interpolate<T> = ( a: T, b: T, ratio: number ) => T;
type SelfOptions<T> = {
  interpolate: Interpolate<T>;
};
export type InterpolatedPropertyOptions<T> = SelfOptions<T> & PropertyOptions<T>;

export default class InterpolatedProperty<T> extends Property<T> {

  // The most recently set value, but changing this will not fire listeners.
  public currentValue: T;

  // Capture the previous value upon currentValue change.
  private previousValue: T;
  private ratio: number;

  private readonly interpolate: Interpolate<T>;

  public constructor( initialValue: T, providedOptions: InterpolatedPropertyOptions<T> ) {

    const options = optionize<InterpolatedPropertyOptions<T>, SelfOptions<T>, PropertyOptions<T>>()( {
      phetioOuterType: InterpolatedProperty.InterpolatedPropertyIO
    }, providedOptions );

    super( initialValue, options );

    this.interpolate = options.interpolate;

    this.currentValue = initialValue;
    this.previousValue = initialValue;

    this.ratio = 0;
  }

  /**
   * Sets the next value to be used (will NOT change the value of this Property).
   */
  public setNextValue( value: T ): void {
    this.previousValue = this.currentValue;
    this.currentValue = value;
  }

  /**
   * Sets the ratio to use for interpolated values (WILL change the value of this Property generally).
   */
  public setRatio( ratio: number ): void {
    this.ratio = ratio;

    // Interpolating between two values ago and the most recent value is a common heuristic to do, but it is important
    // that no model code relies on this, and instead would just use currentValue directly. This is also duplicated from
    // what p2 World does after step.
    this.value = this.interpolate( this.previousValue, this.currentValue, this.ratio );
  }

  /**
   * Resets the Property to its initial state.
   */
  public override reset(): void {
    super.reset();

    this.currentValue = this.value;
    this.previousValue = this.value;
    this.ratio = 0;
  }

  /**
   * Interpolation for numbers.
   */
  public static interpolateNumber( a: number, b: number, ratio: number ): number {
    return a + ( b - a ) * ratio;
  }

  /**
   * Interpolation for Vector2.
   */
  public static interpolateVector2( a: Vector2, b: Vector2, ratio: number ): Vector2 {
    return a.blend( b, ratio );
  }

  public static readonly InterpolatedPropertyIO = ( parameterType: IOType ): IOType => {
    assert && assert( parameterType, 'InterpolatedPropertyIO needs parameterType' );

    if ( !cache.has( parameterType ) ) {
      const PropertyIOImpl = Property.PropertyIO( parameterType );

      const ioType = new IOType( `InterpolatedPropertyIO<${parameterType.typeName}>`, {
        valueType: InterpolatedProperty,
        supertype: PropertyIOImpl,
        parameterTypes: [ parameterType ],
        documentation: 'Extends PropertyIO to interpolation (with a current/previous value, and a ratio between the two)',
        toStateObject: ( interpolatedProperty: InterpolatedProperty<IntentionalAny> ): InterpolatedPropertyIOStateObject => {

          const parentStateObject = PropertyIOImpl.toStateObject( interpolatedProperty );

          parentStateObject.currentValue = parameterType.toStateObject( interpolatedProperty.currentValue );
          parentStateObject.previousValue = parameterType.toStateObject( interpolatedProperty.previousValue );
          parentStateObject.ratio = interpolatedProperty.ratio;

          return parentStateObject;
        },
        applyState: ( interpolatedProperty: InterpolatedProperty<IntentionalAny>, stateObject: InterpolatedPropertyIOStateObject ) => {
          PropertyIOImpl.applyState( interpolatedProperty, stateObject );
          interpolatedProperty.currentValue = parameterType.fromStateObject( stateObject.currentValue );
          interpolatedProperty.previousValue = parameterType.fromStateObject( stateObject.previousValue );
          interpolatedProperty.ratio = stateObject.ratio;
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
}

// {Map.<IOType, IOType>} - Cache each parameterized PropertyIO based on
// the parameter type, so that it is only created once
const cache = new IOTypeCache();

export type InterpolatedPropertyIOStateObject = ReadOnlyPropertyState<IntentionalAny> & {
  currentValue: IntentionalAny;
  previousValue: IntentionalAny;
  ratio: number;
};

densityBuoyancyCommon.register( 'InterpolatedProperty', InterpolatedProperty );