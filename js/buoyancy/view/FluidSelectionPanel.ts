// Copyright 2024, University of Colorado Boulder

/**
 * A panel that holds radio buttons for selecting what fluid the pool has in it.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import { EmptySelfOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import MaterialProperty from '../../common/model/MaterialProperty.js';

type FluidSelectionPanelOptions = WithRequired<PanelOptions, 'tandem'>;

export default class FluidSelectionPanel extends Panel {

  public constructor( fluidMaterialProperty: MaterialProperty, listParent: Node, providedOptions?: FluidSelectionPanelOptions ) {

    const options = optionize4<FluidSelectionPanelOptions, EmptySelfOptions, PanelOptions>()( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, {
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions );

    const comboBoxTandem = options.tandem.createTandem( 'comboBox' );

    const fluidBox = new ComboBox(
      fluidMaterialProperty,
      fluidMaterialProperty.availableValues.map( material => {
        return {
          value: material,
          createNode: () => new Text( material.nameProperty, {
            font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
            maxWidth: 160
          } ),
          tandemName: `${material.tandem.name}Item`,
          a11yName: material.nameProperty
        };
      } ),
      listParent, {
        tandem: comboBoxTandem,
        listPosition: 'above',
        phetioVisiblePropertyInstrumented: false
      } );

    const fluidTitle = new Text( DensityBuoyancyCommonStrings.fluidStringProperty, {
      font: DensityBuoyancyCommonConstants.TITLE_FONT,
      maxWidth: 160
    } );

    super( new VBox( {
      children: [ fluidTitle, fluidBox ],
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'left'
    } ), options );
  }
}

densityBuoyancyCommon.register( 'FluidSelectionPanel', FluidSelectionPanel );