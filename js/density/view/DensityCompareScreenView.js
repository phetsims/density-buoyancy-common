// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import AlignPropertyBox from '../../../../scenery/js/layout/AlignPropertyBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityCompareModel from '../model/DensityCompareModel.js';

// constants
const modeStringMap = {
  [ DensityCompareModel.Mode.SAME_MASS.name ]: densityBuoyancyCommonStrings.mode.sameMass,
  [ DensityCompareModel.Mode.SAME_VOLUME.name ]: densityBuoyancyCommonStrings.mode.sameVolume,
  [ DensityCompareModel.Mode.SAME_DENSITY.name ]: densityBuoyancyCommonStrings.mode.sameDensity
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class DensityCompareScreenView extends DensityBuoyancyScreenView {
  /**
   * @param {DensityCompareModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem, {
      cameraLookAt: new Vector3( 0, 0, 0 )
    } );

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    const modeTandemMap = {
      [ DensityCompareModel.Mode.SAME_MASS ]: 'sameMass',
      [ DensityCompareModel.Mode.SAME_VOLUME ]: 'sameVolume',
      [ DensityCompareModel.Mode.SAME_DENSITY ]: 'sameDensity'
    };

    const modeRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.modeProperty, DensityCompareModel.Mode.VALUES.map( mode => {
      return {
        node: new Text( modeStringMap[ mode.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 160
        } ),
        value: mode,
        tandemName: `${modeTandemMap[ mode ]}RadioButton`
      };
    } ), {
      spacing: 8,
      tandem: tandem.createTandem( 'modeRadioButtonGroup' )
    } );
    const modePanel = new Panel( new VBox( {
      children: [
        new Text( densityBuoyancyCommonStrings.blocks, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        modeRadioButtonGroup
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

densityBuoyancyCommon.register( 'DensityCompareScreenView', DensityCompareScreenView );
export default DensityCompareScreenView;