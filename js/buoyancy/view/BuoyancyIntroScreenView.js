// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignPropertyBox, HBox, Node, Text } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import { BlockSet } from '../model/BuoyancyIntroModel.js';

// constants
const blockSetStringMap = {
  [ BlockSet.SAME_MASS.name ]: densityBuoyancyCommonStrings.blockSet.sameMass,
  [ BlockSet.SAME_VOLUME.name ]: densityBuoyancyCommonStrings.blockSet.sameVolume,
  [ BlockSet.SAME_DENSITY.name ]: densityBuoyancyCommonStrings.blockSet.sameDensity
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class BuoyancyIntroScreenView extends DensityBuoyancyScreenView {

  /**
   * @param {BuoyancyIntroModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    super( model, merge( {
      // Custom just for this screen
      cameraLookAt: new Vector3( 0, -0.1, 0 )
    }, options ) );

    const blockSetControl = new VerticalAquaRadioButtonGroup( model.blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
      return {
        node: new Text( blockSetStringMap[ blockSet.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 160
        } ),
        value: blockSet
      };
    } ) );
    const blockSetPanel = new Panel( blockSetControl, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignPropertyBox( blockSetPanel, this.visibleBoundsProperty, {
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const displayOptionsPanel = new Panel( new DisplayOptionsNode( model ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );
    this.addChild( new AlignPropertyBox( displayOptionsPanel, this.visibleBoundsProperty, {
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const radioButtonLabelOptions = {
      font: new PhetFont( 14 ),
      maxWidth: 120
    };
    const fluidBox = new HBox( {
      spacing: 20,
      children: [
        new AquaRadioButton( model.liquidMaterialProperty, Material.OIL, new Text( Material.OIL.name, radioButtonLabelOptions ) ),
        new AquaRadioButton( model.liquidMaterialProperty, Material.WATER, new Text( Material.WATER.name, radioButtonLabelOptions ) ),
        new AquaRadioButton( model.liquidMaterialProperty, Material.SEAWATER, new Text( Material.SEAWATER.name, radioButtonLabelOptions ) )
      ]
    } );
    const fluidTitle = new Text( densityBuoyancyCommonStrings.fluid, {
      font: new PhetFont( { size: 14, weight: 'bold' } ),
      right: fluidBox.left,
      bottom: fluidBox.top - 3,
      maxWidth: 160
    } );
    const fluidPanel = new Panel( new Node( {
      children: [ fluidTitle, fluidBox ]
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignPropertyBox( fluidPanel, this.visibleBoundsProperty, {
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyIntroScreenView', BuoyancyIntroScreenView );
export default BuoyancyIntroScreenView;