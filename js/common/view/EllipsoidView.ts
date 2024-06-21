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
import MeasurableMassView from './MeasurableMassView.js';
import { THREEModelViewTransform } from './DensityBuoyancyScreenView.js';
import DisplayProperties from '../../buoyancy/view/DisplayProperties.js';

export default class EllipsoidView extends MeasurableMassView {

  private readonly ellipsoid: Ellipsoid;
  private readonly ellipsoidGeometry: THREE.SphereGeometry;
  private readonly updateListener: ( newSize: Bounds3 ) => void;

  public constructor( ellipsoid: Ellipsoid, modelViewTransform: THREEModelViewTransform, displayProperties: DisplayProperties ) {

    const ellipsoidGeometry = new THREE.SphereGeometry( 0.5, 30, 24 );

    super( ellipsoid, ellipsoidGeometry, modelViewTransform, displayProperties );

    this.ellipsoid = ellipsoid;
    this.ellipsoidGeometry = ellipsoidGeometry;

    const positionTag = () => {
      const size = ellipsoid.sizeProperty.value;
      this.tagOffsetProperty.value = new Vector3( size.minX + TAG_OFFSET, size.maxY - TAG_OFFSET, size.maxZ );
    };
    positionTag();

    this.updateListener = ( newSize: Bounds3 ) => {
      positionTag();
      this.massMesh.scale.x = newSize.width;
      this.massMesh.scale.y = newSize.height;
      this.massMesh.scale.z = newSize.depth;
    };
    this.ellipsoid.sizeProperty.link( this.updateListener );
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