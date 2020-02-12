// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const ComboNumberControl = require( 'DENSITY_BUOYANCY_COMMON/common/view/ComboNumberControl' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Range = require( 'DOT/Range' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const fluidDensityString = require( 'string!DENSITY_BUOYANCY_COMMON/fluidDensity' );
  const kilogramsPerLiterPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPerLiterPattern' );

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

  return densityBuoyancyCommon.register( 'DensityControlNode', DensityControlNode );
} );
