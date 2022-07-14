// Copyright 2019-2022, University of Colorado Boulder

/**
 * Shows a NumberControl/ComboBox to control the gravity.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Gravity from '../model/Gravity.js';
import ComboNumberControl from './ComboNumberControl.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import ComboBox from '../../../../sun/js/ComboBox.js';

export default class GravityControlNode extends ComboNumberControl<Gravity> {
  public constructor( gravityProperty: Property<Gravity>, listParent: Node ) {

    const customValue = Gravity.createCustomGravity( DensityBuoyancyCommonQueryParameters.gEarth );

    super( {
      title: densityBuoyancyCommonStrings.gravity.name,
      valuePattern: densityBuoyancyCommonStrings.metersPerSecondSquaredPattern,
      property: gravityProperty,
      range: new Range( 0, 25 ),
      toNumericValue: gravity => gravity.value,
      createCustomValue: Gravity.createCustomGravity,
      isCustomValue: gravity => gravity.custom,
      isHiddenValue: gravity => gravity.hidden,
      listParent: listParent,
      comboItems: [
        Gravity.MOON,
        Gravity.EARTH,
        Gravity.JUPITER,
        Gravity.PLANET_X,
        customValue
      ].map( gravity => {
        return {
          value: gravity,
          node: new Text( gravity.name, {
            font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
            maxWidth: 160
          } ),
          tandemName: `${gravity.tandemName}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
        };
      } ),
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
