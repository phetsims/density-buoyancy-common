// Copyright 2024, University of Colorado Boulder

/**
 * Materials and Gravity are classes that have an axon Property that represents their characteristic (density or gravity value).
 * This is a utility class that allows for a custom value to be set, in addition to the named constant instances.
 *
 * Often, but not always, when changing from a named constant to a custom value, the custom value is set to the prior constant.
 * There is an exception when changing to/from mystery values, so the user cannot use the UI to determine the mystery value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

export type HasValueProperty = {
  valueProperty: Property<number>;
};

type MappedWrappedPropertyOptions<T> = PropertyOptions<T>;

export default abstract class MappedWrappedProperty<T extends HasValueProperty> extends Property<T> {
  protected readonly dynamicValueProperty: TReadOnlyProperty<number>;
  public readonly customValue: T;
  public readonly availableValues: T[];

  protected constructor( initialValue: T, customValue: T, availableValues: T[], providedOptions: MappedWrappedPropertyOptions<T> ) {

    const options = optionize<MappedWrappedPropertyOptions<T>, EmptySelfOptions, PropertyOptions<T>>()( {
      validValues: availableValues
    }, providedOptions );

    super( initialValue, options );

    this.dynamicValueProperty = new DynamicProperty<number, number, T>( this, {
      bidirectional: false,
      derive: value => value.valueProperty
    } );

    this.customValue = customValue;
    this.availableValues = availableValues;
  }
}
densityBuoyancyCommon.register( 'MappedWrappedProperty', MappedWrappedProperty );