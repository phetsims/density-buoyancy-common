// Copyright 2024, University of Colorado Boulder

/**
 * A general class for shared functionality between the boat and bottle.
 * TODO: Please add more precise documentation, see https://github.com/phetsims/density-buoyancy-common/issues/257
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Mass, { InstrumentedMassOptions } from '../../../common/model/Mass.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import P2Engine from '../../../common/model/P2Engine.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import Bounds3 from '../../../../../dot/js/Bounds3.js';

export type ApplicationsMassOptions = InstrumentedMassOptions;

export default abstract class ApplicationsMass extends Mass {

  // The default volume of the max displacement for the mass, in m^3
  protected static readonly DEFAULT_DISPLACEMENT_VOLUME = 0.01;

  // The volume of the mass's capacity AND itself. For example the boat is the hull plus how much the boat can hold.
  protected readonly abstract maxVolumeDisplacedProperty: NumberProperty;

  protected readonly massLabelOffsetVector3: Vector3;

  protected constructor( engine: P2Engine, options: ApplicationsMassOptions ) {

    super( engine, options );

    const bounds = this.shapeProperty.value.getBounds();

    // Mass label on the bottom left of the mass, top because the Y is flipped.
    this.massLabelOffsetVector3 = new Vector3( bounds.left, bounds.top, 0 );

    this.massLabelOffsetOrientationProperty.value = new Vector2( 1, -1 / 2 );
    this.massLabelOffsetProperty.value = this.massLabelOffsetVector3;
  }

  /**
   * A box that contains the geometry of the Mass
   */
  protected override getLocalBounds(): Bounds3 {
    const bounds2 = this.shapeProperty.value.bounds;
    return new Bounds3( bounds2.minX, bounds2.minY, -bounds2.minY, bounds2.maxX, bounds2.maxY, bounds2.minY );
  }

  protected abstract evaluatePiecewiseLinearArea( ratio: number ): number;

  protected abstract evaluatePiecewiseLinearVolume( ratio: number ): number;

  /**
   * Returns the displayed area of this object at a given y level
   *
   * Assumes step information was updated.
   *
   * TODO: Why is this different than getDisplacedVolume? Should they share implementation? See https://github.com/phetsims/density-buoyancy-common/issues/123
   */
  public getDisplacedArea( fluidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    // TODO: https://github.com/phetsims/density-buoyancy-common/issues/123 if the fluid level is beyond the top, it probably shouldn't be 0, right?
    if ( fluidLevel < bottom || fluidLevel > top ) {
      return 0;
    }

    const ratio = ( fluidLevel - bottom ) / ( top - bottom );

    return this.evaluatePiecewiseLinearArea( ratio );
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given fluid level.
   *
   * Assumes step information was updated.
   */
  public getDisplacedVolume( fluidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( fluidLevel <= bottom ) {
      return 0;
    }
    else if ( fluidLevel >= top ) {
      return this.maxVolumeDisplacedProperty.value;
    }
    else {
      const ratio = ( fluidLevel - bottom ) / ( top - bottom );

      return this.evaluatePiecewiseLinearVolume( ratio );
    }
  }

  public setRatios( widthRatio: number, heightRatio: number ): void {
    // For boat and bottle this is a no-op
  }

}

densityBuoyancyCommon.register( 'ApplicationsMass', ApplicationsMass );