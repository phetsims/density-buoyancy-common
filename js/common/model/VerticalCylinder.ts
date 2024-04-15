// Copyright 2019-2024, University of Colorado Boulder

/**
 * A cylinder laying on its end (the caps are on the top and bottom)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION } from './Mass.js';
import PhysicsEngine from './PhysicsEngine.js';
import { MassShape } from './MassShape.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';

export type VerticalCylinderOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

export default class VerticalCylinder extends Mass {

  public readonly radiusProperty: Property<number>;
  public readonly heightProperty: Property<number>;

  // Step information
  public stepRadius: number;
  public stepHeight: number;
  public stepArea: number;
  public stepMaximumVolume: number;

  public constructor( engine: PhysicsEngine, radius: number, height: number, providedConfig: VerticalCylinderOptions ) {
    const config = optionize<VerticalCylinderOptions, EmptySelfOptions, InstrumentedMassOptions>()( {
      body: engine.createBox( 2 * radius, height ),
      shape: VerticalCylinder.getVerticalCylinderShape( radius, height ),
      volume: VerticalCylinder.getVolume( radius, height ),
      massShape: MassShape.VERTICAL_CYLINDER,

      phetioType: VerticalCylinder.VerticalCylinderIO
    }, providedConfig );

    assert && assert( !config.canRotate );

    super( engine, config as InstrumentedMassOptions );

    // {Property.<number>}
    this.radiusProperty = new NumberProperty( radius, {
      tandem: config.tandem.createTandem( 'radiusProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );
    this.heightProperty = new NumberProperty( height, {
      tandem: config.tandem.createTandem( 'heightProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );

    this.stepRadius = 0;
    this.stepHeight = 0;
    this.stepArea = 0;
    this.stepMaximumVolume = 0;

    this.massLabelOffsetOrientationProperty.value = new Vector2( 0, -1 );

    this.updateSize( radius, height );
  }

  public override getLocalBounds(): Bounds3 {
    const bounds2 = this.shapeProperty.value.bounds;
    return new Bounds3( bounds2.minX, bounds2.minY, -this.radiusProperty.value, bounds2.maxX, bounds2.maxY, this.radiusProperty.value );
  }

  /**
   * Updates the size of the cone.
   */
  public updateSize( radius: number, height: number ): void {
    this.engine.updateBox( this.body, 2 * radius, height );

    this.radiusProperty.value = radius;
    this.heightProperty.value = height;

    this.shapeProperty.value = VerticalCylinder.getVerticalCylinderShape( radius, height );

    this.volumeLock = true;
    this.volumeProperty.value = VerticalCylinder.getVolume( radius, height );
    this.volumeLock = false;

    this.forceOffsetProperty.value = new Vector3( 0, 0, radius );
    this.massLabelOffsetProperty.value = new Vector3( 0, -height / 2, radius );
  }

  /**
   * Returns the radius from a general size scale
   */
  public static getRadiusFromRatio( widthRatio: number ): number {
    return ( MASS_MIN_SHAPES_DIMENSION + widthRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
  }

  /**
   * Returns the height from a general size scale
   */
  public static getHeightFromRatio( heightRatio: number ): number {
    return ( MASS_MIN_SHAPES_DIMENSION + heightRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) );
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public setRatios( widthRatio: number, heightRatio: number ): void {
    this.updateSize(
      VerticalCylinder.getRadiusFromRatio( widthRatio ),
      VerticalCylinder.getHeightFromRatio( heightRatio )
    );
  }

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop
   */
  public override updateStepInformation(): void {
    super.updateStepInformation();

    const xOffset = this.stepMatrix.m02();
    const yOffset = this.stepMatrix.m12();

    this.stepX = xOffset;
    this.stepBottom = yOffset - this.heightProperty.value / 2;
    this.stepTop = yOffset + this.heightProperty.value / 2;

    this.stepRadius = this.radiusProperty.value;
    this.stepHeight = this.heightProperty.value;
    this.stepArea = Math.PI * this.stepRadius * this.stepRadius;
    this.stepMaximumVolume = this.stepArea * this.heightProperty.value;
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public override intersect( ray: Ray3, isTouch: boolean ): number | null {
    return VerticalCylinder.intersect( ray, isTouch, this.matrix.getTranslation().toVector3(), this.radiusProperty.value, this.heightProperty.value );
  }

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedArea( liquidLevel: number ): number {
    if ( liquidLevel < this.stepBottom || liquidLevel > this.stepTop ) {
      return 0;
    }
    else {
      return this.stepArea;
    }
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
      return this.stepMaximumVolume;
    }
    else {
      // This is identical to Cuboid's getDisplacedVolume formula, see there if this needs to change.
      return this.stepMaximumVolume * ( liquidLevel - bottom ) / ( top - bottom );
    }
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.radiusProperty.reset();
    this.heightProperty.reset();
    this.updateSize( this.radiusProperty.value, this.heightProperty.value );

    super.reset();
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.radiusProperty.dispose();
    this.heightProperty.dispose();

    super.dispose();
  }

  /**
   * Returns a vertical cylinder shape for a given radius/height.
   */
  public static getVerticalCylinderShape( radius: number, height: number ): Shape {
    return Shape.rect( -radius, -height / 2, 2 * radius, height );
  }

  /**
   * Returns the volume of a vertical cylinder with the given radius and height.
   */
  public static getVolume( radius: number, height: number ): number {
    return Math.PI * radius * radius * height;
  }

  /**
   * Calculates the intersection of a ray with a finite vertical cylinder. If an intersection occurs, this
   * function returns the smallest positive t-value, which represents the distance along the ray from its
   * origin to the closest point of intersection. If no intersection occurs, null is returned.
   *
   * The cylinder is assumed to be aligned vertically along the y-axis. The intersection test takes into
   * account both the radius in the xz-plane and the finite height along the y-axis. The function checks
   * for intersections that occur in front of the ray's origin and are within the vertical bounds of the
   * cylinder defined by its height.
   *
   * @param ray The Ray3 object representing the ray's origin and direction.
   * @param isTouch A boolean indicating if touching the surface is considered an intersection (not used in current implementation, but reserved for future use).
   * @param translation A Vector3 object representing the cylinder's center position in 3D space.
   * @param radius The radius of the cylinder.
   * @param height The height of the cylinder, extending symmetrically from the center along the y-axis.
   */
  public static intersect( ray: Ray3, isTouch: boolean, translation: Vector3, radius: number, height: number ): number | null {
    const ox = ray.position.x - translation.x;
    const oz = ray.position.z - translation.z;
    const dx = ray.direction.x;
    const dz = ray.direction.z;

    // Coefficients for the quadratic equation A*t^2 + B*t + C = 0
    const A = dx * dx + dz * dz;
    const B = 2 * ( ox * dx + oz * dz );
    const C = ox * ox + oz * oz - radius * radius;

    const tValues = Utils.solveQuadraticRootsReal( A, B, C )?.filter( t => {
      if ( t <= 0 ) {

        // Ignore negative t values (behind ray origin)
        return false;
      }
      const y = ray.position.y + t * ray.direction.y;
      const yMin = translation.y - height / 2;
      const yMax = translation.y + height / 2;
      return y >= yMin && y <= yMax; // Check if the intersection is within the cylinder height
    } );

    if ( tValues && tValues.length > 0 ) {

      // Assuming we want the closest intersection
      return Math.min( ...tValues );
    }
    else {
      return null;
    }
  }


  public static readonly VerticalCylinderIO = new IOType( 'VerticalCylinderIO', {
    valueType: VerticalCylinder,
    supertype: Mass.MassIO,
    documentation: 'Represents a cylinder laying on its end'
  } );
}

densityBuoyancyCommon.register( 'VerticalCylinder', VerticalCylinder );