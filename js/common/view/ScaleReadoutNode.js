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
  const Property = require( 'AXON/Property' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const kilogramsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPattern' );
  const newtonsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/newtonsPattern' );

  class ScaleReadoutNode extends Node {
    /**
     * @param {Scale} mass
     * @param {Property.<Gravity>}
     */
    constructor( mass, gravityProperty ) {
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

      // @private {Scale}
      this.mass = mass;

      // @private {Multilink}
      this.scaleForceMultilink = Property.multilink( [ mass.scaleForceProperty, gravityProperty ], ( scaleForce, gravity ) => {
        if ( mass.displayType === Scale.DisplayType.NEWTONS ) {
          readoutText.text = StringUtils.fillIn( newtonsPatternString, {
            newtons: Utils.toFixed( scaleForce, 2 )
          } );
        }
        else {
          readoutText.text = StringUtils.fillIn( kilogramsPatternString, {
            kilograms: gravity.value > 0 ? Utils.toFixed( scaleForce / gravity.value, 2 ) : '-'
          } );
        }
        readoutPanel.center = Vector2.ZERO;
      } );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.scaleForceMultilink.dispose();

      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'ScaleReadoutNode', ScaleReadoutNode );
} );
