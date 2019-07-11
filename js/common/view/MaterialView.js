// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );

  class MaterialView {
    constructor() {
      // @public {THREE.Material}
      this.material = null;
    }

    /**
     * Updates the material view (before the main rendering)
     * @public
     *
     * @param {MassView} massView
     * @param {THREE.Scene} scene
     */
    update( massView, scene ) {

    }
  }

  return densityBuoyancyCommon.register( 'MaterialView', MaterialView );
} );
