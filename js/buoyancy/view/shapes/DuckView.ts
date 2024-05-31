// Copyright 2024, University of Colorado Boulder

/**
 * The 3D view for a Duck.
 *
 * @author Agustín Vallejo
 * @author Michael Kauzmann
 */

import Bounds3 from '../../../../../dot/js/Bounds3.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import Duck from '../../model/shapes/Duck.js';
import { THREEModelViewTransform } from '../../../common/view/DensityBuoyancyScreenView.js';
import MeasurableMassView from '../../../common/view/MeasurableMassView.js';
import { duckGeometry } from '../../model/shapes/DuckData.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import Vector2 from '../../../../../dot/js/Vector2.js';

export default class DuckView extends MeasurableMassView {

  public readonly duck: Duck;
  private duckGeometry: THREE.BufferGeometry;

  public constructor( duck: Duck, modelViewTransform: THREEModelViewTransform,
                      showGravityForceProperty: TReadOnlyProperty<boolean>,
                      showBuoyancyForceProperty: TReadOnlyProperty<boolean>,
                      showContactForceProperty: TReadOnlyProperty<boolean>,
                      showForceValuesProperty: TReadOnlyProperty<boolean>,
                      vectorZoomProperty: TReadOnlyProperty<number>,
                      showMassValuesProperty: TReadOnlyProperty<boolean> ) {

    const size = duck.sizeProperty.value;

    const duckGeometry = DuckView.getDuckGeometry( size );

    super( duck, duckGeometry, modelViewTransform,

      showGravityForceProperty,
      showBuoyancyForceProperty,
      showContactForceProperty,
      showForceValuesProperty,
      vectorZoomProperty,

      showMassValuesProperty );

    this.duck = duck;
    this.duckGeometry = duckGeometry;

    const positionTag = () => {
      const size = duck.sizeProperty.value;
      const DUCK_TAG_OFFSET = new Vector2( 0.01, 0.03 );
      this.tagOffsetProperty.value = new Vector3( size.minX - DUCK_TAG_OFFSET.x, size.maxY + DUCK_TAG_OFFSET.y, size.maxZ );
    };
    positionTag();

    const updateListener = ( newSize: Bounds3, oldSize: Bounds3 ) => {
      positionTag();
      // @ts-expect-error OLD version possibly?
      duckGeometry.applyMatrix( new THREE.Matrix4().makeScale(
        newSize.width / oldSize.width,
        newSize.height / oldSize.height,
        newSize.depth / oldSize.depth
      ) );
      duckGeometry.computeBoundingSphere();
      this.massMesh.updateMatrix();
    };
    duck.sizeProperty.lazyLink( updateListener );

  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.duckGeometry.dispose();

    super.dispose();
  }

  public static getDuckGeometry( size: Bounds3 ): THREE.BufferGeometry {

    const geometry = duckGeometry.clone();

    // Scale the duck to the size of the duck model
    geometry.scale( size.width, size.height, size.depth );

    return geometry;
  }
}

densityBuoyancyCommon.register( 'DuckView', DuckView );