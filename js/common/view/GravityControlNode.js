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
  const Gravity = require( 'DENSITY_BUOYANCY_COMMON/common/model/Gravity' );
  const Range = require( 'DOT/Range' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const gravityNameString = require( 'string!DENSITY_BUOYANCY_COMMON/gravity.name' );
  const metersPerSecondSquaredPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/metersPerSecondSquaredPattern' );

  class GravityControlNode extends ComboNumberControl {
    /**
     * @param {Property.<Gravity>} gravityProperty
     * @param {Node} listParent
     */
    constructor( gravityProperty, listParent ) {

      const customValue = Gravity.createCustomGravity( 9.8 );

      super( {
        title: gravityNameString,
        valuePattern: metersPerSecondSquaredPatternString,
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
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT
        } ), gravity ) ),
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

  return densityBuoyancyCommon.register( 'GravityControlNode', GravityControlNode );
} );
