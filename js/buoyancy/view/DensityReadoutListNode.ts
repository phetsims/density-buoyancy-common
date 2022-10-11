// Copyright 2019-2022, University of Colorado Boulder

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
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';

export default class DensityReadoutListNode extends VBox {
  public constructor( materialProperties: TReadOnlyProperty<Material>[] ) {

    super( {
      spacing: 5,
      align: 'center'
    } );

    this.children = materialProperties.map( materialProperty => {
      // Exists for the lifetime of a sim, so disposal patterns not needed.
      return new Text( new PatternStringProperty( DensityBuoyancyCommonStrings.densityReadoutPatternStringProperty, {
        material: new DynamicProperty<string, string, Material>( materialProperty, { derive: material => material.nameProperty } ),
        density: new DerivedProperty( [ materialProperty ], material => material.density / 1000 )
      }, {
        decimalPlaces: 2
      } ), { font: new PhetFont( 14 ), maxWidth: 200 } );
    } );
  }
}

densityBuoyancyCommon.register( 'DensityReadoutListNode', DensityReadoutListNode );
