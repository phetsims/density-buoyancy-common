// Copyright 2024, University of Colorado Boulder

/**
 * A control that changes the Material (via provided Property), but also supports handling special cases for custom or hidden
 * materials.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { HBox, Node, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MaterialProperty from '../model/MaterialProperty.js';
import Utils from '../../../../dot/js/Utils.js';

type SelfMaterialControlNodeOptions = {

  syncCustomMaterialDensity?: boolean;

  // A label, if provided to be placed to the right of the ComboBox
  labelNode?: Node | null;

  // If a custom material should be added to the ComboBox
  // TODO: delete this, https://github.com/phetsims/density-buoyancy-common/issues/256
  supportCustomMaterial?: boolean;

  // If a hidden material (Mystery materials for example) should be added to the ComboBox
  // TODO: why can't this just be derived from if you pass in mystery material in the parameter? https://github.com/phetsims/density-buoyancy-common/issues/256
  supportHiddenMaterial?: boolean;

  minCustomMass?: number;
  maxCustomMass?: number;
  minCustomVolumeLiters?: number;
  maxVolumeLiters?: number;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

export type MaterialControlNodeOptions = SelfMaterialControlNodeOptions & VBoxOptions;

export default class MaterialControlNode extends VBox {

  public constructor( materialProperty: MaterialProperty,
                      volumeProperty: Property<number>,
                      materials: Material[],
                      listParent: Node,
                      providedOptions: MaterialControlNodeOptions ) {


    const options = optionize<MaterialControlNodeOptions, SelfMaterialControlNodeOptions, VBoxOptions>()( {
      syncCustomMaterialDensity: true,
      labelNode: null,
      supportCustomMaterial: true,
      supportHiddenMaterial: false,
      minCustomMass: 0.5,
      maxCustomMass: 10,
      minCustomVolumeLiters: 1,
      maxVolumeLiters: 10
    }, providedOptions );

    super( {
      spacing: DensityBuoyancyCommonConstants.SPACING,
      align: 'left'
    } );

    if ( !options.supportHiddenMaterial ) {
      materials = materials.filter( material => !material.hidden );
    }

    const comboMaxWidth = 110;

    // TODO: Should all these be separate options instead of one list that needs parsing? MK does not know, https://github.com/phetsims/density-buoyancy-common/issues/256
    // TODO: sort at usage sites instead? https://github.com/phetsims/density-buoyancy-common/issues/256
    const regularMaterials = materials.filter( material => !material.hidden && !material.custom );
    const customMaterials = materials.filter( material => material.custom );
    const mysteryMaterials = materials.filter( material => material.hidden );

    if ( options.supportCustomMaterial ) {
      assert && assert( customMaterials.length > 0, 'custom please' );
    }
    assert && assert( customMaterials.length <= 1, 'one or less custom materials please' );

    const materialToItem = ( material: Material ) => {
      return {
        value: material,
        createNode: () => new Text( material.nameProperty, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: comboMaxWidth
        } ),
        tandemName: `${material.tandemName}Item`,
        a11yName: material.nameProperty
      };
    };

    // When switching to custom, set the custom density to the previous material's density (clamped just in case).
    // However, when switching from a mystery material, do not change the custom value. This prevents clever students from discovering
    // the mystery values by using the UI instead of by computing them, see https://github.com/phetsims/buoyancy/issues/54
    if ( customMaterials.length > 0 && options.syncCustomMaterialDensity ) {
      materialProperty.lazyLink( ( material, oldMaterial ) => {
        if ( material.custom && !oldMaterial.hidden ) {
          assert && assert( materialProperty.customMaterial === customMaterials[ 0 ], 'I would really rather know what customMaterial we are dealing with' );

          // Handle our minimum volume if we're switched to custom (if needed)
          const maxVolume = Math.max( volumeProperty.value, options.minCustomVolumeLiters / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER );
          materialProperty.customMaterial.densityProperty.value = Utils.clamp( oldMaterial.density, options.minCustomMass / maxVolume, options.maxCustomMass / maxVolume );
        }
      } );
    }

    // TODO: But can we just use the validValues of the provided MaterialProperty, https://github.com/phetsims/density-buoyancy-common/issues/256
    // TODO: But hidden ones!!! https://github.com/phetsims/density-buoyancy-common/issues/256
    const comboBox = new ComboBox( materialProperty, [
      ...regularMaterials.map( materialToItem ),
      ...( options.supportCustomMaterial ? customMaterials.map( materialToItem ) : [] ),
      ...mysteryMaterials.map( materialToItem )
    ], listParent, {
      xMargin: 8,
      yMargin: 4,
      tandem: options.tandem.createTandem( 'comboBox' )
    } );

    this.children = [
      new HBox( {
        spacing: 5,
        justify: 'left',
        children: [
          comboBox,
          ...( [ options.labelNode ].filter( _.identity ) as Node[] )
        ]
      } )
    ];
  }
}

densityBuoyancyCommon.register( 'MaterialControlNode', MaterialControlNode );