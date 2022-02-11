// Copyright 2021-2022, University of Colorado Boulder

/**
 * Determines the mode difference between one block and two blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class TwoBlockMode extends EnumerationValue {
  static ONE_BLOCK = new TwoBlockMode();
  static TWO_BLOCKS = new TwoBlockMode();

  static enumeration = new Enumeration( TwoBlockMode, {
    phetioDocumentation: 'Whether one or two blocks are visible'
  } );
}

densityBuoyancyCommon.register( 'TwoBlockMode', TwoBlockMode );
export default TwoBlockMode;