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
import { HBox, RichText, RichTextOptions, VBox } from '../../../../scenery/js/imports.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utils from '../../../../dot/js/Utils.js';

type customSetMaterialsOptions = {
  customNames: TReadOnlyProperty<string>[];
  customFormats: RichTextOptions[];
};

export default class DensityReadoutListNode extends VBox {
  private cleanupEmitter = new TinyEmitter();

  public constructor( materialProperties: TReadOnlyProperty<Material>[], providedOptions?: customSetMaterialsOptions ) {

    super( {
      spacing: 5,
      align: 'center'
    } );

    this.setMaterials( materialProperties, providedOptions );
  }

  /**
   * Overwrite the displayed densities with a new set of materialProperties.
   */
  public setMaterials( materialProperties: TReadOnlyProperty<Material>[], providedOptions?: customSetMaterialsOptions ): void {

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

    this.children = materialProperties.map( ( materialProperty, index ) => {

      // Get the custom name from the provided options, or create a dynamic property that derives from the material's name
      const nameProperty = providedOptions?.customNames ?
                           providedOptions.customNames[ index ] :
                           new DynamicProperty<string, string, Material>( materialProperty, {
                             derive: material => material.nameProperty
                           } );
      const nameColonProperty = new DerivedProperty( [ nameProperty ], name => name + ': ' );
      const labelText = new RichText( nameColonProperty, DEFAULT_TEXT_OPTIONS );

      // Create the derived string property for the density readout
      const densityDerivedStringProperty = getMysteryMaterialReadoutStringProperty( materialProperty );
      const densityReadout = new RichText( densityDerivedStringProperty,
        providedOptions?.customFormats ? providedOptions.customFormats[ index ] : DEFAULT_TEXT_OPTIONS );

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

densityBuoyancyCommon.register( 'DensityReadoutListNode', DensityReadoutListNode );
