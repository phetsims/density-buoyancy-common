// Copyright 2019-2024, University of Colorado Boulder

/**
 * An AccordionBox that displays the percentage of each material that is submerged.
 *
 * @author Agustín Vallejo
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, RichText, RichTextOptions, Text, VBox } from '../../../../scenery/js/imports.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';

const DEFAULT_FONT = new PhetFont( 14 );
const HBOX_SPACING = 5;
const DEFAULT_CONTENT_WIDTH = ( 140 + HBOX_SPACING ) / 2;

type SetMaterialsOptions = {
  // Arrays should correspond to the provided materialProperties
  customNames?: TReadOnlyProperty<string>[] | null;
  customFormats?: RichTextOptions[] | null;
};

type SelfOptions = {
  // Provided to the constructor call of setMaterials()
  setMaterialsOptions?: SetMaterialsOptions;

  // Provide the ideal max content width for the accordion box content. This is used to apply maxWidths to the Texts of the readout.
  contentWidthMax?: number;
};

type CustomMaterial = {
  materialProperty: TReadOnlyProperty<Material>;
  customNameProperty?: TReadOnlyProperty<string>;
  customFormat?: RichTextOptions;
};

type DensityAccordionBoxOptions = SelfOptions & AccordionBoxOptions;

export default class DensityAccordionBox extends AccordionBox {

  private readonly densityReadoutBox: VBox;
  private cleanupEmitter = new TinyEmitter();

  private readonly contentWidthMax: number;

  public constructor(
    customMaterials: CustomMaterial[],
    providedOptions?: DensityAccordionBoxOptions
  ) {

    const options = optionize4<DensityAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {},
      DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS, {
        titleNode: new Text( DensityBuoyancyCommonStrings.densityStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        layoutOptions: { stretch: true },
        setMaterialsOptions: {},
        contentWidthMax: DEFAULT_CONTENT_WIDTH
      }, providedOptions );

    const densityReadout = new VBox( {
      spacing: 5,
      align: 'center'
    } );

    super( densityReadout, options );

    this.densityReadoutBox = densityReadout;
    this.contentWidthMax = options.contentWidthMax;
    this.setMaterials( customMaterials );
  }

  /**
   * Overwrite the displayed densities with a new set of materialProperties.
   */
  public setMaterials( customMaterials: CustomMaterial[] ): void {

    // Clear the previous materials that may have been created.
    this.cleanupEmitter.emit();
    this.cleanupEmitter.removeAllListeners();

    const textOptions = {
      font: DEFAULT_FONT,
      maxWidth: ( this.contentWidthMax - HBOX_SPACING ) / 2
    };

    // Returns the filled in string for the material readout or '?' if the material is hidden
    const getMysteryMaterialReadoutStringProperty = ( materialProperty: TReadOnlyProperty<Material> ) => new DerivedProperty(
      [
        materialProperty,
        DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY,
        DensityBuoyancyCommonStrings.questionMarkStringProperty
      ],
      ( material, patternStringProperty, questionMarkString ) => {
        return material.hidden ?
               questionMarkString :
               StringUtils.fillIn( patternStringProperty, {
                 value: Utils.toFixed( material.density / 1000, 2 ),
                 decimalPlaces: 2
               } );
      } );

    this.densityReadoutBox.children = customMaterials.map( customMaterial => {

      const materialProperty = customMaterial.materialProperty;

      // Get the custom name from the provided options, or create a dynamic property that derives from the material's name
      const nameProperty = customMaterial.customNameProperty ?
                           customMaterial.customNameProperty :
                           new DynamicProperty<string, string, Material>( materialProperty, {
                             derive: material => material.nameProperty
                           } );
      const nameColonProperty = new DerivedProperty( [ nameProperty ], name => name + ': ' );
      const labelText = new RichText( nameColonProperty, textOptions );

      // Create the derived string property for the density readout
      const densityDerivedStringProperty = getMysteryMaterialReadoutStringProperty( materialProperty );
      const customFormat = customMaterial.customFormat ? customMaterial.customFormat : {};
      const densityReadout = new RichText( densityDerivedStringProperty,
        combineOptions<RichTextOptions>( {}, textOptions, customFormat ) );

      this.cleanupEmitter.addListener( () => {
        densityDerivedStringProperty.dispose();
        densityReadout.dispose();
        nameColonProperty.dispose();
        labelText.dispose();
      } );

      return new HBox( {
        children: [ labelText, densityReadout ],
        align: 'origin',
        spacing: HBOX_SPACING
      } );
    } );
  }

  public override dispose(): void {
    this.cleanupEmitter.emit();
    super.dispose();
  }
}

densityBuoyancyCommon.register( 'DensityAccordionBox', DensityAccordionBox );
