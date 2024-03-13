// Copyright 2024, University of Colorado Boulder

/**
 * Common class for DensityAccordionBox and SubmergedAccordionBox. This class is used to create an AccordionBox that
 * displays a list of readouts. The readouts are created by passing an array of CustomReadoutObjects to the setReadoutItems
 * method.
 *
 * @author Agustín Vallejo
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, RichText, RichTextOptions, Text, TextOptions, VBox } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import { combineOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';

const DEFAULT_FONT = new PhetFont( 14 );
const HBOX_SPACING = 5;
const DEFAULT_CONTENT_WIDTH = ( 140 + HBOX_SPACING ) / 2;

type SelfOptions = {
  // Provide the ideal max content width for the accordion box content. This is used to apply maxWidths to the Texts of the readout.
  contentWidthMax?: number;
};

export type ReadoutItemOptions<ReadoutType> = {
  readoutItem: ReadoutType; // Provided for use by generateReadoutData() to create the name/value Properties

  // By default, the implementation of generateReadoutData() will create a default nameProperty, but you can supply your
  // own to be used instead.
  readoutNameProperty?: TReadOnlyProperty<string>;
  readoutFormat?: RichTextOptions; // Any extra formatting options to be passed to the name/value texts.
};

export type ReadoutData = {
  nameProperty: TReadOnlyProperty<string>;
  valueProperty: TReadOnlyProperty<string>;
};

export type ReadoutListAccordionBoxOptions = SelfOptions & AccordionBoxOptions;

export default abstract class ReadoutListAccordionBox<ReadoutType> extends AccordionBox {

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

  public setReadoutItems( readoutItems: ReadoutItemOptions<ReadoutType>[] ): void {

    // Clear the previous materials that may have been created.
    this.cleanupEmitter.emit();
    this.cleanupEmitter.removeAllListeners();

    this.readoutBox.children = readoutItems.map( readoutItem => {

      const readoutData = this.generateReadoutData( readoutItem.readoutItem );
      const nameProperty = readoutItem.readoutNameProperty || readoutData.nameProperty;

      const labelText = new RichText( nameProperty, this.textOptions );
      const readoutFormat = readoutItem.readoutFormat ? readoutItem.readoutFormat : {};
      const valueText = new RichText( readoutData.valueProperty,
        combineOptions<RichTextOptions>( {}, this.textOptions, readoutFormat ) );

      this.cleanupEmitter.addListener( () => {
        valueText.dispose();
        labelText.dispose();
      } );

      return new HBox( {
        children: [ labelText, valueText ],
        align: 'origin',
        spacing: 5
      } );
    } );
  }

  public abstract generateReadoutData( readoutType: ReadoutType ): ReadoutData;

  public override dispose(): void {
    this.cleanupEmitter.emit();
    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ReadoutListAccordionBox', ReadoutListAccordionBox );
