// Copyright 2024, University of Colorado Boulder

import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import Dialog, { DialogOptions } from '../../../../../sun/js/Dialog.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import { RichText, VBox } from '../../../../../scenery/js/imports.js';
import DensityBuoyancyCommonStrings from '../../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../../../common/DensityBuoyancyCommonConstants.js';

/**
 * ShapesInfoDialog is a dialog that displays info related to the forces and torque limitations within the sim
 *
 * @author Agustín Vallejo
 */


export default class ShapesInfoDialog extends Dialog {

  public constructor( tandem: Tandem ) {

    const options: DialogOptions = {
      isDisposable: false,
      titleAlign: 'center',
      tandem: tandem
    };

    const content = new VBox( {
      align: 'left',
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      margin: DensityBuoyancyCommonConstants.MARGIN,
      children: [
        new RichText( DensityBuoyancyCommonStrings.shapesInfoDialogStringProperty, {
          font: new PhetFont( 18 ),
          fill: 'black',
          lineWrap: 450
        } )
      ]
    } );

    super( content, options );
  }
}

densityBuoyancyCommon.register( 'ShapesInfoDialog', ShapesInfoDialog );