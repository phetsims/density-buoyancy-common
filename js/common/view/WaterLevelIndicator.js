// Copyright 2019-2020, University of Colorado Boulder

/**
 * Shows the water level numerically next to the top-left of the pool's water.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColorProfile from './DensityBuoyancyCommonColorProfile.js';

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
        size: 18
      } ),
      maxWidth: 200
    } );

    const readoutPanel = new Panel( readoutText, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS
    } );
    this.addChild( readoutPanel );

    volumeProperty.link( volume => {
      const liters = 1000 * volume;

      readoutText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
        liters: Utils.toFixed( liters, 2 )
      } );

      readoutPanel.rightCenter = highlightPath.leftCenter;
    } );
  }
}

densityBuoyancyCommon.register( 'WaterLevelIndicator', WaterLevelIndicator );
export default WaterLevelIndicator;