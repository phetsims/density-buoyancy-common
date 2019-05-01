// Copyright 2019, University of Colorado Boulder

/**
 * Constants for the density/buoyancy sims
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );

  const DensityBuoyancyCommonConstants = {
    // @public {number}
    MATTER_SIZE_SCALE: 100
  };

  densityBuoyancyCommon.register( 'DensityBuoyancyCommonConstants', DensityBuoyancyCommonConstants );

  return DensityBuoyancyCommonConstants;
} );
