// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommonStrings from '../../density-buoyancy-common-strings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityCompareModel from '../model/DensityCompareModel.js';

const modeSameDensityString = densityBuoyancyCommonStrings.mode.sameDensity;
const modeSameMassString = densityBuoyancyCommonStrings.mode.sameMass;
const modeSameVolumeString = densityBuoyancyCommonStrings.mode.sameVolume;

// constants
const modeStringMap = {
  [ DensityCompareModel.Mode.SAME_MASS.name ]: modeSameMassString,
  [ DensityCompareModel.Mode.SAME_VOLUME.name ]: modeSameVolumeString,
  [ DensityCompareModel.Mode.SAME_DENSITY.name ]: modeSameDensityString
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

    if ( !this.enabled ) {
      return this;
    }

    const modeControl = new VerticalAquaRadioButtonGroup( model.modeProperty, DensityCompareModel.Mode.VALUES.map( mode => {
      return {
        node: new Text( modeStringMap[ mode.name ], { font: new PhetFont( 12 ) } ),
        value: mode
      };
    } ), {
      spacing: 8
    } );
    const modePanel = new Panel( modeControl, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( modePanel, {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityCompareScreenView', DensityCompareScreenView );
export default DensityCompareScreenView;