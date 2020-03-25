// Copyright 2019-2020, University of Colorado Boulder

/**
 * Query parameters supported by density-buoyancy-common simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../densityBuoyancyCommon.js';

const DensityBuoyancyCommonQueryParameters = QueryStringMachine.getAll( {
  engine: {
    type: 'string',
    defaultValue: 'p2'
  },
  engineDebug: {
    type: 'boolean',
    defaultValue: false
  },
  poolWidthMultiplier: {
    type: 'number',
    defaultValue: 1
  }
} );

densityBuoyancyCommon.register( 'DensityBuoyancyCommonQueryParameters', DensityBuoyancyCommonQueryParameters );
export default DensityBuoyancyCommonQueryParameters;