// Copyright 2024, University of Colorado Boulder

/**
 * A Property of a Material with build in Property support for accessibing the current Material's densityProperty.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Material from './Material.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';

type MaterialPropertyOptions = PropertyOptions<Material>;

export default class MaterialProperty extends Property<Material> {
  public readonly densityProperty: TReadOnlyProperty<number>;

  public constructor( material: Material, providedOptions?: MaterialPropertyOptions ) {
    super( material, providedOptions );

    // TODO: phet-io editable density? https://github.com/phetsims/density-buoyancy-common/issues/256
    this.densityProperty = new DynamicProperty<number, number, Material>( this, {
      bidirectional: false,
      derive: material => material.densityProperty
    } );
  }
}

densityBuoyancyCommon.register( 'MaterialProperty', MaterialProperty );