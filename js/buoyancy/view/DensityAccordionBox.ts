// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows a reference list of densities for named quantities (which can switch between different materials).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import optionize, { optionize4 } from '../../../../phet-core/js/optionize.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';


type SetMaterialsOptions = {
  // Arrays should correspond to the provided materialProperties
  customNames?: TReadOnlyProperty<string>[] | null;
  customFormats?: RichTextOptions[] | null;
};

type SelfOptions = {
  // Provided to the constructor call of setMaterials()
  setMaterialsOptions?: SetMaterialsOptions;
};

type DensityAccordionBoxOptions = SelfOptions & AccordionBoxOptions;

export default class DensityAccordionBox extends AccordionBox {

  private readonly densityReadoutBox: VBox;
  private cleanupEmitter = new TinyEmitter();


  public constructor(
    materialProperties: TReadOnlyProperty<Material>[],
    providedOptions?: DensityAccordionBoxOptions
  ) {

    const options = optionize4<DensityAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {},
      DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS, {
      titleNode: new Text( DensityBuoyancyCommonStrings.densityStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 160
      } ),
      layoutOptions: { stretch: true },
      setMaterialsOptions: {}
    }, providedOptions );

    const densityReadout = new VBox( {
      spacing: 5,
      align: 'center'
    } );

    super( densityReadout, options );

    this.densityReadoutBox = densityReadout;

    this.setMaterials( materialProperties, options.setMaterialsOptions );
  }

  /**
   * Overwrite the displayed densities with a new set of materialProperties.
   */
  public setMaterials( materialProperties: TReadOnlyProperty<Material>[], providedOptions?: SetMaterialsOptions ): void {

    const options = optionize<SetMaterialsOptions>()( {
      customNames: null,
      customFormats: null
    }, providedOptions );

    // TODO: Commenting out the assertions, this is not always true, Explore Screen View can have different number of materials, https://github.com/phetsims/density-buoyancy-common/issues/103
    // assert && options.customNames && assert( options.customNames.length === materialProperties.length, 'customNames option should correspond to provided materials' );
    // assert && options.customFormats && assert( options.customFormats.length === materialProperties.length, 'customFormats option should correspond to provided materials' );

    // Clear the previous materials that may have been created.
    this.cleanupEmitter.emit();
    this.cleanupEmitter.removeAllListeners();

    const DEFAULT_TEXT_OPTIONS = {
      font: new PhetFont( 14 ),
      maxWidth: 200
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

    this.densityReadoutBox.children = materialProperties.map( ( materialProperty, index ) => {

      // Get the custom name from the provided options, or create a dynamic property that derives from the material's name
      const nameProperty = options?.customNames ?
                           options.customNames[ index ] :
                           new DynamicProperty<string, string, Material>( materialProperty, {
                             derive: material => material.nameProperty
                           } );
      const nameColonProperty = new DerivedProperty( [ nameProperty ], name => name + ': ' );
      const labelText = new RichText( nameColonProperty, DEFAULT_TEXT_OPTIONS );

      // Create the derived string property for the density readout
      const densityDerivedStringProperty = getMysteryMaterialReadoutStringProperty( materialProperty );
      const densityReadout = new RichText( densityDerivedStringProperty,
        options?.customFormats ? options.customFormats[ index ] : DEFAULT_TEXT_OPTIONS );

      this.cleanupEmitter.addListener( () => {
        densityDerivedStringProperty.dispose();
        densityReadout.dispose();
        nameColonProperty.dispose();
        labelText.dispose();
      } );

      return new HBox( {
        children: [ labelText, densityReadout ],
        align: 'origin',
        spacing: 5
      } );
    } );
  }

  public override dispose(): void {
    this.cleanupEmitter.emit();
    super.dispose();
  }
}

densityBuoyancyCommon.register( 'DensityAccordionBox', DensityAccordionBox );
