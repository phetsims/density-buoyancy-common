// Copyright 2021, University of Colorado Boulder

/**
 * Determines the mode difference between one block and two blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

const TwoBlockMode = Enumeration.byKeys( [
  'ONE_BLOCK',
  'TWO_BLOCKS'
] );

densityBuoyancyCommon.register( 'TwoBlockMode', TwoBlockMode );
export default TwoBlockMode;