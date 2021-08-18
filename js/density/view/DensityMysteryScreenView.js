// Copyright 2020-2021, University of Colorado Boulder

/**
 * The main view for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import AlignPropertyBox from '../../../../scenery/js/layout/AlignPropertyBox.js';
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
   * @param {Object} [options]
   */
  constructor( model, options ) {

    const tandem = options.tandem;

    super( model, merge( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    const densityTableBox = new AccordionBox( new DensityTableNode(), merge( {
      titleNode: new Text( densityBuoyancyCommonStrings.densityTable, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200
      } ),
      expandedProperty: model.densityTableExpandedProperty,
      tandem: tandem.createTandem( 'densityTableBox' )
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignPropertyBox( densityTableBox, this.visibleBoundsProperty, {
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const modeTandemMap = {
      [ DensityMysteryModel.Mode.SET_1 ]: 'set1',
      [ DensityMysteryModel.Mode.SET_2 ]: 'set2',
      [ DensityMysteryModel.Mode.SET_3 ]: 'set3',
      [ DensityMysteryModel.Mode.RANDOM ]: 'random'
    };

    const modeRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.modeProperty, DensityMysteryModel.Mode.VALUES.map( mode => {
      return {
        node: new Text( modeStringMap[ mode.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 65
        } ),
        value: mode,
        tandemName: `${modeTandemMap[ mode ]}RadioButton`
      };
    } ), {
      spacing: 8,
      tandem: tandem.createTandem( 'modeRadioButtonGroup' )
    } );
    const modeRefreshButton = new RefreshButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.regenerate( DensityMysteryModel.Mode.RANDOM );
      },
      iconHeight: 20,
      tandem: tandem.createTandem( 'modeRefreshButton' )
    } );
    const modeContent = new VBox( {
      spacing: 10
    } );

    // Include the refresh button when in random mode.
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.modeProperty.link( mode => {
      modeContent.children = mode === DensityMysteryModel.Mode.RANDOM ? [
        modeRadioButtonGroup,
        modeRefreshButton
      ] : [
        modeRadioButtonGroup
      ];
    } );

    const modePanel = new Panel( new VBox( {
      children: [
        new Text( densityBuoyancyCommonStrings.blocks, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 85
        } ),
        modeContent
      ],
      spacing: 10,
      align: 'left'
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignPropertyBox( modePanel, this.visibleBoundsProperty, {
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityMysteryScreenView', DensityMysteryScreenView );
export default DensityMysteryScreenView;