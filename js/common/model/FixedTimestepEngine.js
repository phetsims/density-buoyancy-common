// Copyright 2019, University of Colorado Boulder

/**
 * Abstract base type for handling physics engines
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Engine from './Engine.js';

class FixedTimestepEngine extends Engine {
  constructor() {
    super();
  }
}

densityBuoyancyCommon.register( 'FixedTimestepEngine', FixedTimestepEngine );
export default FixedTimestepEngine;