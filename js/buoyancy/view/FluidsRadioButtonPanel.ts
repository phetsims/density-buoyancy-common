// Copyright 2024, University of Colorado Boulder

/**
 * A panel that holds radio buttons for selecting what fluid the pool has in it.
 *
 * TODO: rename to FluidSelectionPanel? https://github.com/phetsims/buoyancy-basics/issues/4
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import { EmptySelfOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import TProperty from '../../../../axon/js/TProperty.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';


// Any others are invisible in the radio buttons, and are only available through PhET-iO if a client decides
// to show them, https://github.com/phetsims/buoyancy/issues/58
const VISIBLE_FLUIDS = [
  Material.GASOLINE,
  Material.WATER,
  Material.SEAWATER,
  Material.HONEY,
  Material.MERCURY
];

type FluidsRadioButtonPanelOptions = WithRequired<PanelOptions, 'tandem'>;

export default class FluidsRadioButtonPanel extends Panel {

  public constructor( private readonly liquidMaterialProperty: TProperty<Material>, providedOptions?: FluidsRadioButtonPanelOptions ) {

    const options = optionize3<FluidsRadioButtonPanelOptions, EmptySelfOptions, PanelOptions>()( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, providedOptions );

    const radioButtonLabelOptions = {
      font: new PhetFont( 14 ),
      maxWidth: 120
    };
    const radioButtonGroupTandem = options.tandem.createTandem( 'liquidMaterialRadioButtonGroup' );


    const fluidBox = new HBox( {
      spacing: 20,
      children: DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS.map( material => {
        return new AquaRadioButton( liquidMaterialProperty, material,
          new Text( material.nameProperty, radioButtonLabelOptions ), {
            tandem: radioButtonGroupTandem.createTandem( `${material.tandemName}RadioButton` ),
            visible: VISIBLE_FLUIDS.includes( material )
          } );
      } )
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


    liquidMaterialProperty instanceof ReadOnlyProperty && this.addLinkedElement( liquidMaterialProperty, {
      tandem: radioButtonGroupTandem.createTandem( 'property' )
    } );
  }

}

densityBuoyancyCommon.register( 'FluidsRadioButtonPanel', FluidsRadioButtonPanel );