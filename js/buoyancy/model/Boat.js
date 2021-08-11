// Copyright 2019-2021, University of Colorado Boulder

/**
 * A boat (Mass) that can contain some liquid inside.  Boats exist for the lifetime of the sim and do not need to be
 * disposed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import merge from '../../../../phet-core/js/merge.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BoatBasin from './BoatBasin.js';
import BoatDesign from './BoatDesign.js';

class Boat extends Mass {
  /**
   * @param {Engine} engine
   * @param {Property.<number>} blockWidthProperty
   * @param {Property.<Material>} liquidMaterialProperty
   * @param {Object} config
   */
  constructor( engine, blockWidthProperty, liquidMaterialProperty, config ) {

    const displacementVolumeProperty = new NumberProperty( 0.005 );

    const boatIntersectionVertices = BoatDesign.getIntersectionVertices( blockWidthProperty.value / 2, displacementVolumeProperty.value * 1000 );
    const volume = BoatDesign.ONE_LITER_HULL_VOLUME * displacementVolumeProperty.value * 1000;

    config = merge( {
      body: engine.createFromVertices( boatIntersectionVertices, true ),
      shape: Shape.polygon( boatIntersectionVertices ),
      volume: volume,

      // material
      material: Material.ALUMINUM
    }, config );

    assert && assert( !config.canRotate );

    super( engine, config );

    // Update the shape when the block width or displacement changes
    Property.multilink( [ blockWidthProperty, displacementVolumeProperty ], ( blockWidth, displacementVolume ) => {
      if ( displacementVolume === 0 ) {
        return;
      }

      const vertices = BoatDesign.getIntersectionVertices( blockWidth / 2, displacementVolume * 1000 );
      const volume = BoatDesign.ONE_LITER_HULL_VOLUME * displacementVolume * 1000;

      engine.updateFromVertices( this.body, vertices, true );
      this.shapeProperty.value = Shape.polygon( vertices ); // TODO: remove shapeProperty for perf?
      this.volumeProperty.value = volume;

      this.bodyOffsetProperty.value = Utils.centroidOfPolygon( vertices ).negated();
      this.writeData();
    } );

    // @public {Property.<number>}
    this.displacementVolumeProperty = displacementVolumeProperty;

    // @public {Property.<Material>}
    this.liquidMaterialProperty = liquidMaterialProperty;

    // @public {Basin}
    this.basin = new BoatBasin( this );

    Property.multilink( [ this.liquidMaterialProperty, this.basin.liquidVolumeProperty ], ( material, volume ) => {
      this.containedMassProperty.value = material.density * volume;
    } );

    // @private {number} - Amount of volume contained in the basin
    this.stepInternalVolume = 0;

    // @private {number} - How to multiply our one-liter size up to the model coordinates
    this.stepMultiplier = 0;

    // @public {THREE.Group}
    this.intersectionGroup = new THREE.Group();
    const intersectionMesh = new THREE.Mesh( BoatDesign.getPrimaryGeometry( 1 ), new THREE.MeshLambertMaterial() );
    this.intersectionGroup.add( intersectionMesh );
  }

  /**
   * Steps forward in time.
   * @public
   * @override
   *
   * @param {number} dt
   * @param {number} interpolationRatio
   */
  step( dt, interpolationRatio ) {
    super.step( dt, interpolationRatio );

    this.basin.liquidYInterpolatedProperty.setRatio( interpolationRatio );
  }

  /**
   * Returns whether this is a boat (as more complicated handling is needed in this case).
   * @public
   * @override
   *
   * @returns {boolean}
   */
  isBoat() {
    return true;
  }

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   * @public
   * @override
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop
   */
  updateStepInformation() {
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
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   * @public
   * @override
   *
   * @param {Ray3} ray
   * @param {boolean} isTouch
   * @returns {number|null}
   */
  intersect( ray, isTouch ) {
    const scale = Math.pow( this.displacementVolumeProperty.value / 0.001, 1 / 3 );
    // TODO: somewhat borrowed with Bottle, let's combine
    const translation = this.matrix.translation;
    const adjustedPosition = ray.position.minusXYZ( translation.x, translation.y, 0 ).dividedScalar( scale );

    const raycaster = new THREE.Raycaster( ThreeUtils.vectorToThree( adjustedPosition ), ThreeUtils.vectorToThree( ray.direction ) );
    const intersections = [];
    raycaster.intersectObject( this.intersectionGroup, true, intersections );

    return intersections.length ? intersections[ 0 ].distance * scale : null;
  }

  /**
   * Returns the displayed area of this object at a given y level
   * @public
   * @override
   *
   * Assumes step information was updated.
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getDisplacedArea( liquidLevel ) {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( liquidLevel < bottom || liquidLevel > top ) {
      return 0;
    }

    const ratio = ( liquidLevel - bottom ) / ( top - bottom );

    return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_DISPLACED_AREAS, ratio ) * this.stepMultiplier * this.stepMultiplier;
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
   * @public
   * @override
   *
   * Assumes step information was updated.
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getDisplacedVolume( liquidLevel ) {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( liquidLevel <= bottom ) {
      return 0;
    }
    else if ( liquidLevel >= top ) {
      return this.displacementVolumeProperty.value;
    }
    else {
      const ratio = ( liquidLevel - bottom ) / ( top - bottom );

      return Mass.evaluatePiecewiseLinear( BoatDesign.ONE_LITER_DISPLACED_VOLUMES, ratio ) * this.stepMultiplier * this.stepMultiplier * this.stepMultiplier;
    }
  }

  /**
   * Returns the internal basin area of this object up to a given y level, assuming a y value for the given liquid level.
   * @public
   *
   * Assumes step information was updated.
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getBasinArea( liquidLevel ) {
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
   * @public
   * @override
   *
   * Assumes step information was updated.
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getBasinVolume( liquidLevel ) {
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
   * @public
   */
  reset() {
    this.displacementVolumeProperty.reset();

    this.basin.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'Boat', Boat );
export default Boat;