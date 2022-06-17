// Copyright 2019-2022, University of Colorado Boulder

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
import Cuboid from './Cuboid.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Mass, { InstrumentedMassOptions } from './Mass.js';
import Material from './Material.js';
import VerticalCylinder from './VerticalCylinder.js';
import PhysicsEngine from './PhysicsEngine.js';
import Gravity from './Gravity.js';
import IProperty from '../../../../axon/js/IProperty.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import Ray3 from '../../../../dot/js/Ray3.js';

// constants
const SCALE_WIDTH = 0.15;
const SCALE_HEIGHT = 0.06;
const SCALE_DEPTH = 0.2;
const SCALE_BASE_HEIGHT = 0.05;
const SCALE_TOP_HEIGHT = SCALE_HEIGHT - SCALE_BASE_HEIGHT;
const SCALE_AREA = SCALE_WIDTH * SCALE_DEPTH;
const SCALE_VOLUME = SCALE_AREA * SCALE_HEIGHT;
const SCALE_BASE_BOUNDS = new Bounds3(
  -SCALE_WIDTH / 2,
  -SCALE_HEIGHT / 2,
  -SCALE_WIDTH / 2,
  SCALE_WIDTH / 2,
  SCALE_BASE_HEIGHT - SCALE_HEIGHT / 2,
  SCALE_DEPTH - SCALE_WIDTH / 2
);
const SCALE_FRONT_OFFSET = new Vector3(
  SCALE_BASE_BOUNDS.centerX,
  SCALE_BASE_BOUNDS.centerY,
  SCALE_BASE_BOUNDS.maxZ
);

export class DisplayType extends EnumerationValue {
  static NEWTONS = new DisplayType();
  static KILOGRAMS = new DisplayType();

  static enumeration = new Enumeration( DisplayType, {
    phetioDocumentation: 'Units for the scale readout'
  } );
}

type SelfOptions = {
  displayType?: DisplayType;
};

export type ScaleOptions = SelfOptions & StrictOmit<InstrumentedMassOptions, 'body' | 'shape' | 'volume' | 'material' | 'phetioType'>;

export default class Scale extends Mass {

  // In Newtons.
  scaleForceInterpolatedProperty: InterpolatedProperty<number>;

  // Just exist for phet-io, see https://github.com/phetsims/density/issues/97
  private scaleMeasuredMassProperty: IReadOnlyProperty<number>;

  readonly displayType: DisplayType;

  constructor( engine: PhysicsEngine, gravityProperty: IProperty<Gravity>, providedOptions: ScaleOptions ) {
    const config = optionize<ScaleOptions, SelfOptions, InstrumentedMassOptions>()( {
      body: engine.createBox( SCALE_WIDTH, SCALE_HEIGHT, providedOptions.canMove === false ),
      shape: Shape.rect( -SCALE_WIDTH / 2, -SCALE_HEIGHT / 2, SCALE_WIDTH, SCALE_HEIGHT ),
      volume: SCALE_VOLUME,

      // {DisplayType}
      displayType: DisplayType.NEWTONS,

      // material
      material: Material.PLATINUM,

      phetioType: Scale.ScaleIO,

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

    // TODO: Ask MK about why the parent options seem to be made optional, this cast shouldn't be needed
    super( engine, config as InstrumentedMassOptions );

    this.scaleForceInterpolatedProperty = new InterpolatedProperty( 0, {
      interpolate: InterpolatedProperty.interpolateNumber,
      phetioType: InterpolatedProperty.InterpolatedPropertyIO( NumberIO ),
      tandem: config.tandem.createTandem( 'scaleForceInterpolatedProperty' ),
      units: 'N',
      phetioReadOnly: true
    } );

    this.scaleMeasuredMassProperty = new DerivedProperty( [ this.scaleForceInterpolatedProperty, gravityProperty ], ( force, gravity ) => {
      if ( gravity.value !== 0 ) {
        return force / gravity.value;
      }
      else {
        return 0;
      }
    }, {
      phetioType: DerivedProperty.DerivedPropertyIO( NumberIO ),
      tandem: config.tandem.createTandem( 'scaleMeasuredMassProperty' ),
      units: 'kg',
      phetioReadOnly: true
    } );

    // (read-only) {DisplayType}
    this.displayType = config.displayType;
  }

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop
   */
  override updateStepInformation(): void {
    super.updateStepInformation();

    const xOffset = this.stepMatrix.m02();
    const yOffset = this.stepMatrix.m12();

    this.stepX = xOffset;
    this.stepBottom = yOffset - SCALE_HEIGHT / 2;
    this.stepTop = yOffset + SCALE_HEIGHT / 2;
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  override intersect( ray: Ray3, isTouch: boolean ): number | null {
    const translation = this.matrix.getTranslation().toVector3();
    const topOffsetTranslation = translation.plusXYZ( 0, SCALE_HEIGHT / 2 - SCALE_TOP_HEIGHT / 2, 0 );

    const baseIntersection = Cuboid.intersect( SCALE_BASE_BOUNDS, translation, ray );
    const topIntersection = VerticalCylinder.intersect( ray, isTouch, topOffsetTranslation, SCALE_WIDTH / 2, SCALE_TOP_HEIGHT );

    return ( baseIntersection && topIntersection ) ? Math.min( baseIntersection, topIntersection ) : ( baseIntersection || topIntersection );
  }

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   *
   * Assumes step information was updated.
   */
  getDisplacedArea( liquidLevel: number ): number {
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
  getDisplacedVolume( liquidLevel: number ): number {
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

  setRatios( widthRatio: number, heightRatio: number ): void {
    // See subclass for implementation
  }

  /**
   * Steps forward in time.
   */
  override step( dt: number, interpolationRatio: number ): void {
    super.step( dt, interpolationRatio );

    this.scaleForceInterpolatedProperty.setRatio( interpolationRatio );
  }

  static ScaleIO: IOType;

  static SCALE_WIDTH: number;
  static SCALE_HEIGHT: number;
  static SCALE_DEPTH: number;
  static SCALE_BASE_HEIGHT: number;
  static SCALE_TOP_HEIGHT: number;
  static SCALE_AREA: number;
  static SCALE_VOLUME: number;
  static SCALE_BASE_BOUNDS: Bounds3;
  static SCALE_FRONT_OFFSET: Vector3;
}

Scale.SCALE_WIDTH = SCALE_WIDTH;
Scale.SCALE_HEIGHT = SCALE_HEIGHT;
Scale.SCALE_DEPTH = SCALE_DEPTH;
Scale.SCALE_BASE_HEIGHT = SCALE_BASE_HEIGHT;
Scale.SCALE_TOP_HEIGHT = SCALE_TOP_HEIGHT;
Scale.SCALE_AREA = SCALE_AREA;
Scale.SCALE_VOLUME = SCALE_VOLUME;
Scale.SCALE_BASE_BOUNDS = SCALE_BASE_BOUNDS;
Scale.SCALE_FRONT_OFFSET = SCALE_FRONT_OFFSET;

Scale.ScaleIO = new IOType( 'ScaleIO', {
  valueType: Scale,
  supertype: Mass.MassIO,
  documentation: 'Represents scale used for measuring mass/weight'
} );

densityBuoyancyCommon.register( 'Scale', Scale );
