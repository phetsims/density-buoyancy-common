// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Shape = require( 'KITE/Shape' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );

  // strings
  const litersPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/litersPattern' );

  class WaterLevelIndicator extends Node {
    /**
     * @param {Property.<number>} volumeProperty
     */
    constructor( volumeProperty ) {
      super();

      const highlightShape = new Shape().moveTo( 0, 0 ).lineTo( -20, -10 ).lineTo( -20, 10 ).close();
      const highlightPath = new Path( highlightShape, {
        fill: DensityBuoyancyCommonColorProfile.waterIndicatorHighlightProperty
      } );
      this.addChild( highlightPath );

      const readoutText = new Text( '', {
        font: new PhetFont( {
          size: 18,
          weight: 'bold'
        } )
      } );

      const readoutPanel = new Panel( readoutText, {
        cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS
      } );
      this.addChild( readoutPanel );

      volumeProperty.link( volume => {
        const liters = 1000 * volume;

        readoutText.text = StringUtils.fillIn( litersPatternString, {
          liters: Utils.toFixed( liters, 2 )
        } );

        readoutPanel.rightCenter = highlightPath.leftCenter;
      } );
    }
  }

  return densityBuoyancyCommon.register( 'WaterLevelIndicator', WaterLevelIndicator );
} );
