// Copyright 2020-2021, University of Colorado Boulder

/**
 * The main view for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import { AlignPropertyBox } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import { VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import { BlockSet } from '../model/DensityMysteryModel.js';
import DensityTableNode from './DensityTableNode.js';

// constants
const blockSetStringMap = {
  [ BlockSet.SET_1.name ]: densityBuoyancyCommonStrings.blockSet.set1,
  [ BlockSet.SET_2.name ]: densityBuoyancyCommonStrings.blockSet.set2,
  [ BlockSet.SET_3.name ]: densityBuoyancyCommonStrings.blockSet.set3,
  [ BlockSet.RANDOM.name ]: densityBuoyancyCommonStrings.blockSet.random
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class DensityMysteryScreenView extends DensityBuoyancyScreenView {
  /**
   * @param {DensityMysteryModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    const tandem = options.tandem;

    super( model, merge( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    const densityTableAccordionBox = new AccordionBox( new DensityTableNode(), merge( {
      titleNode: new Text( densityBuoyancyCommonStrings.densityTable, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200
      } ),
      expandedProperty: model.densityTableExpandedProperty,
      tandem: tandem.createTandem( 'densityTableAccordionBox' )
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignPropertyBox( densityTableAccordionBox, this.visibleBoundsProperty, {
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const blockSetTandemMap = {
      [ BlockSet.SET_1 ]: 'set1',
      [ BlockSet.SET_2 ]: 'set2',
      [ BlockSet.SET_3 ]: 'set3',
      [ BlockSet.RANDOM ]: 'random'
    };

    const blocksPanelTandem = tandem.createTandem( 'blocksPanel' );

    const blocksRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
      return {
        node: new Text( blockSetStringMap[ blockSet.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 65
        } ),
        value: blockSet,
        tandemName: `${blockSetTandemMap[ blockSet ]}RadioButton`
      };
    } ), {
      spacing: 8,
      tandem: blocksPanelTandem.createTandem( 'blocksRadioButtonGroup' )
    } );
    const randomBlocksRefreshButton = new RefreshButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.regenerate( BlockSet.RANDOM );
      },
      iconHeight: 20,
      tandem: blocksPanelTandem.createTandem( 'randomBlocksRefreshButton' )
    } );
    const blockSetContent = new VBox( {
      spacing: 10
    } );

    // Include the refresh button when in random blockSet.
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.blockSetProperty.link( blockSet => {
      blockSetContent.children = blockSet === BlockSet.RANDOM ? [
        blocksRadioButtonGroup,
        randomBlocksRefreshButton
      ] : [
        blocksRadioButtonGroup
      ];
    } );

    const blockSetPanel = new Panel( new VBox( {
      children: [
        new Text( densityBuoyancyCommonStrings.blocks, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 85
        } ),
        blockSetContent
      ],
      spacing: 10,
      align: 'left'
    } ), merge( {
      tandem: blocksPanelTandem
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );

    this.addChild( new AlignPropertyBox( blockSetPanel, this.visibleBoundsProperty, {
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityMysteryScreenView', DensityMysteryScreenView );
export default DensityMysteryScreenView;