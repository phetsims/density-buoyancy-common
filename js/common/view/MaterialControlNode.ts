// Copyright 2024, University of Colorado Boulder

/**
 * A control that changes the Material (via provided Property), but also supports handling special cases for custom
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
import Material, { MaterialName } from '../model/Material.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';

const LITERS_IN_CUBIC_METER = 1000;

type SelfMaterialControlNodeOptions = {
  labelNode?: Node | null;
  minCustomMass?: number;
  maxCustomMass?: number;
  minCustomVolumeLiters?: number;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

export type MaterialControlNodeOptions = SelfMaterialControlNodeOptions & VBoxOptions;

export default class MaterialControlNode extends VBox {
  public constructor( materialProperty: Property<Material>,
                      volumeProperty: Property<number>,
                      materials: Material[],
                      listParent: Node,
                      providedOptions: MaterialControlNodeOptions ) {


    const options = optionize<MaterialControlNodeOptions, SelfMaterialControlNodeOptions, VBoxOptions>()( {
      labelNode: null,
      minCustomMass: 0.5,
      maxCustomMass: 10,
      minCustomVolumeLiters: 1
    }, providedOptions );

    super( {
      spacing: 15,
      align: 'left'
    } );

    const materialNames: MaterialName[] = [ ...materials.map( material => material.identifier! ), 'CUSTOM' ];

    const comboBoxMaterialProperty = new DynamicProperty( new Property( materialProperty ), {
      bidirectional: true,
      map: ( material: Material ) => {
        return material.custom ? 'CUSTOM' : material.identifier!;
      },
      inverseMap: ( materialName: MaterialName ): Material => {
        if ( materialName === 'CUSTOM' ) {
          // Handle our minimum volume if we're switched to custom (if needed)
          const volume = Math.max( volumeProperty.value, options.minCustomVolumeLiters / LITERS_IN_CUBIC_METER );
          return Material.createCustomSolidMaterial( {
            density: Utils.clamp( materialProperty.value.density, options.minCustomMass / volume, options.maxCustomMass / volume )
          } );
        }
        else {
          return Material[ materialName ] as Material;
        }
      },
      reentrant: true,
      phetioState: false,
      tandem: options.tandem.createTandem( 'comboBoxMaterialProperty' ),
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
          tandemName: `${material.tandemName}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
        };
      } ),
      {
        value: 'CUSTOM',
        createNode: () => new Text( DensityBuoyancyCommonStrings.material.customStringProperty, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: comboMaxWidth
        } ),
        tandemName: `custom${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      }
    ], listParent, {
      xMargin: 8,
      yMargin: 4,
      tandem: options.tandem.createTandem( 'comboBox' )
    } );

    this.children = [
      new HBox( {
        spacing: 5,
        children: [
          comboBox,
          ...( [ options.labelNode ].filter( _.identity ) as Node[] )
        ]
      } )
    ];
  }
}

densityBuoyancyCommon.register( 'MaterialControlNode', MaterialControlNode );
