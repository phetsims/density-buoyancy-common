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
import optionize from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';

type SelfOptions = {
  customMaterial?: Material;
};

type MaterialPropertyOptions = PropertyOptions<Material> & SelfOptions;

export default class MaterialProperty extends MappedWrappedProperty<Material> {
  public readonly densityProperty: TReadOnlyProperty<number>;
  public readonly customMaterial: Material;

  public constructor( material: Material, providedOptions?: MaterialPropertyOptions ) {

    const options = optionize<MaterialPropertyOptions, SelfOptions, PropertyOptions<Material>>()( {

      customMaterial: Material.createCustomSolidMaterial( providedOptions && providedOptions.tandem ? providedOptions.tandem.createTandem( 'customMaterial' ) : Tandem.OPT_OUT, {
        density: material.density,

        // TODO: It is incorrect to take the range of the default value, see https://github.com/phetsims/density-buoyancy-common/issues/256
        densityRange: material.densityProperty.range
      } )
    }, providedOptions );

    super( material, options.customMaterial, providedOptions );

    this.densityProperty = this.dynamicValueProperty;
    this.customMaterial = this.customValue;
  }
}

densityBuoyancyCommon.register( 'MaterialProperty', MaterialProperty );