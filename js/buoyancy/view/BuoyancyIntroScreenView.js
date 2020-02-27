// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
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
import densityBuoyancyCommonStrings from '../../density-buoyancy-common-strings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BuoyancyIntroModel from '../model/BuoyancyIntroModel.js';

const fluidString = densityBuoyancyCommonStrings.fluid;
const modeSameDensityString = densityBuoyancyCommonStrings.mode.sameDensity;
const modeSameMassString = densityBuoyancyCommonStrings.mode.sameMass;
const modeSameVolumeString = densityBuoyancyCommonStrings.mode.sameVolume;

// constants
const modeStringMap = {
  [ BuoyancyIntroModel.Mode.SAME_MASS.name ]: modeSameMassString,
  [ BuoyancyIntroModel.Mode.SAME_VOLUME.name ]: modeSameVolumeString,
  [ BuoyancyIntroModel.Mode.SAME_DENSITY.name ]: modeSameDensityString
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class BuoyancyIntroScreenView extends DensityBuoyancyScreenView {

  /**
   * @param {BuoyancyIntroModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem );

    if ( !this.enabled ) {
      return this;
    }

    const modeControl = new VerticalAquaRadioButtonGroup( model.modeProperty, BuoyancyIntroModel.Mode.VALUES.map( mode => {
      return {
        node: new Text( modeStringMap[ mode.name ], { font: new PhetFont( 12 ) } ),
        value: mode
      };
    } ) );

    this.addChild( new AlignBox( new Panel( modeControl ), {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      margin: 10
    } ) );

    this.addChild( new Panel( new DisplayOptionsNode( model ), {
      xMargin: 10,
      yMargin: 10,
      left: this.layoutBounds.left + MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    } ) );

    const radioButtonLabelOptions = {
      font: new PhetFont( 14 )
    };
    const fluidBox = new HBox( {
      spacing: 20,
      children: [
        new AquaRadioButton( model.liquidMaterialProperty, Material.OIL, new Text( Material.OIL.name, radioButtonLabelOptions ) ),
        new AquaRadioButton( model.liquidMaterialProperty, Material.WATER, new Text( Material.WATER.name, radioButtonLabelOptions ) ),
        new AquaRadioButton( model.liquidMaterialProperty, Material.SEAWATER, new Text( Material.SEAWATER.name, radioButtonLabelOptions ) )
      ]
    } );
    const fluidTitle = new Text( fluidString, {
      font: new PhetFont( { size: 14, weight: 'bold' } ),
      right: fluidBox.left,
      bottom: fluidBox.top - 3
    } );
    this.addChild( new Panel( new Node( {
      children: [ fluidTitle, fluidBox ]
    } ), {
      xMargin: 10,
      yMargin: 10,
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyIntroScreenView', BuoyancyIntroScreenView );
export default BuoyancyIntroScreenView;