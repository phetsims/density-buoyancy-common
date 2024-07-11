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
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material, { MaterialName } from '../model/Material.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

type SelfMaterialControlNodeOptions = {

  // A label, if provided to be placed to the right of the ComboBox
  labelNode?: Node | null;

  // If a custom material should be added to the ComboBox
  supportCustomMaterial?: boolean;

  // If a hidden material (Mystery materials for example) should be added to the ComboBox
  supportHiddenMaterial?: boolean;

  minCustomMass?: number;
  maxCustomMass?: number;
  minCustomVolumeLiters?: number;
  maxVolumeLiters?: number;

} & PickRequired<PhetioObjectOptions, 'tandem'>;

export type MaterialControlNodeOptions = SelfMaterialControlNodeOptions & VBoxOptions;

export default class MaterialControlNode extends VBox {
  protected customDensityRange: Range;

  public constructor( materialProperty: Property<Material>,
                      volumeProperty: Property<number>,
                      materials: Material[],
                      listParent: Node,
                      providedOptions: MaterialControlNodeOptions ) {


    const options = optionize<MaterialControlNodeOptions, SelfMaterialControlNodeOptions, VBoxOptions>()( {
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

    this.customDensityRange = new Range(
      options.minCustomMass / options.maxVolumeLiters * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER,

      // Prevent divide by zero errors (infinity) with a manual, tiny number
      options.maxCustomMass / ( options.minCustomVolumeLiters ) * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
    );

    if ( !options.supportHiddenMaterial ) {
      materials = materials.filter( material => !material.hidden );
    }

    const materialNames: MaterialName[] = [ ...materials.map( material => material.identifier ) ];
    options.supportCustomMaterial && materialNames.push( 'CUSTOM' );

    const comboMaxWidth = 110;

    const regularMaterials = materials.filter( material => !material.hidden );
    const mysteryMaterials = materials.filter( material => material.hidden );

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

    // TODO: Yar? https://github.com/phetsims/density-buoyancy-common/issues/256
    const customMaterial = Material.createCustomSolidMaterial( {
      densityRange: this.customDensityRange,
      density: materialProperty.value.density
    } );
    volumeProperty.link( volume => {
      if ( materialProperty.value.custom ) {

        // Handle our minimum volume if we're switched to custom (if needed)
        const maxVolume = Math.max( volume, options.minCustomVolumeLiters / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER );
        customMaterial.densityProperty.value = Utils.clamp( materialProperty.value.density, options.minCustomMass / maxVolume, options.maxCustomMass / maxVolume );
      }
    } );

    // TODO: But can we just use the validValues of the provided MaterialProperty, https://github.com/phetsims/density-buoyancy-common/issues/256
    // TODO: But hidden ones!!! https://github.com/phetsims/density-buoyancy-common/issues/256
    const comboBox = new ComboBox( materialProperty, [
      ...regularMaterials.map( materialToItem ),
      ...( options.supportCustomMaterial ? [ {
        value: customMaterial,
        createNode: () => new Text( DensityBuoyancyCommonStrings.material.customStringProperty, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: comboMaxWidth
        } ),
        tandemName: 'customItem'
      } ] : [] ),
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