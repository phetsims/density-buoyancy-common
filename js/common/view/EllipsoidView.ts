// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 3D view for a Ellipsoid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Ellipsoid from '../model/Ellipsoid.js';
import MassView from './MassView.js';

class EllipsoidView extends MassView {

  readonly ellipsoid: Ellipsoid;
  private ellipsoidGeometry: THREE.SphereGeometry;
  private updateListener: ( newSize: Bounds3, oldSize: Bounds3 ) => void;

  constructor( ellipsoid: Ellipsoid ) {

    const ellipsoidGeometry = new THREE.SphereGeometry( 1, 30, 24 );

    super( ellipsoid, ellipsoidGeometry );

    this.ellipsoid = ellipsoid;
    this.ellipsoidGeometry = ellipsoidGeometry;

    this.updateListener = ( newSize: Bounds3, oldSize: Bounds3 ) => {
      // @ts-ignore OLD version possibly?
      ellipsoidGeometry.applyMatrix( new THREE.Matrix4().makeScale(
        newSize.width / oldSize.width,
        newSize.height / oldSize.height,
        newSize.depth / oldSize.depth
      ) );
      ellipsoidGeometry.computeBoundingSphere();
      this.updateMatrix();
    };
    this.ellipsoid.sizeProperty.lazyLink( this.updateListener );
    this.updateListener( this.ellipsoid.sizeProperty.value, new Bounds3( -1, -1, -1, 1, 1, 1 ) );
  }

  /**
   * Releases references.
   */
  dispose() {
    this.ellipsoid.sizeProperty.unlink( this.updateListener );
    this.ellipsoidGeometry.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'EllipsoidView', EllipsoidView );
export default EllipsoidView;