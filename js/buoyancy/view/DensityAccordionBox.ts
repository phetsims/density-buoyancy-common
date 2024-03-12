// Copyright 2019-2024, University of Colorado Boulder

/**
 * An AccordionBox that displays the percentage of each material that is submerged.
 *
 * @author Agustín Vallejo
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { HBox, RichText, RichTextOptions } from '../../../../scenery/js/imports.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ReadoutListAccordionBox, { CustomReadoutObject, ReadoutListAccordionBoxOptions } from './ReadoutListAccordionBox.js';

const HBOX_SPACING = 5;

export default class DensityAccordionBox extends ReadoutListAccordionBox {

  public constructor(
    providedOptions?: ReadoutListAccordionBoxOptions
  ) {

    super( DensityBuoyancyCommonStrings.densityStringProperty, providedOptions );
  }

  /**
   * Overwrite the displayed densities with a new set of materialProperties.
   */
  public override setReadout( customMaterials: CustomReadoutObject[] ): void {

    super.setReadout( customMaterials );

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

    this.readoutBox.children = customMaterials.map( customMaterial => {

      const materialProperty = customMaterial.materialProperty!;

      assert && assert( materialProperty, 'materialProperty should be defined' );

      // Get the custom name from the provided options, or create a dynamic property that derives from the material's name
      const nameProperty = customMaterial.customNameProperty ?
                           customMaterial.customNameProperty :
                           new DynamicProperty<string, string, Material>( materialProperty, {
                             derive: material => material.nameProperty
                           } );
      const nameColonProperty = new DerivedProperty( [ nameProperty ], name => name + ': ' );
      const labelText = new RichText( nameColonProperty, this.textOptions );

      // Create the derived string property for the density readout
      const densityDerivedStringProperty = getMysteryMaterialReadoutStringProperty( materialProperty );
      const customFormat = customMaterial.customFormat ? customMaterial.customFormat : {};
      const densityReadout = new RichText( densityDerivedStringProperty,
        combineOptions<RichTextOptions>( {}, this.textOptions, customFormat ) );

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
}

densityBuoyancyCommon.register( 'DensityAccordionBox', DensityAccordionBox );
