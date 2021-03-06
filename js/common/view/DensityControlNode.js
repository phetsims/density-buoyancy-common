// Copyright 2019-2021, University of Colorado Boulder

/**
 * Shows a combined NumberControl/ComboBox for controlling liquid density.
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
import Material from '../model/Material.js';
import ComboNumberControl from './ComboNumberControl.js';

class DensityControlNode extends ComboNumberControl {
  /**
   * @param {Property.<Material>} liquidMaterialProperty
   * @param {Array.<Material>} materials
   * @param {Node} listParent
   */
  constructor( liquidMaterialProperty, materials, listParent ) {
    const customValue = Material.createCustomLiquidMaterial( {
      density: 1000
    } );

    super( {
      title: densityBuoyancyCommonStrings.fluidDensity,
      valuePattern: densityBuoyancyCommonStrings.kilogramsPerLiterPattern,
      property: liquidMaterialProperty,
      range: new Range( 0.5, 15 ),
      toNumericValue: material => material.density / 1000,
      createCustomValue: density => Material.createCustomLiquidMaterial( {
        density: density * 1000
      } ),
      isCustomValue: material => material.custom,
      listParent: listParent,
      comboItems: [
        ...materials,
        customValue
      ].map( material => new ComboBoxItem( new Text( material.name, {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: 160
      } ), material ) ),
      customValue: customValue,
      numberControlOptions: {
        delta: 0.01
      },
      comboBoxOptions: {
        listPosition: 'above'
      },
      getFallbackNode: material => {
        if ( material.hidden ) {
          return new Text( densityBuoyancyCommonStrings.whatIsTheValueOfTheFluidDensity, {
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

densityBuoyancyCommon.register( 'DensityControlNode', DensityControlNode );
export default DensityControlNode;