// Copyright 2024, University of Colorado Boulder

/**
 * BottleOrBoat is a string literal union enumeration that describes whether the sim is showing the bottle or boat scene
 * in the Buoyancy - Applications screen.
 *
 * TODO: https://github.com/phetsims/density-buoyancy-common/issues/317 some string literal enumerations are uppercase, some are lowercase. Recommend to make consistent.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export const BottleOrBoatValues = [ 'BOTTLE', 'BOAT' ] as const;

export type BottleOrBoat = typeof BottleOrBoatValues[number];