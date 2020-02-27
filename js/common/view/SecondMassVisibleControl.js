// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

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

densityBuoyancyCommon.register( 'SecondMassVisibleControl', SecondMassVisibleControl );
export default SecondMassVisibleControl;