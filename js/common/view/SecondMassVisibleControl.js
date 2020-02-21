// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

  class SecondMassVisibleControl extends RadioButtonGroup {
    /**
     * @param {Property.<boolean>} secondaryMassVisibleProperty
     */
    constructor( secondaryMassVisibleProperty ) {
      super( secondaryMassVisibleProperty, [
        {
          value: false,
          node: new Rectangle( 0, 0, 50, 50, { fill: 'blue' } )
        },
        {
          value: true,
          node: new Rectangle( 0, 0, 50, 50, { fill: 'red' } )
        }
      ], {
        orientation: 'horizontal',
        baseColor: 'rgb( 230, 231, 232 )',
        disabledBaseColor: 'rgb( 230, 231, 232 )',
        // buttonContentXMargin: 3,
        // buttonContentYMargin: 3,
        touchAreaXDilation: 5,
        touchAreaYDilation: 5
      } );
    }
  }

  return densityBuoyancyCommon.register( 'SecondMassVisibleControl', SecondMassVisibleControl );
} );
