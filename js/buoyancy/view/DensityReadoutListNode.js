// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const densityReadoutPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/densityReadoutPattern' );

  class DensityReadoutListNode extends VBox {

    /**
     * @param {Array.<Property.<Material>>} materialProperties
     */
    constructor( materialProperties ) {

      super( {
        spacing: 5,
        align: 'center'
      } );

      this.children = materialProperties.map( materialProperty => {
        const text = new Text( '', { font: new PhetFont( 14 ), maxWidth: 200 } );

        materialProperty.link( material => {
          text.text = StringUtils.fillIn( densityReadoutPatternString, {
            material: material.name,
            density: Utils.toFixed( material.density / 1000, 2 )
          } );
        } );

        return text;
      } );
    }
  }

  return densityBuoyancyCommon.register( 'DensityReadoutListNode', DensityReadoutListNode );
} );
