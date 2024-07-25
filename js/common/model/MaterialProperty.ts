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
import { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import { Color } from '../../../../scenery/js/imports.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';

type SelfOptions = EmptySelfOptions;

export type MaterialPropertyOptions = SelfOptions & PropertyOptions<Material> & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class MaterialProperty extends MappedWrappedProperty<Material> {
  public readonly densityProperty: TReadOnlyProperty<number>;
  public readonly customMaterial: Material;

  // Note the material could be the customMaterial
  public constructor( material: Material, customMaterial: Material, availableMaterials: Material[], providedOptions: MaterialPropertyOptions ) {
    super( material, customMaterial, availableMaterials, combineOptions<MaterialPropertyOptions>( {
      valueType: Material,
      phetioValueType: ReferenceIO( IOType.ObjectIO ),
      phetioFeatured: true
    }, providedOptions ) );
    this.densityProperty = this.dynamicValueProperty;
    this.customMaterial = this.customValue;
  }

  public override reset(): void {
    super.reset();
    this.customMaterial.reset();
  }

  /**
   * Keep a material's color and opacity to match the liquid color from a given Property<Material>
   *
   * NOTE: Only call this for things that exist for the lifetime of this simulation (otherwise it would leak memory)
   */
  public linkColorProperty( threeMaterial: THREE.MeshPhongMaterial | THREE.MeshLambertMaterial | THREE.MeshBasicMaterial ): void {
    new DynamicProperty<Color, Color, Material>( this, {
      derive: material => {
        assert && assert( material.colorProperty );
        return material.colorProperty!;
      }
    } ).link( ( color: Color ) => {
      threeMaterial.color = ThreeUtils.colorToThree( color );
      threeMaterial.opacity = color.alpha;
    } );
  }
}

densityBuoyancyCommon.register( 'MaterialProperty', MaterialProperty );