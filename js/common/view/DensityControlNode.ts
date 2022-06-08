// Copyright 2019-2022, University of Colorado Boulder

/**
 * Shows a combined NumberControl/ComboBox for controlling liquid density.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import ComboNumberControl from './ComboNumberControl.js';

export default class DensityControlNode extends ComboNumberControl<Material> {
  constructor( liquidMaterialProperty: Property<Material>, materials: Material[], listParent: Node ) {
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
      isHiddenValue: material => material.hidden,
      listParent: listParent,
      comboItems: [
        ...materials,
        customValue
      ].map( material => new ComboBoxItem( new Text( material.name, {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: 160
      } ), material, { tandemName: `${material.tandemName}Item` } ) ),
      customValue: customValue,
      numberControlOptions: {
        delta: 0.01,
        sliderOptions: {
          // Slightly longer, see https://github.com/phetsims/buoyancy/issues/33
          trackSize: new Dimension2( 130, 0.5 )
        }
      },
      comboBoxOptions: {
        listPosition: 'above'
      },
      getFallbackNode: material => {
        if ( material.hidden ) {
          return new Text( densityBuoyancyCommonStrings.whatIsTheFluidDensity, {
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
