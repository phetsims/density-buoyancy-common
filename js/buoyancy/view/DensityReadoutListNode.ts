// Copyright 2019-2022, University of Colorado Boulder

/**
 * Shows a reference list of densities for named quantities (which can switch between different materials).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';

export default class DensityReadoutListNode extends VBox {
  public constructor( materialProperties: TReadOnlyProperty<Material>[] ) {

    super( {
      spacing: 5,
      align: 'center'
    } );

    this.children = materialProperties.map( materialProperty => {
      // Exists for the lifetime of a sim, so disposal patterns not needed.
      return new Text( new DerivedProperty( [ materialProperty, densityBuoyancyCommonStrings.densityReadoutPatternStringProperty ], ( material, pattern ) => {
        return StringUtils.fillIn( pattern, {
          material: material.name,
          density: Utils.toFixed( material.density / 1000, 2 )
        } );
      } ), { font: new PhetFont( 14 ), maxWidth: 200 } );
    } );
  }
}

densityBuoyancyCommon.register( 'DensityReadoutListNode', DensityReadoutListNode );
