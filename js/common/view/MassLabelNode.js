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
  const kilogramsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPattern' );

  class MassLabelNode extends Node {
    /**
     * @param {Mass} mass
     * @param {Property.<boolean>} showMassesProperty
     */
    constructor( mass, showMassesProperty ) {
      super();

      const readoutText = new Text( '', {
        font: new PhetFont( {
          size: 14,
          weight: 'bold'
        } )
      } );
      const readoutPanel = new Panel( readoutText, {
        cornerRadius: 5,
        xMargin: 2,
        yMargin: 2
      } );

      this.addChild( readoutPanel );

      // @private {Mass}
      this.mass = mass;

      // @private {Property.<boolean>}
      this.showMassesProperty = showMassesProperty;

      // @private {function(number)}
      this.massListener = mass => {
        readoutText.text = StringUtils.fillIn( kilogramsPatternString, {
          kilograms: Util.toFixed( mass, 2 )
        } );
        readoutPanel.center = Vector2.ZERO;
      };

      // @private {function(boolean)}
      this.showMassesListener = shown => {
        readoutPanel.visible = shown;
      };

      this.mass.massProperty.link( this.massListener );
      this.showMassesProperty.link( this.showMassesListener );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.showMassesProperty.unlink( this.showMassesListener );
      this.mass.massProperty.unlink( this.massListener );

      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'MassLabelNode', MassLabelNode );
} );
