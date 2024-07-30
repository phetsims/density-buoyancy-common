// Copyright 2024, University of Colorado Boulder

/**
 * Materials and Gravity are classes that have an axon Property that represents their characteristic (density or gravity value).
 * This is a utility class that allows for a custom value to be set, in addition to the named constant instances.
 *
 * TODO: Is it not always? This logic seems to be everywhere, https://github.com/phetsims/density-buoyancy-common/issues/281
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

// TODO: Consider renaming given the new fields, https://github.com/phetsims/density-buoyancy-common/issues/281
export type HasValueProperty = {
  valueProperty: Property<number>;
  custom: boolean;
  hidden: boolean;
};

type MappedWrappedPropertyOptions<T> = PropertyOptions<T>;

export default abstract class MappedWrappedProperty<T extends HasValueProperty> extends Property<T> {
  // TODO: Please document, see https://github.com/phetsims/density-buoyancy-common/issues/281
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

    // Prevent an infinite loop in the following listeners.
    let isChangingToPredefinedValueLock = false;

    // When the user changes the density by dragging the slider, automatically switch from the predefined material to
    // the custom material.
    this.customValue.valueProperty.lazyLink( () => {
      if ( !isChangingToPredefinedValueLock ) {
        this.value = this.customValue;
      }
    } );

    // Normally, when switching from custom to wood, change the custom density also to the wood density
    // However, when switching to a mystery material, do not change the custom value. This prevents clever students from discovering
    // the mystery values by using the UI instead of by computing them, see https://github.com/phetsims/buoyancy/issues/54
    this.lazyLink( richObject => {
      if ( !richObject.custom && !richObject.hidden ) {
        isChangingToPredefinedValueLock = true;
        this.customValue.valueProperty.value = richObject.valueProperty.value;
        isChangingToPredefinedValueLock = false;
      }
    } );

    // When the user changes one of the default values via phet-io (i.e. changing Earth's gravity to 10 m/s^2),
    // if that default is currently selected, update the custom value to match the new value.
    this.availableValues.forEach( valueProperty => {
      valueProperty.valueProperty.lazyLink( value => {
        if ( this.value === valueProperty ) {
          isChangingToPredefinedValueLock = true;
          this.customValue.valueProperty.value = value;
          isChangingToPredefinedValueLock = false;
        }
      } );
    } );
  }
}
densityBuoyancyCommon.register( 'MappedWrappedProperty', MappedWrappedProperty );