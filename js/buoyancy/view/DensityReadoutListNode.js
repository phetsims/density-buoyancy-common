// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import densityBuoyancyCommonStrings from '../../density-buoyancy-common-strings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

const densityReadoutPatternString = densityBuoyancyCommonStrings.densityReadoutPattern;

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

densityBuoyancyCommon.register( 'DensityReadoutListNode', DensityReadoutListNode );
export default DensityReadoutListNode;