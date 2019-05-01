// Copyright 2019, University of Colorado Boulder

/**
 * Abstract base type for handling physics engines
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );

  /**
   * @constructor
   */
  class Engine {
    constructor() {
    }
  }

  return densityBuoyancyCommon.register( 'Engine', Engine );
} );
