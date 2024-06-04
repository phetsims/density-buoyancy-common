// Copyright 2024, University of Colorado Boulder

/**
 * A panel that holds radio buttons for selecting what fluid the pool has in it.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import { EmptySelfOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import Property from '../../../../axon/js/Property.js';

// Any others are invisible in the radio buttons, and are only available through PhET-iO if a client decides
// to show them, https://github.com/phetsims/buoyancy/issues/58
const VISIBLE_FLUIDS = [
  Material.GASOLINE,
  Material.WATER,
  Material.SEAWATER,
  Material.HONEY,
  Material.MERCURY
];

type FluidSelectionPanelOptions = WithRequired<PanelOptions, 'tandem'>;


export default class FluidSelectionPanel extends Panel {

  public constructor( liquidMaterialProperty: Property<Material>, listParent: Node, providedOptions?: FluidSelectionPanelOptions ) {

    const options = optionize3<FluidSelectionPanelOptions, EmptySelfOptions, PanelOptions>()( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, providedOptions );

    const comboBoxTandem = options.tandem.createTandem( 'fluidSelectionComboBox' );

    const fluidBox = new ComboBox(
      liquidMaterialProperty,
      DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS.map( material => {
        return {
          value: material,
          createNode: () => new Text( material.nameProperty, {
            font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
            maxWidth: 160
          } ),
          comboBoxListItemNodeOptions: {
            visible: VISIBLE_FLUIDS.includes( material )
          },
          tandemName: `${material.tandemName}Item`,
          a11yName: material.nameProperty
        };
      } ),
      listParent, {
        tandem: comboBoxTandem,
        listPosition: 'above'
      } );

    const fluidTitle = new Text( DensityBuoyancyCommonStrings.fluidStringProperty, {
      font: DensityBuoyancyCommonConstants.TITLE_FONT,
      maxWidth: 160
    } );

    super( new VBox( {
      children: [ fluidTitle, fluidBox ],
      spacing: 3,
      align: 'left'
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addLinkedElement( liquidMaterialProperty, {
      tandem: comboBoxTandem.createTandem( 'property' )
    } );
  }
}

densityBuoyancyCommon.register( 'FluidSelectionPanel', FluidSelectionPanel );