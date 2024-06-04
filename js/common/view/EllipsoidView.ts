// Copyright 2019-2024, University of Colorado Boulder

/**
 * The 3D view for an Ellipsoid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Ellipsoid from '../model/Ellipsoid.js';
import { TAG_OFFSET } from './MassTagNode.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import MeasurableMassView from './MeasurableMassView.js';
import { THREEModelViewTransform } from './DensityBuoyancyScreenView.js';

export default class EllipsoidView extends MeasurableMassView {

  private readonly ellipsoid: Ellipsoid;
  private readonly ellipsoidGeometry: THREE.SphereGeometry;
  private readonly updateListener: ( newSize: Bounds3, oldSize: Bounds3 ) => void;

  public constructor( ellipsoid: Ellipsoid, modelViewTransform: THREEModelViewTransform,
                      showGravityForceProperty: TReadOnlyProperty<boolean>,
                      showBuoyancyForceProperty: TReadOnlyProperty<boolean>,
                      showContactForceProperty: TReadOnlyProperty<boolean>,
                      showForceValuesProperty: TReadOnlyProperty<boolean>,
                      vectorZoomProperty: TReadOnlyProperty<number>,
                      showMassValuesProperty: TReadOnlyProperty<boolean> ) {

    const ellipsoidGeometry = new THREE.SphereGeometry( 1, 30, 24 );

    super( ellipsoid, ellipsoidGeometry, modelViewTransform, showGravityForceProperty,
      showBuoyancyForceProperty,
      showContactForceProperty,
      showForceValuesProperty,
      vectorZoomProperty,
      showMassValuesProperty );

    this.ellipsoid = ellipsoid;
    this.ellipsoidGeometry = ellipsoidGeometry;

    const positionTag = () => {
      const size = ellipsoid.sizeProperty.value;
      this.tagOffsetProperty.value = new Vector3( size.minX + TAG_OFFSET, size.maxY - TAG_OFFSET, size.maxZ );
    };
    positionTag();

    this.updateListener = ( newSize: Bounds3, oldSize: Bounds3 ) => {
      positionTag();
      // @ts-expect-error OLD version possibly?
      ellipsoidGeometry.applyMatrix( new THREE.Matrix4().makeScale(
        newSize.width / oldSize.width,
        newSize.height / oldSize.height,
        newSize.depth / oldSize.depth
      ) );
      ellipsoidGeometry.computeBoundingSphere();
      this.massMesh.updateMatrix();
    };
    this.ellipsoid.sizeProperty.lazyLink( this.updateListener );
    this.updateListener( this.ellipsoid.sizeProperty.value, new Bounds3( -1, -1, -1, 1, 1, 1 ) );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.ellipsoid.sizeProperty.unlink( this.updateListener );
    this.ellipsoidGeometry.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'EllipsoidView', EllipsoidView );