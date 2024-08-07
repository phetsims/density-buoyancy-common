// Copyright 2024, University of Colorado Boulder

/**
 * For PhET-iO, GuardedNumberProperty is a NumberProperty that has a custom validation function that can be used to
 * provide more specific validation error messages.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export type GuardedNumberPropertyOptions = NumberPropertyOptions & { getPhetioSpecificValidationError: ( value: number ) => string | null };

export class GuardedNumberProperty extends NumberProperty {
  protected readonly getPhetioSpecificValidationError: ( number: number ) => string | null;

  public constructor( value: number, providedOptions: GuardedNumberPropertyOptions ) {
    const options = optionize<GuardedNumberPropertyOptions, EmptySelfOptions, NumberPropertyOptions>()( {
      phetioOuterType: () => GuardedNumberPropertyIO
    }, providedOptions );
    super( value, options );

    this.getPhetioSpecificValidationError = options.getPhetioSpecificValidationError;
  }
}

const GuardedNumberPropertyIO = new IOType( 'GuardedNumberPropertyIO', {
  supertype: NumberProperty.NumberPropertyIO,
  parameterTypes: [ NumberIO ],
  methods: {
    getValidationError: {
      returnType: NullableIO( StringIO ),
      parameterTypes: [ NumberIO ],
      implementation: function( this: GuardedNumberProperty, value: number ) {

        // Fails early on the first error, checking the superclass validation first
        return this.getValidationError( value ) || this.getPhetioSpecificValidationError( value );
      },
      documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
    }
  }
} );

densityBuoyancyCommon.register( 'GuardedNumberProperty', GuardedNumberProperty );