// Copyright 2021, University of Colorado Boulder

/**
 * Determines the mode difference between one block and two blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

const TwoBlockMode = EnumerationDeprecated.byKeys( [
  'ONE_BLOCK',
  'TWO_BLOCKS'
] );

densityBuoyancyCommon.register( 'TwoBlockMode', TwoBlockMode );
export default TwoBlockMode;