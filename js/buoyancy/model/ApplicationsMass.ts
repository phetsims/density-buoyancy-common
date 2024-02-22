// Copyright 2024, University of Colorado Boulder

/**
 * A general class for shared functionality between the boat and bottle.
 *
 * @author Agustín Vallejo
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import Mass, { InstrumentedMassOptions } from '../../common/model/Mass.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import PhysicsEngine from '../../common/model/PhysicsEngine.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Bounds3 } from '../../../../dot/js/imports.js';

export type ApplicationsMassOptions = InstrumentedMassOptions;

export default abstract class ApplicationsMass extends Mass {

  // The volume that the boat or bottle can hold inside them.
  public displacementVolumeProperty: NumberProperty;

  protected massLabelOffsetVector3: Vector3;

  public readonly intersectionGroup: THREE.Group;

  public constructor( engine: PhysicsEngine, displacementVolumeProperty: NumberProperty, options: ApplicationsMassOptions ) {

    assert && assert( !options.canRotate );

    super( engine, options );

    this.displacementVolumeProperty = displacementVolumeProperty;

    const bounds = this.shapeProperty.value.getBounds();

    // Mass label on the bottom left of the mass, top because the Y is flipped.
    this.massLabelOffsetVector3 = new Vector3( bounds.left, bounds.top, 0 );

    this.massLabelOffsetOrientationProperty.value = new Vector2( 1, -1 / 2 );
    this.massLabelOffsetProperty.value = this.massLabelOffsetVector3;

    this.intersectionGroup = new THREE.Group();
  }

  /**
   * A box that contains the geometry of the Mass
   */
  public override getLocalBounds(): Bounds3 {
    const bounds2 = this.shapeProperty.value.bounds;
    return new Bounds3( bounds2.minX, bounds2.minY, -bounds2.minY, bounds2.maxX, bounds2.maxY, bounds2.minY );
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public override intersect( ray: Ray3, isTouch: boolean, scale = 1 ): number | null {
    const translation = this.matrix.translation;
    const adjustedPosition = ray.position.minusXYZ( translation.x, translation.y, 0 ).dividedScalar( scale );

    const raycaster = new THREE.Raycaster( ThreeUtils.vectorToThree( adjustedPosition ), ThreeUtils.vectorToThree( ray.direction ) );
    const intersections: THREE.Intersection<THREE.Group>[] = [];
    raycaster.intersectObject( this.intersectionGroup, true, intersections );

    return intersections.length ? intersections[ 0 ].distance * scale : null;
  }

  protected abstract evaluatePiecewiseLinearArea( ratio: number ): number;

  protected abstract evaluatePiecewiseLinearVolume( ratio: number ): number;

  /**
   * Returns the displayed area of this object at a given y level
   *
   * Assumes step information was updated.
   */
  public getDisplacedArea( liquidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( liquidLevel < bottom || liquidLevel > top ) {
      return 0;
    }

    const ratio = ( liquidLevel - bottom ) / ( top - bottom );

    return this.evaluatePiecewiseLinearArea( ratio );
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedVolume( liquidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( liquidLevel <= bottom ) {
      return 0;
    }
    else if ( liquidLevel >= top ) {
      return this.displacementVolumeProperty.value;
    }
    else {
      const ratio = ( liquidLevel - bottom ) / ( top - bottom );

      return this.evaluatePiecewiseLinearVolume( ratio );
    }
  }

  public setRatios( widthRatio: number, heightRatio: number ): void {
    // For boat and bottle this is a no-op
  }

}

densityBuoyancyCommon.register( 'ApplicationsMass', ApplicationsMass );
