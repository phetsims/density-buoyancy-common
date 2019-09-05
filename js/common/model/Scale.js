// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const InterpolatedProperty = require( 'DENSITY_BUOYANCY_COMMON/common/model/InterpolatedProperty' );

  class Scale extends Cuboid {
    /**
     * @param {Engine} engine
     * @param {Bounds3} size
     * @param {Object} config
     */
    constructor( engine, size, config ) {
      super( engine, size, config );

      // @public {Property.<number>} - In Newtons.
      this.scaleForceProperty = new InterpolatedProperty( 0, {
        interpolate: InterpolatedProperty.interpolateNumber
      } );
    }

    /**
     * Steps forward in time.
     * @public
     *
     * @param {number} dt
     * @param {number} interpolationRatio
     */
    step( dt, interpolationRatio ) {
      super.step( dt, interpolationRatio );

      this.scaleForceProperty.setRatio( interpolationRatio );
    }

    /**
     * Resets things to their original values.
     * @public
     */
    reset() {
      super.reset();
    }
  }

  return densityBuoyancyCommon.register( 'Scale', Scale );
} );
