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
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';

export default class GravityProperty extends MappedWrappedProperty<Gravity> {

  // Takes the value of the currently selected Gravity instance
  private readonly gravityValueProperty: TReadOnlyProperty<number>;

  public readonly customGravity: Gravity;

  public constructor( gravity: Gravity, customGravity: Gravity, availableValues: Gravity[], providedOptions: PropertyOptions<Gravity> & PickRequired<PhetioObjectOptions, 'tandem'> ) {
    super( gravity, customGravity, availableValues, providedOptions );

    this.gravityValueProperty = new DynamicProperty<number, number, Gravity>( this, {
      bidirectional: false,
      derive: value => value.valueProperty
    } );
    this.customGravity = this.customValue;
  }

  public override reset(): void {
    super.reset();
    this.customGravity.reset();
  }
}
densityBuoyancyCommon.register( 'GravityProperty', GravityProperty );