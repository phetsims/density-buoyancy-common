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
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import Mass, { InstrumentedMassOptions, MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION } from '../../../common/model/Mass.js';
import PhysicsEngine from '../../../common/model/PhysicsEngine.js';
import { MassShape } from '../../../common/model/MassShape.js';
import { flatDuckData } from './DuckData.js';
import DensityBuoyancyCommonConstants from '../../../common/DensityBuoyancyCommonConstants.js';

export type DuckOptions = StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'massShape'>;

export default class Duck extends Mass {

  public readonly sizeProperty: Property<Bounds3>;

  // Step information
  private stepMaximumArea: number;
  private stepMaximumVolume: number;

  public constructor( engine: PhysicsEngine, size: Bounds3, providedConfig: DuckOptions ) {

    const options = optionize<DuckOptions, EmptySelfOptions, InstrumentedMassOptions>()( {
      body: engine.createFromVertices( Duck.getDuckVertices( size.width, size.height ), false ),
      shape: Duck.getDuckShape( size.width, size.height ),
      volume: Duck.getVolume( size ),
      massShape: MassShape.DUCK
    }, providedConfig );

    assert && assert( !options.canRotate );

    super( engine, options as InstrumentedMassOptions );

    this.sizeProperty = new Property( size, {
      valueType: Bounds3,
      tandem: options.tandem.createTandem( 'sizeProperty' ),
      phetioDocumentation: 'For internal use only.',
      phetioValueType: Bounds3.Bounds3IO
    } );

    this.stepMaximumArea = 0;
    this.stepMaximumVolume = 0;

    this.updateSize( size );
  }

  protected override getLocalBounds(): Bounds3 {
    return this.sizeProperty.value;
  }

  /**
   * Updates the size of the duck.
   */
  private updateSize( size: Bounds3 ): void {
    const vertices = Duck.getDuckVertices( size.width, size.height );
    this.engine.updateFromVertices( this.body, vertices, true );
    this.sizeProperty.value = size;
    this.shapeProperty.value = Duck.getDuckShape( size.width, size.height );

    this.volumeProperty.value = Duck.getVolume( size );

    this.forceOffsetProperty.value = new Vector3( 0, 0, size.maxZ );
    this.massLabelOffsetProperty.value = new Vector3( 0, size.minY * 0.5, size.maxZ * 0.7 );

    // Keep the body centered, see https://github.com/phetsims/buoyancy/issues/148
    this.bodyOffsetProperty.value = Utils.centroidOfPolygon( vertices ).negated();
    this.writeData(); // TODO: why not call transformedEmitter? https://github.com/phetsims/density-buoyancy-common/issues/231
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

    // Duck is internally modelled as an ellipsoid for the volume and area displacement.
    const a = this.sizeProperty.value.width / 2;
    const b = this.sizeProperty.value.height / 2;
    const c = this.sizeProperty.value.depth / 2;
    this.stepMaximumArea = 4 * Math.PI * a * c; // 4 * pi * a * c
    this.stepMaximumVolume = this.stepMaximumArea * b / 3; // 4/3 * pi * a * b * c
  }

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedArea( fluidLevel: number ): number {
    if ( fluidLevel < this.stepBottom || fluidLevel > this.stepTop ) {
      return 0;
    }
    else {
      const ratio = ( fluidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );

      // Duck is internally modelled as an ellipsoid for the volume and area displacement.
      return this.stepMaximumArea * ( ratio - ratio * ratio ); // 4 * pi * a * c * ( t - t^2 )
    }
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given fluid level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedVolume( fluidLevel: number ): number {
    if ( fluidLevel <= this.stepBottom ) {
      return 0;
    }
    else if ( fluidLevel >= this.stepTop ) {
      return this.stepMaximumVolume;
    }
    else {
      const ratio = ( fluidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );

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
  private static getDuckShape( width: number, height: number ): Shape {
    return Shape.polygon( Duck.getDuckVertices( width, height ) );
  }

  /**
   * Returns vertices for a duck
   */
  private static getDuckVertices( width: number, height: number ): Vector2[] {
    const vertices = this.getFlatGeometry();

    // Scale the vertices to the given width and height
    return vertices.map( vertex => vertex.componentTimes( new Vector2( width, height ) ) );
  }

  /**
   * Returns the volume of a duck with the given axis-aligned bounding box.
   */
  private static getVolume( size: Bounds3 ): number {

    // Duck is internally modelled as an ellipsoid for the volume and area displacement.
    const value = Math.PI * size.width * size.height * size.depth / 6;

    // Rounding to proactively prevent infinite compounding rounding errors, like https://github.com/phetsims/density-buoyancy-common/issues/192
    return Utils.roundToInterval( value, DensityBuoyancyCommonConstants.TOLERANCE );
  }

  private static getFlatGeometry(): Vector2[] {
    return flatDuckData;
  }
}

densityBuoyancyCommon.register( 'Duck', Duck );