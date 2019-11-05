// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyModel = require( 'DENSITY_BUOYANCY_COMMON/common/model/DensityBuoyancyModel' );

  class BuoyancyApplicationsModel extends DensityBuoyancyModel {
    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      super( tandem );
    }

    /**
     * Resets things to their original values.
     * @public
     * @override
     */
    reset() {
      super.reset();
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );
} );
