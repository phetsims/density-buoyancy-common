// Copyright 2024, University of Colorado Boulder

/**
 * A control that changes the Material (via provided Property), but also supports handling special cases for custom or hidden
 * materials.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { HBox, Node, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material, { CUSTOM_MATERIAL_NAME, MaterialName } from '../model/Material.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Range from '../../../../dot/js/Range.js';

const LITERS_IN_CUBIC_METER = 1000;

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
      spacing: 15,
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

    const materialNames: MaterialName[] = [ ...materials.map( material => material.identifier! ) ];
    options.supportCustomMaterial && materialNames.push( CUSTOM_MATERIAL_NAME );

    const comboBoxMaterialProperty = new DynamicProperty( new Property( materialProperty ), {
      bidirectional: true,
      map: ( material: Material ) => material.custom ? CUSTOM_MATERIAL_NAME : material.identifier!,
      inverseMap: ( materialName: MaterialName ): Material => {
        if ( materialName === CUSTOM_MATERIAL_NAME ) {
          // Handle our minimum volume if we're switched to custom (if needed)
          const volume = Math.max( volumeProperty.value, options.minCustomVolumeLiters / LITERS_IN_CUBIC_METER );
          return Material.createCustomSolidMaterial( {
            density: Utils.clamp( materialProperty.value.density, options.minCustomMass / volume, options.maxCustomMass / volume ),
            densityRange: this.customDensityRange
          } );
        }
        else {
          return Material[ materialName ] as Material;
        }
      },
      reentrant: true,
      phetioState: false,
      tandem: options.tandem.createTandem( 'comboBoxMaterialProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Current material of the block. Changing the material will result in changes to the mass, but the volume will remain the same.',
      validValues: materialNames,
      phetioValueType: StringIO
    } );

    const comboMaxWidth = options.labelNode ? 110 : 160;
    const comboBox = new ComboBox( comboBoxMaterialProperty, [
      ...materials.map( material => {
        return {
          value: material.identifier!,
          createNode: () => new Text( material.nameProperty, {
            font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
            maxWidth: comboMaxWidth
          } ),
          tandemName: `${material.tandemName}Item`,
          a11yName: material.nameProperty
        };
      } ),
      ...( options.supportCustomMaterial ? [ {
        value: CUSTOM_MATERIAL_NAME,
        createNode: () => new Text( DensityBuoyancyCommonStrings.material.customStringProperty, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: comboMaxWidth
        } ),
        tandemName: 'customItem'
      }
      ] : [] )
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