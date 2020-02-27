// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Range from '../../../../dot/js/Range.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import densityBuoyancyCommonStrings from '../../density-buoyancy-common-strings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import ComboNumberControl from './ComboNumberControl.js';

const fluidDensityString = densityBuoyancyCommonStrings.fluidDensity;
const kilogramsPerLiterPatternString = densityBuoyancyCommonStrings.kilogramsPerLiterPattern;

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
      title: fluidDensityString,
      valuePattern: kilogramsPerLiterPatternString,
      property: liquidMaterialProperty,
      range: new Range( 0, 15 ),
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
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT
      } ), material ) ),
      customValue: customValue,
      numberControlOptions: {
        delta: 0.1
      },
      comboBoxOptions: {
        listPosition: 'above'
      }
    } );
  }
}

densityBuoyancyCommon.register( 'DensityControlNode', DensityControlNode );
export default DensityControlNode;