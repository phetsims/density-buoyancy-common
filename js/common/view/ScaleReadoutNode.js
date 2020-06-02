// Copyright 2019-2020, University of Colorado Boulder

/**
 * Shows a readout in front of a scale, for its measured mass/weight.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Scale from '../model/Scale.js';

class ScaleReadoutNode extends Node {
  /**
   * @param {Scale} mass
   * @param {Property.<Gravity>} gravityProperty
   */
  constructor( mass, gravityProperty ) {
    super();

    const readoutText = new Text( '', {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } ),
      maxWidth: 200
    } );
    const readoutPanel = new Panel( readoutText, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      xMargin: 2,
      yMargin: 2,
      fill: null, // TODO,
      stroke: null // TODO
    } );

    this.addChild( readoutPanel );

    // @private {Scale}
    this.mass = mass;

    // @private {Multilink}
    this.scaleForceMultilink = Property.multilink( [ mass.scaleForceInterpolatedProperty, gravityProperty ], ( scaleForce, gravity ) => {
      if ( mass.displayType === Scale.DisplayType.NEWTONS ) {
        readoutText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.newtonsPattern, {
          newtons: Utils.toFixed( scaleForce, 2 )
        } );
      }
      else {
        readoutText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPattern, {
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

densityBuoyancyCommon.register( 'ScaleReadoutNode', ScaleReadoutNode );
export default ScaleReadoutNode;