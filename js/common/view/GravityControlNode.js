// Copyright 2019-2021, University of Colorado Boulder

/**
 * Shows a NumberControl/ComboBox to control the gravity.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Gravity from '../model/Gravity.js';
import ComboNumberControl from './ComboNumberControl.js';

class GravityControlNode extends ComboNumberControl {
  /**
   * @param {Property.<Gravity>} gravityProperty
   * @param {Node} listParent
   */
  constructor( gravityProperty, listParent ) {

    const customValue = Gravity.createCustomGravity( 9.8 );

    super( {
      title: densityBuoyancyCommonStrings.gravity.name,
      valuePattern: densityBuoyancyCommonStrings.metersPerSecondSquaredPattern,
      property: gravityProperty,
      range: new Range( 0, 25 ),
      toNumericValue: gravity => gravity.value,
      createCustomValue: Gravity.createCustomGravity,
      isCustomValue: gravity => gravity.custom,
      listParent: listParent,
      comboItems: [
        Gravity.MOON,
        Gravity.EARTH,
        Gravity.JUPITER,
        Gravity.PLANET_X,
        customValue
      ].map( gravity => new ComboBoxItem( new Text( gravity.name, {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: 160
      } ), gravity ) ),
      customValue: customValue,
      numberControlOptions: {
        delta: 0.1
      },
      comboBoxOptions: {
        listPosition: 'above'
      },
      getFallbackNode: gravity => {
        if ( gravity.hidden ) {
          return new Text( densityBuoyancyCommonStrings.whatIsTheValueOfGravity, {
            font: new PhetFont( 14 )
          } );
        }
        else {
          return null;
        }
      }
    } );
  }
}

densityBuoyancyCommon.register( 'GravityControlNode', GravityControlNode );
export default GravityControlNode;