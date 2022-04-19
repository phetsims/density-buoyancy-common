// Copyright 2019-2022, University of Colorado Boulder

/**
 * Represents different gravity values, including a custom option.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import optionize from '../../../../phet-core/js/optionize.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';

export type GravityOptions = {
  name: string;
  tandemName: string;

  // m/s^2
  value: number;

  custom?: boolean;
  hidden?: boolean;
};

export default class Gravity {

  public name: string;
  public tandemName: string;
  public value: number;
  public custom: boolean;
  public hidden: boolean;

  constructor( providedConfig: GravityOptions ) {

    const config = optionize<GravityOptions, GravityOptions>()( {
      custom: false,
      hidden: false
    }, providedConfig );

    this.name = config.name;
    this.tandemName = config.tandemName;
    this.value = config.value;
    this.custom = config.custom;
    this.hidden = config.hidden;
  }

  /**
   * Returns a custom material that can be modified at will.
   */
  static createCustomGravity( value: number ): Gravity {
    return new Gravity( {
      name: densityBuoyancyCommonStrings.gravity.custom,
      tandemName: 'custom',
      value: value,
      custom: true
    } );
  }


  static EARTH = new Gravity( {
    name: densityBuoyancyCommonStrings.gravity.earth,
    tandemName: 'earth',
    value: DensityBuoyancyCommonQueryParameters.gEarth
  } );

  static JUPITER = new Gravity( {
    name: densityBuoyancyCommonStrings.gravity.jupiter,
    tandemName: 'jupiter',
    value: 24.8
  } );

  static MOON = new Gravity( {
    name: densityBuoyancyCommonStrings.gravity.moon,
    tandemName: 'moon',
    value: 1.6
  } );

  static PLANET_X = new Gravity( {
    name: densityBuoyancyCommonStrings.gravity.planetX,
    tandemName: 'planetX',
    value: 19.6,
    hidden: true
  } );

  static GRAVITIES: Gravity[];
  static GravityIO: IOType;
}

Gravity.GRAVITIES = [
  Gravity.EARTH,
  Gravity.JUPITER,
  Gravity.MOON,
  Gravity.PLANET_X
];

Gravity.GravityIO = new IOType( 'GravityIO', {
  valueType: Gravity,
  documentation: 'Represents a specific value of gravity (m/s^2)',
  toStateObject: ( gravity: Gravity ) => {
    return {
      name: gravity.name,
      tandemName: gravity.tandemName,
      value: gravity.value,
      custom: gravity.custom,
      hidden: gravity.hidden
    };
  },
  fromStateObject: ( stateObject: any ) => {
    if ( stateObject.custom ) {
      return new Gravity( stateObject );
    }
    else {
      return _.find( Gravity.GRAVITIES, gravity => gravity.value === stateObject.value );
    }
  },
  stateSchema: {
    name: StringIO,
    tandemName: NullableIO( StringIO ),
    value: NumberIO,
    custom: BooleanIO,
    hidden: BooleanIO
  }
} );

densityBuoyancyCommon.register( 'Gravity', Gravity );
