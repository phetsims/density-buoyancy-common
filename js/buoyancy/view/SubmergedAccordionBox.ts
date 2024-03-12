// Copyright 2019-2024, University of Colorado Boulder

/**
 * An AccordionBox that displays the percentage of a material that is submerged in a fluid.
 *
 * @author Agustín Vallejo
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { HBox, RichText, RichTextOptions } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Utils from '../../../../dot/js/Utils.js';
import Gravity from '../../common/model/Gravity.js';
import Material from '../../common/model/Material.js';
import ReadoutListAccordionBox, { CustomReadoutObject, ReadoutListAccordionBoxOptions } from './ReadoutListAccordionBox.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';

export default class SubmergedAccordionBox extends ReadoutListAccordionBox {

  public constructor(
    private readonly gravityProperty: TReadOnlyProperty<Gravity>,
    private readonly liquidMaterialProperty: TReadOnlyProperty<Material>,
    providedOptions?: ReadoutListAccordionBoxOptions
  ) {

    const options = combineOptions<ReadoutListAccordionBoxOptions>( {
      visibleProperty: DensityBuoyancyCommonPreferences.percentageSubmergedVisibleProperty
    }, providedOptions );

    super( DensityBuoyancyCommonStrings.percentSubmergedStringProperty, options );
  }

  /**
   * Overwrite the displayed densities with a new set of materialProperties.
   */
  public override setReadout( customMaterials: CustomReadoutObject[] ): void {

    super.setReadout( customMaterials );

    this.readoutBox.children = customMaterials.map( customMaterial => {

      const mass = customMaterial.mass!;
      assert && assert( mass, 'Mass should be defined' );

      // Get the custom name from the provided options, or create a dynamic property that derives from the material's name
      const nameProperty = customMaterial.customNameProperty ?
                           customMaterial.customNameProperty : mass.nameProperty;
      const nameColonProperty = new DerivedProperty( [ nameProperty ], name => name + ': ' );
      const labelText = new RichText( nameColonProperty, this.textOptions );

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
      const customFormat = customMaterial.customFormat ? customMaterial.customFormat : {};
      const submergedReadout = new RichText( submergedDerivedStringProperty,
        combineOptions<RichTextOptions>( {}, this.textOptions, customFormat ) );

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
