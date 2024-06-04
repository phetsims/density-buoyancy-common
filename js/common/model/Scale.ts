// Copyright 2019-2024, University of Colorado Boulder

/**
 * A scale used for measuring mass/weight (depending on the DisplayType)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Mass, { InstrumentedMassOptions } from './Mass.js';
import Material from './Material.js';
import PhysicsEngine from './PhysicsEngine.js';
import Gravity from './Gravity.js';
import TProperty from '../../../../axon/js/TProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { MassShape } from './MassShape.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';

// constants
export const SCALE_WIDTH = 0.15;
export const SCALE_HEIGHT = 0.06;
const SCALE_DEPTH = 0.2;
const SCALE_BASE_HEIGHT = 0.05;
const SCALE_TOP_HEIGHT = SCALE_HEIGHT - SCALE_BASE_HEIGHT;
const SCALE_AREA = SCALE_WIDTH * SCALE_DEPTH;
const SCALE_VOLUME = SCALE_AREA * SCALE_HEIGHT;

const minY = SCALE_HEIGHT / 2;
const minZ = SCALE_WIDTH / 2;
const SCALE_BASE_BOUNDS = new Bounds3(
  -SCALE_WIDTH / 2,
  -minY,
  -minZ,
  SCALE_WIDTH / 2,
  SCALE_BASE_HEIGHT - minY,
  SCALE_DEPTH - minZ
);
const SCALE_FRONT_OFFSET = new Vector3(
  SCALE_BASE_BOUNDS.centerX,
  SCALE_BASE_BOUNDS.centerY,
  SCALE_BASE_BOUNDS.maxZ
);

export class DisplayType extends EnumerationValue {
  public static readonly NEWTONS = new DisplayType();
  public static readonly KILOGRAMS = new DisplayType();

  public static readonly enumeration = new Enumeration( DisplayType, {
    phetioDocumentation: 'Units for the scale readout'
  } );
}

type SelfOptions = {
  displayType?: DisplayType;
};

export type ScaleOptions = SelfOptions & StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'material' | 'massShape'> & PickOptional<InstrumentedMassOptions, 'body' | 'shape'>;

export default class Scale extends Mass {

  // In Newtons.
  public readonly scaleForceInterpolatedProperty: InterpolatedProperty<number>;

  // Just exist for phet-io, see https://github.com/phetsims/density/issues/97
  // TODO: Add a wrapper test for this, https://github.com/phetsims/buoyancy/issues/86
  private readonly scaleMeasuredMassProperty: TReadOnlyProperty<number>;

  public readonly displayType: DisplayType;

  public constructor( engine: PhysicsEngine, gravityProperty: TProperty<Gravity>, providedOptions: ScaleOptions ) {

    const bodyType = providedOptions.canMove === false ? 'STATIC' : 'DYNAMIC';

    const options = optionize<ScaleOptions, SelfOptions, InstrumentedMassOptions>()( {
      body: engine.createBox( SCALE_WIDTH, SCALE_HEIGHT, bodyType ),
      shape: Shape.rect( -SCALE_WIDTH / 2, -SCALE_HEIGHT / 2, SCALE_WIDTH, SCALE_HEIGHT ),
      volume: SCALE_VOLUME,
      massShape: MassShape.BLOCK,

      displayType: DisplayType.NEWTONS,
      material: Material.PLATINUM,

      phetioType: Scale.ScaleIO,

      accessibleName: 'Scale',

      inputEnabledPropertyOptions: {
        phetioReadOnly: true
      },
      materialPropertyOptions: {
        phetioReadOnly: true
      },
      massPropertyOptions: {
        phetioDocumentation: PhetioObject.DEFAULT_OPTIONS.phetioDocumentation
      },
      volumePropertyOptions: {
        phetioDocumentation: PhetioObject.DEFAULT_OPTIONS.phetioDocumentation
      }
    }, providedOptions );

    super( engine, options );

    this.scaleForceInterpolatedProperty = new InterpolatedProperty( 0, {
      interpolate: InterpolatedProperty.interpolateNumber,
      phetioValueType: NumberIO,
      tandem: options.tandem.createTandem( 'scaleForceInterpolatedProperty' ),
      phetioFeatured: true,
      units: 'N',
      phetioReadOnly: true,
      phetioHighFrequency: true
    } );

    this.scaleMeasuredMassProperty = new DerivedProperty( [ this.scaleForceInterpolatedProperty, gravityProperty ], ( force, gravity ) => {
      if ( gravity.value !== 0 ) {
        return force / gravity.value;
      }
      else {
        return 0;
      }
    }, {
      phetioValueType: NumberIO,
      tandem: options.tandem.createTandem( 'scaleMeasuredMassProperty' ),
      phetioFeatured: true,
      units: 'kg',
      phetioReadOnly: true
    } );

    this.displayType = options.displayType;
  }

  protected override getLocalBounds(): Bounds3 {
    const bounds2 = this.shapeProperty.value.bounds;
    return new Bounds3( bounds2.minX, bounds2.minY, -SCALE_DEPTH / 2, bounds2.maxX, bounds2.maxY, SCALE_DEPTH / 2 );
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

    this.stepX = xOffset;
    this.stepBottom = yOffset - SCALE_HEIGHT / 2;
    this.stepTop = yOffset + SCALE_HEIGHT / 2;
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
      return SCALE_AREA;
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
      return SCALE_VOLUME;
    }
    else {
      return SCALE_VOLUME * ( liquidLevel - bottom ) / ( top - bottom );
    }
  }

  public setRatios( widthRatio: number, heightRatio: number ): void {
    assert && assert( false, 'Scale does not support ratios' );
  }

  /**
   * Steps forward in time.
   */
  public override step( dt: number, interpolationRatio: number ): void {
    super.step( dt, interpolationRatio );

    this.scaleForceInterpolatedProperty.setRatio( interpolationRatio );
  }

  private static readonly ScaleIO = new IOType( 'ScaleIO', {
    valueType: Scale,
    supertype: Mass.MassIO,
    documentation: 'Represents scale used for measuring mass/weight'
  } );

  public static readonly SCALE_WIDTH = SCALE_WIDTH;
  public static readonly SCALE_HEIGHT = SCALE_HEIGHT;
  private static readonly SCALE_DEPTH = SCALE_DEPTH;
  private static readonly SCALE_BASE_HEIGHT = SCALE_BASE_HEIGHT;
  public static readonly SCALE_TOP_HEIGHT = SCALE_TOP_HEIGHT;
  private static readonly SCALE_AREA = SCALE_AREA;
  private static readonly SCALE_VOLUME = SCALE_VOLUME;
  public static readonly SCALE_BASE_BOUNDS = SCALE_BASE_BOUNDS;
  public static readonly SCALE_FRONT_OFFSET = SCALE_FRONT_OFFSET;
}

densityBuoyancyCommon.register( 'Scale', Scale );