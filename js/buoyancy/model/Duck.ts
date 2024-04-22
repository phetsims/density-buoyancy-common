// Copyright 2019-2024, University of Colorado Boulder

/**
 * An adjustable Duck
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION } from '../../common/model/Mass.js';
import PhysicsEngine from '../../common/model/PhysicsEngine.js';
import { MassShape } from '../../common/model/MassShape.js';
import DuckData from './DuckData.js';

export type DuckOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

const loader = new THREE.ObjectLoader();

const mainDuckGeometry = loader.parse( DuckData );
const SCALE = 0.1;

const duckGeometry = ( mainDuckGeometry.children[ 0 ] as THREE.Mesh ).geometry.scale( SCALE, SCALE, SCALE );


// const VERTICES = _.chunk( mainDuckGeometry.children[ 0 ].geometry.getAttribute( 'position' ).array, 3 ).map( vert3 => {
//   return new Vector2( vert3[ 0 ], vert3[ 2 ] );
// } );

export default class Duck extends Mass {

  public readonly sizeProperty: Property<Bounds3>;

  // Step information
  public stepMaximumArea: number;
  public stepMaximumVolume: number;

  public constructor( engine: PhysicsEngine, size: Bounds3, providedConfig: DuckOptions ) {

    const config = optionize<DuckOptions, EmptySelfOptions, InstrumentedMassOptions>()( {
      body: engine.createFromVertices( Duck.getDuckVertices( size.width, size.height ), false ),
      shape: Duck.getDuckShape( size.width, size.height ),
      volume: Duck.getVolume( size ),
      massShape: MassShape.DUCK,

      phetioType: Duck.DuckIO
    }, providedConfig );

    assert && assert( !config.canRotate );

    super( engine, config as InstrumentedMassOptions );

    this.sizeProperty = new Property( size, {
      valueType: Bounds3,
      tandem: config.tandem.createTandem( 'sizeProperty' ),
      phetioValueType: Bounds3.Bounds3IO
    } );

    this.stepMaximumArea = 0;
    this.stepMaximumVolume = 0;

    this.updateSize( size );
  }

  public override getLocalBounds(): Bounds3 {
    return this.sizeProperty.value;
  }

  /**
   * Updates the size of the duck.
   */
  public updateSize( size: Bounds3 ): void {
    this.engine.updateFromVertices( this.body, Duck.getDuckVertices( size.width, size.height ), false );
    this.sizeProperty.value = size;
    this.shapeProperty.value = Duck.getDuckShape( size.width, size.height );

    this.volumeLock = true;
    this.volumeProperty.value = Duck.getVolume( size );
    this.volumeLock = false;

    this.forceOffsetProperty.value = new Vector3( 0, 0, size.maxZ );
    this.massLabelOffsetProperty.value = new Vector3( 0, size.minY * 0.5, size.maxZ * 0.7 );
  }

  /**
   * Returns the general size of the mass based on a general size scale.
   */
  public static getSizeFromRatios( widthRatio: number, heightRatio: number ): Bounds3 {
    const x = ( MASS_MIN_SHAPES_DIMENSION + widthRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
    const y = ( MASS_MIN_SHAPES_DIMENSION + heightRatio * ( MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION ) ) / 2;
    return new Bounds3( -x, -y, -x, x, y, x );
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public setRatios( widthRatio: number, heightRatio: number ): void {
    this.updateSize( Duck.getSizeFromRatios( widthRatio, heightRatio ) );
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
    this.stepBottom = yOffset + this.sizeProperty.value.minY;
    this.stepTop = yOffset + this.sizeProperty.value.maxY;

    const a = this.sizeProperty.value.width / 2;
    const b = this.sizeProperty.value.height / 2;
    const c = this.sizeProperty.value.depth / 2;
    this.stepMaximumArea = 4 * Math.PI * a * c; // 4 * pi * a * c
    this.stepMaximumVolume = this.stepMaximumArea * b / 3; // 4/3 * pi * a * b * c
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public override intersect( ray: Ray3, isTouch: boolean ): number | null {
    const translation = this.matrix.getTranslation().toVector3();
    const size = this.sizeProperty.value;
    const relativePosition = ray.position.minusXYZ( translation.x, translation.y, translation.z );

    const xp = 4 / ( size.width * size.width );
    const yp = 4 / ( size.height * size.height );
    const zp = 4 / ( size.depth * size.depth );

    const a = xp * ray.direction.x * ray.direction.x + yp * ray.direction.y * ray.direction.y + zp * ray.direction.z * ray.direction.z;
    const b = 2 * ( xp * relativePosition.x * ray.direction.x + yp * relativePosition.y * ray.direction.y + zp * relativePosition.z * ray.direction.z );
    const c = -1 + xp * relativePosition.x * relativePosition.x + yp * relativePosition.y * relativePosition.y + zp * relativePosition.z * relativePosition.z;

    const tValues = Utils.solveQuadraticRootsReal( a, b, c )!.filter( t => t > 0 );

    if ( tValues.length ) {
      return tValues[ 0 ];
    }
    else {
      return null;
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
      // const ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );

      return 0.1; // 4 * pi * a * c * ( t - t^2 )
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

      return this.stepMaximumVolume * ratio * ratio * ( 3 - 2 * ratio ); // 4/3 * pi * a * b * c * t^2 * ( 3 - 2t )
    }
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.sizeProperty.reset();
    this.updateSize( this.sizeProperty.value );

    super.reset();
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.sizeProperty.dispose();

    super.dispose();
  }

  /**
   * Returns a duck shape
   */
  public static getDuckShape( width: number, height: number ): Shape {
    // Maybe get a 2d shape via code in the patch in https://github.com/phetsims/density-buoyancy-common/issues/115#issuecomment-2067166189
    return Shape.circle( Vector2.ZERO, height / 2 );
  }

  /**
   * Returns vertices for a duck
   */
  public static getDuckVertices( width: number, height: number ): Vector2[] {

    // a square
    const vertices = [
      new Vector2( -width / 2, -height / 2 ),
      new Vector2( width / 2, -height / 2 ),
      new Vector2( width / 2, height / 2 ),
      new Vector2( -width / 2, height / 2 )
    ];
    return vertices;
  }

  /**
   * Returns the volume of a duck with the given axis-aligned bounding box.
   */
  public static getVolume( size: Bounds3 ): number {
    return Math.PI * size.width * size.height * size.depth / 6;
  }

  public static DuckIO = new IOType( 'DuckIO', {
    valueType: Duck,
    supertype: Mass.MassIO,
    documentation: 'Represents a duck'
  } );

  public static getGeometry(): THREE.BufferGeometry {
    return duckGeometry;
    // const SCALE = 0.1;
    // this.duckGeometry.scale( SCALE, SCALE, SCALE );


  }
}

densityBuoyancyCommon.register( 'Duck', Duck );