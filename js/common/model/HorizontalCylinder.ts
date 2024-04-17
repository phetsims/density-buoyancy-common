// Copyright 2019-2024, University of Colorado Boulder

/**
 * A cylinder laying on its side (the caps are on the left/right)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION } from './Mass.js';
import PhysicsEngine from './PhysicsEngine.js';
import { MassShape } from './MassShape.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';

export type HorizontalCylinderOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

export default class HorizontalCylinder extends Mass {

  public readonly radiusProperty: Property<number>;
  public readonly lengthProperty: Property<number>;

  // Step information
  public stepRadius: number;
  public stepHeight: number;
  public stepArea: number;
  public stepMaximumVolume: number;
  public stepMaximumArea: number;

  public constructor( engine: PhysicsEngine, radius: number, length: number, providedOptions: HorizontalCylinderOptions ) {
    const options = optionize<HorizontalCylinderOptions, EmptySelfOptions, InstrumentedMassOptions>()( {
      body: engine.createBox( length, radius * 2 ),
      shape: HorizontalCylinder.getHorizontalCylinderShape( radius, length ),
      volume: HorizontalCylinder.getVolume( radius, length ),
      massShape: MassShape.HORIZONTAL_CYLINDER,

      phetioType: HorizontalCylinder.HorizontalCylinderIO
    }, providedOptions );

    assert && assert( !options.canRotate );

    super( engine, options as InstrumentedMassOptions );

    // {Property.<number>}
    this.radiusProperty = new NumberProperty( radius, {
      tandem: options.tandem.createTandem( 'radiusProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );
    this.lengthProperty = new NumberProperty( length, {
      tandem: options.tandem.createTandem( 'lengthProperty' ),
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );

    this.stepRadius = 0;
    this.stepHeight = 0;
    this.stepArea = 0;
    this.stepMaximumVolume = 0;
    this.stepMaximumArea = 0;

    this.updateSize( radius, length );
  }

  /**
   * Updates the size of the cone.
   */
  public updateSize( radius: number, length: number ): void {
    this.engine.updateBox( this.body, length, radius * 2 );

    this.radiusProperty.value = radius;
    this.lengthProperty.value = length;

    this.shapeProperty.value = HorizontalCylinder.getHorizontalCylinderShape( radius, length );

    this.volumeLock = true;
    this.volumeProperty.value = HorizontalCylinder.getVolume( radius, length );
    this.volumeLock = false;

    this.forceOffsetProperty.value = new Vector3( 0, 0, radius );
    this.massLabelOffsetProperty.value = new Vector3( 0, -radius * 0.5, radius * 0.7 );
  }

  public override getLocalBounds(): Bounds3 {
    const bounds2 = this.shapeProperty.value.bounds;
    return new Bounds3( bounds2.minX, bounds2.minY, -this.radiusProperty.value, bounds2.maxX, bounds2.maxY, this.radiusProperty.value );
  }

  /**
   * Returns the radius from a general size scale
   */
  public static getRadiusFromRatio( heightRatio: number ): number {
    return ( MASS_MIN_SHAPES_DIMENSION + heightRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
  }

  /**
   * Returns the length from a general size scale
   */
  public static getLengthFromRatio( widthRatio: number ): number {
    return ( MASS_MIN_SHAPES_DIMENSION + widthRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) );
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public setRatios( widthRatio: number, heightRatio: number ): void {
    this.updateSize(
      HorizontalCylinder.getRadiusFromRatio( heightRatio ),
      HorizontalCylinder.getLengthFromRatio( widthRatio )
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
    this.stepBottom = yOffset - this.radiusProperty.value;
    this.stepTop = yOffset + this.radiusProperty.value;

    this.stepRadius = this.radiusProperty.value;
    this.stepHeight = this.lengthProperty.value;
    this.stepMaximumArea = 2 * this.stepRadius * this.lengthProperty.value;
    this.stepMaximumVolume = Math.PI * this.stepRadius * this.stepRadius * this.lengthProperty.value;
  }

  /**
   * Calculates the intersection of a ray with a horizontally aligned cylinder. The function returns the smallest
   * positive t-value if an intersection occurs, representing the distance from the ray's origin to the closest point
   * of intersection along the ray's path. If no intersection is found, null is returned.
   *
   * The cylinder is assumed to extend infinitely along the x-axis and has a finite radius and length. The intersection
   * calculation takes into account both the radius in the yz-plane and the finite length along the x-axis. The function
   * ensures that the intersection point is within the horizontal bounds of the cylinder defined by its length.
   *
   * @param ray - The Ray3 object, which includes the ray's origin and direction vector in 3D space.
   * @param isTouch - A boolean flag (currently reserved for future use) that indicates whether touching
   *                            the surface should be considered as an intersection. This parameter is not used in
   *                            the current implementation.
   * @returns - The smallest positive t-value for which the intersection occurs if any, otherwise null.
   *                          The t-value is the parameter at which the ray intersects the cylinder along its path,
   *                          computed as ray.position + ray.direction * t.
   *
   * @see VerticalCylinder.intersect
   */
  public override intersect( ray: Ray3, isTouch: boolean ): number | null {
    const translation = this.matrix.getTranslation().toVector3();
    const radius = this.radiusProperty.value;
    const length = this.lengthProperty.value;

    // Relative position of ray origin to cylinder's center in yz-plane
    const oy = ray.position.y - translation.y;
    const oz = ray.position.z - translation.z;

    // Direction components in yz-plane
    const dy = ray.direction.y;
    const dz = ray.direction.z;

    // Quadratic coefficients for intersection with cylinder in yz-plane
    const A = dy * dy + dz * dz;
    const B = 2 * ( oy * dy + oz * dz );
    const C = oy * oy + oz * oz - radius * radius;

    // Solve quadratic equation for t
    const tValues = Utils.solveQuadraticRootsReal( A, B, C )?.filter( t => {
      if ( t <= 0 ) {
        return false; // Only consider intersections in front of the ray origin
      }
      // Check if the intersection is within the cylinder's length along the x-axis
      const x = ray.position.x + t * ray.direction.x;
      return Math.abs( x - translation.x ) <= length / 2;
    } );

    if ( tValues && tValues.length > 0 ) {
      return tValues[ 0 ]; // Return the closest valid intersection
    }
    else {
      return null; // No valid intersection found
    }
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
      const ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );

      return this.stepMaximumArea * 2 * Math.sqrt( ratio - ratio * ratio );
    }
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedVolume( liquidLevel: number ): number {
    if ( liquidLevel <= this.stepBottom ) {
      return 0;
    }
    else if ( liquidLevel >= this.stepTop ) {
      return this.stepMaximumVolume;
    }
    else {
      const ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );
      const f = 2 * ratio - 1;

      // Computed with Mathematica
      return this.stepMaximumVolume * ( 2 * Math.sqrt( ratio - ratio * ratio ) * f + Math.acos( -f ) ) / Math.PI;
    }
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.radiusProperty.reset();
    this.lengthProperty.reset();
    this.updateSize( this.radiusProperty.value, this.lengthProperty.value );

    super.reset();
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.radiusProperty.dispose();
    this.lengthProperty.dispose();

    super.dispose();
  }

  /**
   * Returns a horizontal cylinder shape for a given radius/length.
   */
  public static getHorizontalCylinderShape( radius: number, length: number ): Shape {
    return Shape.rect( -length / 2, -radius, length, 2 * radius );
  }

  /**
   * Returns the volume of a horizontal cylinder with the given radius and length.
   */
  public static getVolume( radius: number, length: number ): number {
    return Math.PI * radius * radius * length;
  }

  public static readonly HorizontalCylinderIO = new IOType( 'HorizontalCylinderIO', {
    valueType: HorizontalCylinder,
    supertype: Mass.MassIO,
    documentation: 'Represents a cylinder laying on its side'
  } );
}

densityBuoyancyCommon.register( 'HorizontalCylinder', HorizontalCylinder );