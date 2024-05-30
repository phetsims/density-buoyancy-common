// Copyright 2019-2024, University of Colorado Boulder

/**
 * An adjustable Duck
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import StrictOmit from '../../../../../phet-core/js/types/StrictOmit.js';
import Bounds3 from '../../../../../dot/js/Bounds3.js';
import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import { Shape } from '../../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import IOType from '../../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION } from '../../../common/model/Mass.js';
import PhysicsEngine from '../../../common/model/PhysicsEngine.js';
import { MassShape } from '../../../common/model/MassShape.js';
import { flatDuckData } from './DuckData.js';

export type DuckOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

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
      body: engine.createFromVertices( Duck.getDuckVertices( size.width, size.height ), true ),
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
    const vertices = Duck.getDuckVertices( size.width, size.height );
    this.engine.updateFromVertices( this.body, vertices, true );
    this.sizeProperty.value = size;
    this.shapeProperty.value = Duck.getDuckShape( size.width, size.height );

    this.volumeLock = true;
    this.volumeProperty.value = Duck.getVolume( size );
    this.volumeLock = false;

    this.forceOffsetProperty.value = new Vector3( 0, 0, size.maxZ );
    this.massLabelOffsetProperty.value = new Vector3( 0, size.minY * 0.5, size.maxZ * 0.7 );

    // Keep the body centered, see https://github.com/phetsims/buoyancy/issues/148
    this.bodyOffsetProperty.value = Utils.centroidOfPolygon( vertices ).negated();
    this.writeData();
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
   * Called after an engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop
   */
  public override updateStepInformation(): void {
    super.updateStepInformation();

    const xOffset = this.stepMatrix.m02();
    const yOffset = this.stepMatrix.m12();

    const size = this.sizeProperty.value;

    this.stepX = xOffset;
    this.stepBottom = yOffset + size.minY;
    this.stepTop = yOffset + size.maxY;

    this.stepMaximumArea = 1.88 * size.width * size.height;
    this.stepMaximumVolume = Duck.getVolume( size );
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

      return this.stepMaximumVolume * ratio;
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
    return Shape.polygon( Duck.getDuckVertices( width, height ) );
  }

  /**
   * Returns vertices for a duck
   */
  public static getDuckVertices( width: number, height: number ): Vector2[] {
    const vertices = this.getFlatGeometry();

    // Scale the vertices to the given width and height
    return vertices.map( vertex => vertex.componentTimes( new Vector2( width, height ) ) );
  }

  /**
   * Returns the volume of a duck with the given axis-aligned bounding box.
   */
  public static getVolume( size: Bounds3 ): number {
    // Hard coded normalized volume obtained from Blender
    return 0.5 * size.width * size.height * size.depth;
  }

  public static DuckIO = new IOType( 'DuckIO', {
    valueType: Duck,
    supertype: Mass.MassIO,
    documentation: 'Represents a duck'
  } );

  public static getFlatGeometry(): Vector2[] {
    return flatDuckData;
  }
}

densityBuoyancyCommon.register( 'Duck', Duck );