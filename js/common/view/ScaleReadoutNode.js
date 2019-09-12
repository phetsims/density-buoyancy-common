// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const newtonsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/newtonsPattern' );

  class ScaleReadoutNode extends Node {
    /**
     * @param {Mass} mass
     */
    constructor( mass ) {
      super();

      const readoutText = new Text( '', {
        font: new PhetFont( {
          size: 16,
          weight: 'bold'
        } )
      } );
      const readoutPanel = new Panel( readoutText, {
        cornerRadius: 5,
        xMargin: 2,
        yMargin: 2,
        fill: null, // TODO,
        stroke: null // TODO
      } );

      this.addChild( readoutPanel );

      // @private {Mass}
      this.mass = mass;

      // @private {function(number)}
      this.scaleForceListener = mass => {
        readoutText.text = StringUtils.fillIn( newtonsPatternString, {
          newtons: Util.toFixed( mass, 2 )
        } );
        readoutPanel.center = Vector2.ZERO;
      };

      this.mass.scaleForceProperty.link( this.scaleForceListener );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.mass.scaleForceProperty.unlink( this.scaleForceListener );

      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'ScaleReadoutNode', ScaleReadoutNode );
} );
