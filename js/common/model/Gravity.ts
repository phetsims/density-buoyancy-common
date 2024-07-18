// Copyright 2019-2024, University of Colorado Boulder

/**
 * Represents different gravity values, including a custom option.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { HasValueProperty } from './MappedWrappedProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';

const GRAVITY_TANDEM = Tandem.GLOBAL_MODEL.createTandem( 'gravities' );

type SelfOptions = {
  nameProperty: TReadOnlyProperty<string>;

  // m/s^2
  value: number;

  custom?: boolean;
  hidden?: boolean;
};

export type GravityOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class Gravity extends PhetioObject implements HasValueProperty {

  public readonly nameProperty: TReadOnlyProperty<string>;
  public readonly gravityValueProperty: NumberProperty;
  public readonly custom: boolean;
  public readonly hidden: boolean;

  public constructor( providedOptions: GravityOptions ) {

    const options = optionize<GravityOptions, SelfOptions, PhetioObjectOptions>()( {
      custom: false,
      hidden: false,
      phetioState: false
    }, providedOptions );

    super( options );

    this.nameProperty = options.nameProperty;

    // TODO: Make sure gravityValueProperty is reset, see https://github.com/phetsims/density-buoyancy-common/issues/267
    this.gravityValueProperty = new NumberProperty( options.value, {
      tandem: options.tandem.createTandem( 'gravityValueProperty' )
    } );
    this.custom = options.custom;
    this.hidden = options.hidden;
  }

  public get gravityValue(): number {
    return this.gravityValueProperty.value;
  }

  public get valueProperty(): TProperty<number> {
    return this.gravityValueProperty;
  }

  public static readonly EARTH = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.earthStringProperty,
    tandem: GRAVITY_TANDEM.createTandem( 'earth' ),
    value: DensityBuoyancyCommonQueryParameters.gEarth
  } );

  public static readonly JUPITER = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.jupiterStringProperty,
    tandem: GRAVITY_TANDEM.createTandem( 'jupiter' ),
    value: 24.8
  } );

  public static readonly MOON = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.moonStringProperty,
    tandem: GRAVITY_TANDEM.createTandem( 'moon' ),
    value: 1.6
  } );

  public static readonly PLANET_X = new Gravity( {
    nameProperty: DensityBuoyancyCommonStrings.gravity.planetXStringProperty,
    tandem: GRAVITY_TANDEM.createTandem( 'planetX' ),
    value: 19.6,
    hidden: true
  } );
}

densityBuoyancyCommon.register( 'Gravity', Gravity );