// Copyright 2019-2024, University of Colorado Boulder

/**
 * A boat (Mass) that can contain some liquid inside.  Boats exist for the lifetime of the sim and do not need to be
 * disposed.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import StrictOmit from '../../../../../phet-core/js/types/StrictOmit.js';
import Utils from '../../../../../dot/js/Utils.js';
import Range from '../../../../../dot/js/Range.js';
import { Shape } from '../../../../../kite/js/imports.js';
import Mass, { MassOptions } from '../../../common/model/Mass.js';
import Material from '../../../common/model/Material.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import BoatBasin from './BoatBasin.js';
import BoatDesign from './BoatDesign.js';
import PhysicsEngine from '../../../common/model/PhysicsEngine.js';
import TProperty from '../../../../../axon/js/TProperty.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import { MassShape } from '../../../common/model/MassShape.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import ApplicationsMass, { ApplicationsMassOptions } from './ApplicationsMass.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import DensityBuoyancyCommonConstants, { toLiters } from '../../../common/DensityBuoyancyCommonConstants.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Pool from '../../../common/model/Pool.js';

export type BoatOptions = StrictOmit<ApplicationsMassOptions, 'body' | 'shape' | 'volume' | 'material' | 'massShape'>;

export default class Boat extends ApplicationsMass {

  // The volume that the boat can hold inside it.
  public readonly fluidMaterialProperty: TProperty<Material>;

  public readonly maxVolumeDisplacedProperty: NumberProperty;

  // The interior that can contain liquid
  public readonly basin: BoatBasin;

  // Amount of volume contained in the basin
  private stepInternalVolume = 0;

  // How to multiply our one-liter boat shape up to the model coordinates, since the boat changes size based on its
  // volume. This is much preferred to trying to redraw the shape to a different size.
  public stepMultiplier = 0;

  // Whether the boat is fully submerged
  public isFullySubmerged = false;

  // In the physics update step, keep track of the boat vertical acceleration and velocity in mks.
  public verticalVelocity = 0;
  public verticalAcceleration = 0;

  public constructor( engine: PhysicsEngine, blockWidthProperty: TReadOnlyProperty<number>, fluidMaterialProperty: TProperty<Material>, providedOptions: BoatOptions ) {

    const boatIntersectionVertices = BoatDesign.getIntersectionVertices( blockWidthProperty.value / 2, toLiters( ApplicationsMass.DEFAULT_DISPLACEMENT_VOLUME ) );
    const volume = BoatDesign.ONE_LITER_HULL_VOLUME * toLiters( ApplicationsMass.DEFAULT_DISPLACEMENT_VOLUME );

    const options = optionize<BoatOptions, EmptySelfOptions, MassOptions>()( {
      body: engine.createFromVertices( boatIntersectionVertices, true ),
      shape: Shape.polygon( boatIntersectionVertices ),
      volume: volume,
      massShape: MassShape.BLOCK,
      material: Material.BOAT_BODY,

      accessibleName: 'Boat'
    }, providedOptions );

    super( engine, options );

    this.maxVolumeDisplacedProperty = new NumberProperty( ApplicationsMass.DEFAULT_DISPLACEMENT_VOLUME, {
      tandem: options.tandem.createTandem( 'maxVolumeDisplacedProperty' ),
      phetioDocumentation: 'The total volume of the boat, including its capacity and hull.',
      range: new Range( 0.005, 0.03 ),
      units: 'm^3'
    } );

    // Update the shape when the block width or displacement changes
    Multilink.multilink( [ blockWidthProperty, this.maxVolumeDisplacedProperty ], ( blockWidth, displacementVolume ) => {
      if ( displacementVolume === 0 ) {
        return;
      }

      const vertices = BoatDesign.getIntersectionVertices( blockWidth / 2, toLiters( displacementVolume ) );
      const volume = BoatDesign.ONE_LITER_HULL_VOLUME * toLiters( displacementVolume );

      engine.updateFromVertices( this.body, vertices, true );

      // This value changes very rarely and only takes 0-1ms to compute (seen on macbook air m1), so it is OK to run it here.
      this.shapeProperty.value = Shape.polygon( vertices );

      // Mass label on the bottom left of the boat, top because the shape is flipped.
      const bounds = this.shapeProperty.value.getBounds();
      this.massLabelOffsetVector3.setXYZ( bounds.left, bounds.top, 0 );

      // Rounding to proactively prevent infinite compounding rounding errors, like https://github.com/phetsims/density-buoyancy-common/issues/192
      this.volumeProperty.value = Utils.roundToInterval( volume, DensityBuoyancyCommonConstants.TOLERANCE );

      this.bodyOffsetProperty.value = Utils.centroidOfPolygon( vertices ).negated();
      this.writeData(); // TODO: why not call transformedEmitter? https://github.com/phetsims/density-buoyancy-common/issues/231
    } );

    this.fluidMaterialProperty = fluidMaterialProperty;

    this.basin = new BoatBasin( this );

    Multilink.multilink( [ this.fluidMaterialProperty, this.basin.fluidVolumeProperty ], ( material, volume ) => {
      this.containedMassProperty.value = material.density * volume;
    } );

    const bounds = this.shapeProperty.value.getBounds();
    this.forceOffsetProperty.value = new Vector2( 0.375 * bounds.left, 0 ).toVector3();
  }

  /**
   * Steps forward in time.
   */
  public override step( dt: number, interpolationRatio: number ): void {
    super.step( dt, interpolationRatio );

    this.basin.fluidYInterpolatedProperty.setRatio( interpolationRatio );
  }

  /**
   * Called after the engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop
   */
  public override updateStepInformation(): void {
    super.updateStepInformation();

    const xOffset = this.stepMatrix.m02();
    const yOffset = this.stepMatrix.m12();

    const displacedVolume = this.maxVolumeDisplacedProperty.value;
    this.stepMultiplier = Math.pow( displacedVolume / 0.001, 1 / 3 );
    this.stepInternalVolume = BoatDesign.ONE_LITER_INTERNAL_VOLUMES[ BoatDesign.ONE_LITER_INTERNAL_VOLUMES.length - 1 ] * this.stepMultiplier * this.stepMultiplier * this.stepMultiplier;

    this.stepX = xOffset;
    this.stepBottom = yOffset + this.stepMultiplier * BoatDesign.ONE_LITER_BOUNDS.minY;
    this.stepTop = yOffset + this.stepMultiplier * BoatDesign.ONE_LITER_BOUNDS.maxY;

    this.basin.stepTop = this.stepTop;
    this.basin.stepBottom = yOffset + this.stepMultiplier * BoatDesign.ONE_LITER_INTERIOR_BOTTOM;

    assert && assert( !isNaN( this.stepTop ), 'stepTop should not be NaN' );
    assert && assert( !isNaN( this.basin.stepTop ), 'basin.stepTop should not be NaN' );
  }

  /**
   * Returns the fraction of the mass that is submerged in a liquid at a given level. From 0 to 1.
   */
  public override updateSubmergedMassFraction( gravityMagnitude: number, fluidDensity: number ): void {
    assert && assert( gravityMagnitude > 0, 'gravityMagnitude should be positive' );

    if ( !this.isFullySubmerged ) {
      const buoyancy = this.buoyancyForceInterpolatedProperty.currentValue;
      const volume = this.volumeProperty.value + this.stepInternalVolume;
      const submergedFraction = 100 * buoyancy.magnitude / ( volume * gravityMagnitude * fluidDensity );
      const range = this.percentSubmergedProperty.range;
      this.percentSubmergedProperty.value = range.constrainValue( submergedFraction );
    }
    else {
      this.percentSubmergedProperty.value = 100;
    }
  }

  protected override evaluatePiecewiseLinearArea( ratio: number ): number {
    return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_DISPLACED_AREAS, ratio ) * this.stepMultiplier * this.stepMultiplier;
  }

  protected override evaluatePiecewiseLinearVolume( ratio: number ): number {
    return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_DISPLACED_VOLUMES, ratio ) * this.stepMultiplier * this.stepMultiplier * this.stepMultiplier;
  }

  /**
   * Returns the internal basin area of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  public getBasinArea( fluidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( fluidLevel <= bottom || fluidLevel >= top ) {
      return 0;
    }
    else {
      const ratio = ( fluidLevel - bottom ) / ( top - bottom );

      return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_INTERNAL_AREAS, ratio ) * this.stepMultiplier * this.stepMultiplier;
    }
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  public getBasinVolume( fluidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( fluidLevel <= bottom ) {
      return 0;
    }
    else if ( fluidLevel >= top ) {
      return this.stepInternalVolume;
    }
    else {
      const ratio = ( fluidLevel - bottom ) / ( top - bottom );

      return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_INTERNAL_VOLUMES, ratio ) * this.stepMultiplier * this.stepMultiplier * this.stepMultiplier;
    }
  }

  /**
   * Checks if the boat is submerged and sets the flag
   */
  public setSubmergedState( fluidLevel: number ): void {

    // TODO: Should we set this value at the beginning of the post physics engine step, see https://github.com/phetsims/density-buoyancy-common/issues/123
    // It currently seems like it is updated partway through (after it is accessed)?
    this.isFullySubmerged = this.stepTop < fluidLevel - DensityBuoyancyCommonConstants.TOLERANCE;
  }

  /**
   * Resets values to their original state
   */
  public override reset(): void {
    this.maxVolumeDisplacedProperty.reset();

    this.basin.reset();
    this.verticalVelocity = 0;
    this.verticalAcceleration = 0;

    super.reset();
  }

  public updateVerticalMotion( pool: Pool, dt: number ): void {
    this.setSubmergedState( pool.fluidYInterpolatedProperty.currentValue );
    const nextBoatVerticalVelocity = this.engine.bodyGetVelocity( this.body ).y;
    this.verticalAcceleration = ( nextBoatVerticalVelocity - this.verticalVelocity ) / dt;
    this.verticalVelocity = nextBoatVerticalVelocity;
  }
}

densityBuoyancyCommon.register( 'Boat', Boat );