// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds3 = require( 'DOT/Bounds3' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );

  class EllipsoidView extends MassView {
    /**
     * @param {Ellipsod} ellipsoid
     */
    constructor( ellipsoid ) {

      const ellipsoidGeometry = new THREE.SphereGeometry( 1, 30, 24 );

      super( ellipsoid, ellipsoidGeometry );

      // @public {Ellipsod}
      this.ellipsoid = ellipsoid;

      // @private {function}
      this.updateListener = ( newSize, oldSize ) => {
        ellipsoidGeometry.applyMatrix( new THREE.Matrix4().makeScale(
          newSize.width / oldSize.width,
          newSize.height / oldSize.height,
          newSize.depth / oldSize.depth
        ) );
        // TODO: how to update
        ellipsoidGeometry.computeBoundingSphere();
        this.updateMatrix(); // TODO: do we need this?
      };
      this.ellipsoid.sizeProperty.lazyLink( this.updateListener );
      this.updateListener( this.ellipsoid.sizeProperty.value, new Bounds3( -1, -1, -1, 1, 1, 1 ) );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.ellipsoid.sizeProperty.unlink( this.updateListener );

      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'EllipsoidView', EllipsoidView );
} );
