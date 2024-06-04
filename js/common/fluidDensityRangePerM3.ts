// Copyright 2024, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Range from '../../../dot/js/Range.js';
import DensityBuoyancyCommonConstants from './DensityBuoyancyCommonConstants.js';

const FLUID_DENSITY_RANGE_PER_L = new Range( 0.5, 15 );
const fluidDensityRangePerM3 = FLUID_DENSITY_RANGE_PER_L.copy().times( DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER );

export default fluidDensityRangePerM3;