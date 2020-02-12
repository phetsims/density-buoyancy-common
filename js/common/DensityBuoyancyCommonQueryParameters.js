// Copyright 2019, University of Colorado Boulder

/**
 * Query parameters supported by density-buoyancy-common simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );

  const DensityBuoyancyCommonQueryParameters = QueryStringMachine.getAll( {
    engine: {
      type: 'string',
      defaultValue: 'p2'
    },
    poolWidthMultiplier: {
      type: 'number',
      defaultValue: 1
    }
  } );

  return densityBuoyancyCommon.register( 'DensityBuoyancyCommonQueryParameters', DensityBuoyancyCommonQueryParameters );
} );
