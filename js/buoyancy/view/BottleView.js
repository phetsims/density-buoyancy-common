// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bottle = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Bottle' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );

  class BottleView extends MassView {
    /**
     * @param {Bottle} bottle
     */
    constructor( bottle ) {

      const primaryGeometry = Bottle.getPrimaryGeometry();
      // const capGeometry = Bottle.getCapGeometry();

      super( bottle, primaryGeometry );

      // @public {Bottle}
      this.bottle = bottle;
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'BottleView', BottleView );
} );
