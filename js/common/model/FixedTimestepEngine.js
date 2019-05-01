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
  const Engine = require( 'DENSITY_BUOYANCY_COMMON/common/model/Engine' );

  /**
   * @constructor
   */
  class FixedTimestepEngine extends Engine {
    constructor() {
      super();
    }
  }

  return densityBuoyancyCommon.register( 'FixedTimestepEngine', FixedTimestepEngine );
} );
