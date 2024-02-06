// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows a reference list of densities for named quantities (which can switch between different materials).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { RichText, VBox } from '../../../../scenery/js/imports.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';

export default class DensityReadoutListNode extends VBox {
  private cleanupEmitter = new TinyEmitter();

  public constructor( materialProperties: TReadOnlyProperty<Material>[] ) {

    super( {
      spacing: 5,
      align: 'center'
    } );

    this.setMaterials( materialProperties );
  }

  /**
   * Overwrite the displayed densities with a new set of materialProperties.
   */
  public setMaterials( materialProperties: TReadOnlyProperty<Material>[] ): void {

    // Clear the previous materials that may have been created.
    this.cleanupEmitter.emit();
    this.cleanupEmitter.removeAllListeners();

    this.children = materialProperties.map( materialProperty => {

      // Handle units changing
      const derivedProperty = new DerivedStringProperty( [
        DensityBuoyancyCommonPreferences.volumeUnitsProperty,
        DensityBuoyancyCommonStrings.densityReadoutPatternStringProperty,
        DensityBuoyancyCommonStrings.densityReadoutDecimetersCubedPatternStringProperty
      ], ( units, litersString, decimetersCubedString ) => {
        return units === 'liters' ? litersString : decimetersCubedString;
      } );

      // Handle updates to the material or density
      const patternStringProperty = new PatternStringProperty( derivedProperty, {
        material: new DynamicProperty<string, string, Material>( materialProperty, {
          derive: material => material.nameProperty
        } ),
        density: new DerivedProperty( [ materialProperty ], material => material.density / 1000 )
      }, {
        tandem: Tandem.OPT_OUT,
        decimalPlaces: 2
      } );

      // Render as a Node
      const richText = new RichText( patternStringProperty, {
        font: new PhetFont( 14 ),
        maxWidth: 200
      } );
      this.cleanupEmitter.addListener( () => {
        richText.dispose();
        patternStringProperty.dispose();
        derivedProperty.dispose();
      } );
      return richText;
    } );
  }

  public override dispose(): void {
    this.cleanupEmitter.emit();
    super.dispose();
  }
}

densityBuoyancyCommon.register( 'DensityReadoutListNode', DensityReadoutListNode );
