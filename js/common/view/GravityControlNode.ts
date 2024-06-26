// Copyright 2019-2024, University of Colorado Boulder

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
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Gravity from '../model/Gravity.js';
import ComboNumberControl from './ComboNumberControl.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export default class GravityControlNode extends ComboNumberControl<Gravity> {
  public constructor( gravityProperty: Property<Gravity>, listParent: Node, tandem: Tandem ) {

    const customValue = Gravity.createCustomGravity( DensityBuoyancyCommonQueryParameters.gEarth );

    super( {
      tandem: tandem,
      titleProperty: DensityBuoyancyCommonStrings.gravity.nameStringProperty,
      valuePatternProperty: DensityBuoyancyCommonStrings.metersPerSecondSquaredPatternStringProperty,
      property: gravityProperty,
      range: new Range( 0.1, 25 ),
      toNumericValue: gravity => gravity.value,
      createCustomValue: Gravity.createCustomGravity,
      isCustomValue: gravity => gravity.custom,
      isHiddenValue: gravity => gravity.hidden,
      listParent: listParent,
      comboItems: [
        Gravity.MOON,
        Gravity.EARTH,
        Gravity.JUPITER,

        // Custom goes before mystery, see https://github.com/phetsims/density-buoyancy-common/issues/161
        customValue,
        Gravity.PLANET_X
      ].map( gravity => {
        return {
          value: gravity,
          createNode: () => new Text( gravity.nameProperty, {
            font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
            maxWidth: 160
          } ),
          tandemName: `${gravity.tandemName}Item`,
          a11yName: gravity.nameProperty
        };
      } ),
      customValue: customValue,
      comboBoxOptions: {
        listPosition: 'above'
      },
      getFallbackNode: gravity => {
        if ( gravity.hidden ) {
          return new Text( DensityBuoyancyCommonStrings.whatIsTheValueOfGravityStringProperty, {
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