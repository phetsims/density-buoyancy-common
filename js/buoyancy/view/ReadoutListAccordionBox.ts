// Copyright 2019-2024, University of Colorado Boulder

/**
 * Common class for DensityAccordionBox and SubmergedAccordionBox. This class is used to create an AccordionBox that
 * displays a list of readouts. The readouts are created by passing an array of CustomReadoutObjects to the setReadout
 * method.
 *
 * @author Agustín Vallejo
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { RichTextOptions, Text, TextOptions, VBox } from '../../../../scenery/js/imports.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import { optionize4 } from '../../../../phet-core/js/optionize.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Mass from '../../common/model/Mass.js';

const DEFAULT_FONT = new PhetFont( 14 );
const HBOX_SPACING = 5;
const DEFAULT_CONTENT_WIDTH = ( 140 + HBOX_SPACING ) / 2;

type SelfOptions = {
  // Provide the ideal max content width for the accordion box content. This is used to apply maxWidths to the Texts of the readout.
  contentWidthMax?: number;
};

export type CustomReadoutObject = {
  mass?: Mass | null; // Masses to be passed to the SubmergedAccordionBox
  materialProperty?: TReadOnlyProperty<Material> | null; // Materials to be passed to the DensityAccordionBox
  customNameProperty?: TReadOnlyProperty<string>; // Optional: Custom name for the readout
  customFormat?: RichTextOptions; // Optional: Custom format for the readout
};

export type ReadoutListAccordionBoxOptions = SelfOptions & AccordionBoxOptions;

export default class ReadoutListAccordionBox extends AccordionBox {

  protected cleanupEmitter = new TinyEmitter();
  protected textOptions: TextOptions = {};

  protected readonly readoutBox: VBox;
  protected readonly contentWidthMax: number;

  public constructor(
    titleStringProperty: TReadOnlyProperty<string>,
    providedOptions?: ReadoutListAccordionBoxOptions
  ) {

    const options = optionize4<ReadoutListAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {},
      DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS, {
        titleNode: new Text( titleStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        layoutOptions: { stretch: true },
        contentWidthMax: DEFAULT_CONTENT_WIDTH
      }, providedOptions );

    const readoutBox = new VBox( {
      spacing: 5,
      align: 'center'
    } );

    super( readoutBox, options );

    this.readoutBox = readoutBox;
    this.contentWidthMax = options.contentWidthMax;

    this.textOptions = {
      font: DEFAULT_FONT,
      maxWidth: ( this.contentWidthMax - HBOX_SPACING ) / 2
    };
  }

  /**
   */
  public setReadout( customReadoutObjects: CustomReadoutObject[] ): void {
    // Clear the previous materials that may have been created.
    this.cleanupEmitter.emit();
    this.cleanupEmitter.removeAllListeners();
  }

  public override dispose(): void {
    this.cleanupEmitter.emit();
    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ReadoutListAccordionBox', ReadoutListAccordionBox );
