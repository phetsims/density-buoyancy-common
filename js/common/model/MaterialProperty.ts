// Copyright 2024, University of Colorado Boulder

/**
 * A Property of a Material with build in Property support for accessing the current Material's densityProperty.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { PropertyOptions } from '../../../../axon/js/Property.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Material from './Material.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import MappedWrappedProperty from './MappedWrappedProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';

type SelfOptions = EmptySelfOptions;

type MaterialPropertyOptions = SelfOptions & PropertyOptions<Material> & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class MaterialProperty extends MappedWrappedProperty<Material> {
  public readonly densityProperty: TReadOnlyProperty<number>;
  public readonly customMaterial: Material;

  public constructor( material: Material, createCustomMaterial: ( tandem: Tandem ) => Material, providedOptions: MaterialPropertyOptions ) {
    const customMaterial = createCustomMaterial( providedOptions.tandem.createTandem( 'customMaterial' ) );
    super( material, customMaterial, providedOptions );
    this.densityProperty = this.dynamicValueProperty;
    this.customMaterial = this.customValue;
  }
}

densityBuoyancyCommon.register( 'MaterialProperty', MaterialProperty );