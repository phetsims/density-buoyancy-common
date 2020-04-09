// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityMysteryModel from '../model/DensityMysteryModel.js';
import DensityTableNode from './DensityTableNode.js';

// constants
const modeStringMap = {
  [ DensityMysteryModel.Mode.SET_1.name ]: densityBuoyancyCommonStrings.mode.set1,
  [ DensityMysteryModel.Mode.SET_2.name ]: densityBuoyancyCommonStrings.mode.set2,
  [ DensityMysteryModel.Mode.SET_3.name ]: densityBuoyancyCommonStrings.mode.set3,
  [ DensityMysteryModel.Mode.RANDOM.name ]: densityBuoyancyCommonStrings.mode.random
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class DensityMysteryScreenView extends DensityBuoyancyScreenView {
  /**
   * @param {DensityMysteryModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem, {
      cameraLookAt: new Vector3( 0, 0, 0 )
    } );

    if ( !this.enabled ) {
      return this;
    }

    const densityBox = new AccordionBox( new DensityTableNode(), merge( {
      titleNode: new Text( densityBuoyancyCommonStrings.densityTable, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200
      } ),
      expandedProperty: model.densityTableExpandedProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( densityBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const modeControl = new VerticalAquaRadioButtonGroup( model.modeProperty, DensityMysteryModel.Mode.VALUES.map( mode => {
      return {
        node: new Text( modeStringMap[ mode.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 160
        } ),
        value: mode
      };
    } ), {
      spacing: 8
    } );
    const modeRefreshButton = new RefreshButton( {
      listener: () => model.setup(),
      iconScale: 0.5
    } );
    const modeContent = new VBox( {
      spacing: 10
    } );
    model.modeProperty.link( mode => {
      modeContent.children = mode === DensityMysteryModel.Mode.RANDOM ? [
        modeControl,
        modeRefreshButton
      ] : [
        modeControl
      ];
    } );
    const modePanel = new Panel( new VBox( {
      children: [
        new Text( densityBuoyancyCommonStrings.blocks, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        modeContent
      ],
      spacing: 10,
      align: 'left'
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( modePanel, {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityMysteryScreenView', DensityMysteryScreenView );
export default DensityMysteryScreenView;