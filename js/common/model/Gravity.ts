// Copyright 2019-2024, University of Colorado Boulder

/**
 * Represents different gravity values, including a custom option.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { HasValueProperty } from './MappedWrappedProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';

const customStringProperty = DensityBuoyancyCommonStrings.gravity.customStringProperty;

export type GravityOptions = {
  nameProperty: TReadOnlyProperty<string>;
  tandemName: string;

  // m/s^2
  value: number;

  custom?: boolean;
  hidden?: boolean;
};

export default class Gravity implements HasValueProperty {

  public readonly nameProperty: TReadOnlyProperty<string>;
  public readonly tandemName: string;
  public readonly gravityValueProperty: NumberProperty;
  public readonly custom: boolean;
  public readonly hidden: boolean;

  public constructor( providedOptions: GravityOptions ) {

    const options = optionize<GravityOptions, GravityOptions>()( {
      custom: false,
      hidden: false
    }, providedOptions );

    this.nameProperty = options.nameProperty;
    this.tandemName = options.tandemName;

    // TODO: Make sure gravityValueProperty is reset, see https://github.com/phetsims/density-buoyancy-common/issues/256
    this.gravityValueProperty = new NumberProperty( options.value, {
      // TODO: Instrumentation, see https://github.com/phetsims/density-buoyancy-common/issues/256
      // tandem: options.tandem
    } );
    this.custom = options.custom;
    this.hidden = options.hidden;
  }

  // TODO: value is too abstract and generic, prefer something like acceleration or gravityAmount or gravityValue, see https://github.com/phetsims/density-buoyancy-common/issues/256
  public get value(): number {
    return this.gravityValueProperty.value;
  }

  public get valueProperty(): TProperty<number> {
    return this.gravityValueProperty;
  }

  /**
   * Returns a custom material that can be modified at will.
   */
  public static createCustomGravity( value: number ): Gravity {
    return new Gravity( {
      nameProperty: customStringProperty,
      tandemName: 'custom',
      value: value,
      custom: true
    } );
  }

  public static readonly EARTH = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.earthStringProperty,
    tandemName: 'earth',
    value: DensityBuoyancyCommonQueryParameters.gEarth
  } );

  public static readonly JUPITER = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.jupiterStringProperty,
    tandemName: 'jupiter',
    value: 24.8
  } );

  public static readonly MOON = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.moonStringProperty,
    tandemName: 'moon',
    value: 1.6
  } );

  public static readonly PLANET_X = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.planetXStringProperty,
    tandemName: 'planetX',
    value: 19.6,
    hidden: true
  } );

  private static readonly GRAVITIES = [
    Gravity.EARTH,
    Gravity.JUPITER,
    Gravity.MOON,
    Gravity.PLANET_X
  ];
  public static readonly GravityIO = new IOType<Gravity, GravityState>( 'GravityIO', {
    valueType: Gravity,
    documentation: 'Represents a specific value of gravity (m/s^2)',
    toStateObject: function( gravity: Gravity ): GravityState {
      return {
        tandemName: gravity.tandemName,
        value: gravity.value,
        custom: gravity.custom,
        hidden: gravity.hidden
      };
    },
    fromStateObject: ( stateObject: GravityState ) => {

      if ( stateObject.custom ) {
        return new Gravity( combineOptions<GravityOptions>( {
          nameProperty: customStringProperty
        }, stateObject as unknown as GravityOptions ) );
      }
      else {
        return _.find( Gravity.GRAVITIES, gravity => gravity.value === stateObject.value )!;
      }
    },
    stateSchema: {
      tandemName: NullableIO( StringIO ),
      value: NumberIO,
      custom: BooleanIO,
      hidden: BooleanIO
    }
  } );
}

type GravityState = {
  tandemName: string;
  value: number;
  custom: boolean;
  hidden: boolean;
};

densityBuoyancyCommon.register( 'Gravity', Gravity );