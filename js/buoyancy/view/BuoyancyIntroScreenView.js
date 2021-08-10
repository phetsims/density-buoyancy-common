// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignPropertyBox from '../../../../scenery/js/layout/AlignPropertyBox.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import BuoyancyIntroModel from '../model/BuoyancyIntroModel.js';

// constants
const modeStringMap = {
  [ BuoyancyIntroModel.Mode.SAME_MASS.name ]: densityBuoyancyCommonStrings.mode.sameMass,
  [ BuoyancyIntroModel.Mode.SAME_VOLUME.name ]: densityBuoyancyCommonStrings.mode.sameVolume,
  [ BuoyancyIntroModel.Mode.SAME_DENSITY.name ]: densityBuoyancyCommonStrings.mode.sameDensity
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class BuoyancyIntroScreenView extends DensityBuoyancyScreenView {

  /**
   * @param {BuoyancyIntroModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem, {
      // Custom just for this screen
      cameraLookAt: new Vector3( 0, -0.1, 0 )
    } );

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    const modeControl = new VerticalAquaRadioButtonGroup( model.modeProperty, BuoyancyIntroModel.Mode.VALUES.map( mode => {
      return {
        node: new Text( modeStringMap[ mode.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 160
        } ),
        value: mode
      };
    } ) );
    const modePanel = new Panel( modeControl, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignPropertyBox( modePanel, this.visibleBoundsProperty, {
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