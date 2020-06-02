// Copyright 2019-2020, University of Colorado Boulder

/**
 * Query parameters supported by density-buoyancy-common simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../densityBuoyancyCommon.js';

const DensityBuoyancyCommonQueryParameters = QueryStringMachine.getAll( {
  poolWidthMultiplier: {
    type: 'number',
    defaultValue: 1
  },
  showDebug: {
    type: 'flag'
  }
} );

densityBuoyancyCommon.register( 'DensityBuoyancyCommonQueryParameters', DensityBuoyancyCommonQueryParameters );
export default DensityBuoyancyCommonQueryParameters;