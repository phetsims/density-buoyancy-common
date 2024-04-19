// Copyright 2019-2024, University of Colorado Boulder

/**
 * A boat (Mass) that can contain some liquid inside.  Boats exist for the lifetime of the sim and do not need to be
 * disposed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import Mass, { MassOptions } from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BoatBasin from './BoatBasin.js';
import BoatDesign from './BoatDesign.js';
import PhysicsEngine from '../../common/model/PhysicsEngine.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import { MassShape } from '../../common/model/MassShape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ApplicationsMass, { ApplicationsMassOptions } from './ApplicationsMass.js';
import Vector2 from '../../../../dot/js/Vector2.js';

export type BoatOptions = StrictOmit<ApplicationsMassOptions, 'body' | 'shape' | 'volume' | 'material' | 'massShape'>;

export default class Boat extends ApplicationsMass {

  // The volume that the boat can hold inside it.
  public readonly liquidMaterialProperty: TProperty<Material>;
  public readonly basin: BoatBasin;

  // Amount of volume contained in the basin
  public stepInternalVolume: number;

  // How to multiply our one-liter boat shape up to the model coordinates, since the boat changes size based on its
  // volume. This is much preferred to trying to redraw the shape to a different size.
  public stepMultiplier: number;

  public constructor( engine: PhysicsEngine, blockWidthProperty: TReadOnlyProperty<number>, liquidMaterialProperty: TProperty<Material>, providedOptions: BoatOptions ) {

    const displacementVolumeProperty = new NumberProperty( 0.01 );

    const boatIntersectionVertices = BoatDesign.getIntersectionVertices( blockWidthProperty.value / 2, displacementVolumeProperty.value * 1000 );
    const volume = BoatDesign.ONE_LITER_HULL_VOLUME * displacementVolumeProperty.value * 1000;

    const options = optionize<BoatOptions, EmptySelfOptions, MassOptions>()( {
      body: engine.createFromVertices( boatIntersectionVertices, true ),
      shape: Shape.polygon( boatIntersectionVertices ),
      volume: volume,
      massShape: MassShape.BLOCK,

      // material
      material: Material.BOAT_BODY
    }, providedOptions );

    super( engine, displacementVolumeProperty, options );

    // Update the shape when the block width or displacement changes
    Multilink.multilink( [ blockWidthProperty, displacementVolumeProperty ], ( blockWidth, displacementVolume ) => {
      if ( displacementVolume === 0 ) {
        return;
      }

      const vertices = BoatDesign.getIntersectionVertices( blockWidth / 2, displacementVolume * 1000 );
      const volume = BoatDesign.ONE_LITER_HULL_VOLUME * displacementVolume * 1000;

      engine.updateFromVertices( this.body, vertices, true );
      this.shapeProperty.value = Shape.polygon( vertices ); // TODO: remove shapeProperty for perf? https://github.com/phetsims/density-buoyancy-common/issues/86

      // Mass label on the bottom left of the boat, top because the shape is flipped.
      const bounds = this.shapeProperty.value.getBounds();
      this.massLabelOffsetVector3.setXYZ( bounds.left, bounds.top, 0 );

      this.volumeLock = true;
      this.volumeProperty.value = volume;
      this.volumeLock = false;

      this.bodyOffsetProperty.value = Utils.centroidOfPolygon( vertices ).negated();
      this.writeData();
    } );

    this.liquidMaterialProperty = liquidMaterialProperty;

    this.basin = new BoatBasin( this );

    this.stepInternalVolume = 0;
    this.stepMultiplier = 0;

    Multilink.multilink( [ this.liquidMaterialProperty, this.basin.liquidVolumeProperty ], ( material, volume ) => {
      this.containedMassProperty.value = material.density * volume;
    } );

    this.stepInternalVolume = 0;
    this.stepMultiplier = 0;

    const intersectionMesh = new THREE.Mesh( BoatDesign.getPrimaryGeometry( 1 ), new THREE.MeshLambertMaterial() );
    this.intersectionGroup.add( intersectionMesh );

    const bounds = this.shapeProperty.value.getBounds();
    this.forceOffsetProperty.value = new Vector2( 0.375 * bounds.left, 0 ).toVector3();
  }

  /**
   * Steps forward in time.
   */
  public override step( dt: number, interpolationRatio: number ): void {
    super.step( dt, interpolationRatio );

    this.basin.liquidYInterpolatedProperty.setRatio( interpolationRatio );
  }

  /**
   * Returns whether this is a boat (as more complicated handling is needed in this case).
   */
  public override isBoat(): boolean {
    return true;
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

    const displacedVolume = this.displacementVolumeProperty.value;
    this.stepMultiplier = Math.pow( displacedVolume / 0.001, 1 / 3 );
    this.stepInternalVolume = BoatDesign.ONE_LITER_INTERNAL_VOLUMES[ BoatDesign.ONE_LITER_INTERNAL_VOLUMES.length - 1 ] * this.stepMultiplier * this.stepMultiplier * this.stepMultiplier;

    this.stepX = xOffset;
    this.stepBottom = yOffset + this.stepMultiplier * BoatDesign.ONE_LITER_BOUNDS.minY;
    this.stepTop = yOffset + this.stepMultiplier * BoatDesign.ONE_LITER_BOUNDS.maxY;

    this.basin.stepTop = this.stepTop;
    this.basin.stepBottom = yOffset + this.stepMultiplier * BoatDesign.ONE_LITER_INTERIOR_BOTTOM;
  }

  /**
   * Returns the fraction of the mass that is submerged in a liquid at a given level. From 0 to 1.
   */
  public override updateSubmergedMassFraction( gravityMagnitude: number, fluidDensity: number ): void {
    assert && assert( gravityMagnitude > 0, 'gravityMagnitude should be positive' );

    const buoyancy = this.buoyancyForceInterpolatedProperty.value;
    const volume = this.volumeProperty.value + this.stepInternalVolume;
    const submergedFraction = buoyancy.magnitude / ( volume * gravityMagnitude * fluidDensity );
    const range = this.submergedMassFractionProperty.range;
    this.submergedMassFractionProperty.value = range.constrainValue( submergedFraction );
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public override intersect( ray: Ray3, isTouch: boolean ): number | null {
    const scale = Math.pow( this.displacementVolumeProperty.value / 0.001, 1 / 3 );
    return super.intersect( ray, isTouch, scale );
  }


  public override evaluatePiecewiseLinearArea( ratio: number ): number {
    return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_DISPLACED_AREAS, ratio ) * this.stepMultiplier * this.stepMultiplier;
  }

  public override evaluatePiecewiseLinearVolume( ratio: number ): number {
    return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_DISPLACED_VOLUMES, ratio ) * this.stepMultiplier * this.stepMultiplier * this.stepMultiplier;
  }

  /**
   * Returns the internal basin area of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  public getBasinArea( liquidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( liquidLevel <= bottom || liquidLevel >= top ) {
      return 0;
    }
    else {
      const ratio = ( liquidLevel - bottom ) / ( top - bottom );

      return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_INTERNAL_AREAS, ratio ) * this.stepMultiplier * this.stepMultiplier;
    }
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  public getBasinVolume( liquidLevel: number ): number {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( liquidLevel <= bottom ) {
      return 0;
    }
    else if ( liquidLevel >= top ) {
      return this.stepInternalVolume;
    }
    else {
      const ratio = ( liquidLevel - bottom ) / ( top - bottom );

      return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_INTERNAL_VOLUMES, ratio ) * this.stepMultiplier * this.stepMultiplier * this.stepMultiplier;
    }
  }

  /**
   * Resets values to their original state
   */
  public override reset(): void {
    this.displacementVolumeProperty.reset();

    this.basin.reset();

    super.reset();
  }

  public static readonly BoatIO = new IOType( 'BoatIO', {
    valueType: Boat,
    supertype: Mass.MassIO,
    documentation: 'Represents a boat'
  } );
}

densityBuoyancyCommon.register( 'Boat', Boat );