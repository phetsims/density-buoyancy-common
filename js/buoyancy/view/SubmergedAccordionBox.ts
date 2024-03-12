// Copyright 2019-2024, University of Colorado Boulder

/**
 * An AccordionBox that displays the percentage of a material that is submerged in a fluid.
 *
 * @author Agustín Vallejo
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, RichText, RichTextOptions, Text, VBox } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import optionize, { optionize4 } from '../../../../phet-core/js/optionize.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Utils from '../../../../dot/js/Utils.js';
import Mass from '../../common/model/Mass.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import Gravity from '../../common/model/Gravity.js';
import Material from '../../common/model/Material.js';


type SetMaterialsOptions = {
  // Arrays should correspond to the provided materialProperties
  customNames?: TReadOnlyProperty<string>[] | null;
  customFormats?: RichTextOptions[] | null;
};

type SelfOptions = {
  // Provided to the constructor call of setSubmergedVolumes()
  setSubmergedVolumesOptions?: SetMaterialsOptions;
};

type SubmergedAccordionBoxOptions = SelfOptions & AccordionBoxOptions;

export default class SubmergedAccordionBox extends AccordionBox {

  private readonly submergedReadoutBox: VBox;
  private cleanupEmitter = new TinyEmitter();


  public constructor(
    masses: Mass[],
    private readonly gravityProperty: TReadOnlyProperty<Gravity>,
    private readonly liquidMaterialProperty: TReadOnlyProperty<Material>,
    providedOptions?: SubmergedAccordionBoxOptions
  ) {

    const options = optionize4<SubmergedAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {},
      DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS, {
        titleNode: new Text( DensityBuoyancyCommonStrings.percentSubmergedStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        layoutOptions: { stretch: true },
        setSubmergedVolumesOptions: {}
      }, providedOptions );

    const submergedReadout = new VBox( {
      spacing: 5,
      align: 'center'
    } );

    super( submergedReadout, options );

    this.submergedReadoutBox = submergedReadout;

    this.setSubmergedVolumes( masses, options.setSubmergedVolumesOptions );
  }

  /**
   * Overwrite the displayed densities with a new set of materialProperties.
   */
  public setSubmergedVolumes( masses: Mass[], providedOptions?: SetMaterialsOptions ): void {

    const options = optionize<SetMaterialsOptions>()( {
      customNames: null,
      customFormats: null
    }, providedOptions );

    // TODO: Commenting out the assertions, this is not always true, Explore Screen View can have different number of materials, https://github.com/phetsims/submerged-buoyancy-common/issues/103
    // assert && options.customNames && assert( options.customNames.length === materialProperties.length, 'customNames option should correspond to provided materials' );
    // assert && options.customFormats && assert( options.customFormats.length === materialProperties.length, 'customFormats option should correspond to provided materials' );

    // Clear the previous materials that may have been created.
    this.cleanupEmitter.emit();
    this.cleanupEmitter.removeAllListeners();

    const DEFAULT_TEXT_OPTIONS = {
      font: new PhetFont( 14 ),
      maxWidth: 200
    };

    this.submergedReadoutBox.children = masses.map( ( mass, index ) => {

      // Get the custom name from the provided options, or create a dynamic property that derives from the material's name
      const nameProperty = options?.customNames ?
                           options.customNames[ index ] : mass.nameProperty;
      const nameColonProperty = new DerivedProperty( [ nameProperty ], name => name + ': ' );
      const labelText = new RichText( nameColonProperty, DEFAULT_TEXT_OPTIONS );

      // Create the derived string property for the submerged readout
      const submergedDerivedStringProperty = new DerivedProperty(
        [
          mass.volumeProperty,
          mass.buoyancyForceInterpolatedProperty,
          this.gravityProperty,
          this.liquidMaterialProperty
        ], ( volume, buoyancy, gravity, liquid ) => {
          return Utils.toFixed( 100 * buoyancy?.magnitude / ( volume * gravity.value * liquid.density ), 1 ) + '%';
        } );
      const submergedReadout = new RichText( submergedDerivedStringProperty,
        options?.customFormats ? options.customFormats[ index ] : DEFAULT_TEXT_OPTIONS );

      this.cleanupEmitter.addListener( () => {
        submergedDerivedStringProperty.dispose();
        submergedReadout.dispose();
        nameColonProperty.dispose();
        labelText.dispose();
      } );

      return new HBox( {
        children: [ labelText, submergedReadout ],
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

densityBuoyancyCommon.register( 'SubmergedAccordionBox', SubmergedAccordionBox );
