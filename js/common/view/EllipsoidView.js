// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassView from './MassView.js';

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

densityBuoyancyCommon.register( 'EllipsoidView', EllipsoidView );
export default EllipsoidView;