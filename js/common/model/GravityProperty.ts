// Copyright 2024, University of Colorado Boulder

/**
 * GravityProperty adds a more domain-specific name for the value property. It is analogous to MaterialProperty.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { PropertyOptions } from '../../../../axon/js/Property.js';
import Gravity from './Gravity.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MappedWrappedProperty from './MappedWrappedProperty.js';

export default class GravityProperty extends MappedWrappedProperty<Gravity> {
  public readonly gravityValueProperty: TReadOnlyProperty<number>;

  public constructor( gravity: Gravity, providedOptions?: PropertyOptions<Gravity> ) {
    super( gravity, Gravity.createCustomGravity( gravity.gravityValue ), providedOptions );

    // TODO: Use gravityValueProperty instead of dynamicValueProperty where possible, see https://github.com/phetsims/density-buoyancy-common/issues/256
    this.gravityValueProperty = this.dynamicValueProperty;
  }
}
densityBuoyancyCommon.register( 'GravityProperty', GravityProperty );