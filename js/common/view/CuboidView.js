// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );

  class CuboidView extends MassView {
    /**
     * @param {Cuboid} cuboid
     */
    constructor( cuboid ) {
      const size = cuboid.sizeProperty.value;
      const boxGeometry = new THREE.BoxGeometry( size.width, size.height, size.depth );

      super( cuboid, boxGeometry );

      // @public {Cuboid}
      this.cuboid = cuboid;
    }
  }

  return densityBuoyancyCommon.register( 'CuboidView', CuboidView );
} );
