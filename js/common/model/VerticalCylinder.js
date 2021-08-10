// Copyright 2019-2021, University of Colorado Boulder

/**
 * A cylinder laying on its end (the caps are on the top and bottom)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass from './Mass.js';

class VerticalCylinder extends Mass {
  /**
   * @param {Engine} engine
   * @param {number} radius
   * @param {number} height
   * @param {Object} config
   */
  constructor( engine, radius, height, config ) {
    config = merge( {
      body: engine.createBox( 2 * radius, height ),
      shape: VerticalCylinder.getVerticalCylinderShape( radius, height ),
      volume: VerticalCylinder.getVolume( radius, height ),
      canRotate: false,

      phetioType: VerticalCylinder.VerticalCylinderIO
    }, config );

    assert && assert( !config.canRotate );

    super( engine, config );

    // @public {Property.<number>}
    this.radiusProperty = new NumberProperty( radius );
    this.heightProperty = new NumberProperty( height );

    // @private {number} - Step information
    this.stepRadius = 0;
    this.stepHeight = 0;
    this.stepArea = 0;
    this.stepMaximumVolume = 0;

    this.massOffsetOrientationProperty.value = new Vector2( 0, -1 );

    this.updateSize( radius, height );
  }

  /**
   * Updates the size of the cone.
   * @public
   *
   * @param {number} radius
   * @param {number} height
   */
  updateSize( radius, height ) {
    this.engine.updateBox( this.body, 2 * radius, height );

    this.radiusProperty.value = radius;
    this.heightProperty.value = height;

    this.shapeProperty.value = VerticalCylinder.getVerticalCylinderShape( radius, height );
    this.volumeProperty.value = VerticalCylinder.getVolume( radius, height );

    this.forceOffsetProperty.value = new Vector3( 0, 0, radius );
    this.massOffsetProperty.value = new Vector3( 0, -height / 2, radius );
  }

  /**
   * Returns the radius from a general size scale
   * @public
   * @override
   *
   * @param {number} widthRatio
   * @returns {number}
   */
  static getRadiusFromRatio( widthRatio ) {
    return 0.01 + widthRatio * 0.09;
  }

  /**
   * Returns the height from a general size scale
   * @public
   * @override
   *
   * @param {number} heightRatio
   * @returns {number}
   */
  static getHeightFromRatio( heightRatio ) {
    return 2 * ( 0.01 + heightRatio * 0.09 );
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   * @public
   * @override
   *
   * @param {number} widthRatio
   * @param {number} heightRatio
   */
  setRatios( widthRatio, heightRatio ) {
    this.updateSize(
      VerticalCylinder.getRadiusFromRatio( widthRatio ),
      VerticalCylinder.getHeightFromRatio( heightRatio )
    );
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

    this.stepX = xOffset;
    this.stepBottom = yOffset - this.heightProperty.value / 2;
    this.stepTop = yOffset + this.heightProperty.value / 2;

    this.stepRadius = this.radiusProperty.value;
    this.stepHeight = this.heightProperty.value;
    this.stepArea = Math.PI * this.stepRadius * this.stepRadius;
    this.stepMaximumVolume = this.stepArea * this.heightProperty.value;
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
    return VerticalCylinder.intersect( ray, isTouch, this.matrix.getTranslation().toVector3(), this.radiusProperty.value, this.heightProperty.value );
  }

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   * @public
   * @override
   *
   * Assumes step information was updated.
   *
   * @param {number} liquidLevel
   * @returns {number}
   */
  getDisplacedArea( liquidLevel ) {
    if ( liquidLevel < this.stepBottom || liquidLevel > this.stepTop ) {
      return 0;
    }
    else {
      return this.stepArea;
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
  getDisplacedVolume( liquidLevel ) {
    const bottom = this.stepBottom;
    const top = this.stepTop;

    if ( liquidLevel <= bottom ) {
      return 0;
    }
    else if ( liquidLevel >= top ) {
      return this.stepMaximumVolume;
    }
    else {
      return this.stepMaximumVolume * ( liquidLevel - bottom ) / ( top - bottom );
    }
  }

  /**
   * Resets things to their original values.
   * @public
   */
  reset() {
    this.radiusProperty.reset();
    this.heightProperty.reset();
    this.updateSize( this.radiusProperty.value, this.heightProperty.value );

    super.reset();
  }

  /**
   * Returns a vertical cylinder shape for a given radius/height.
   * @public
   *
   * @param {number} radius
   * @param {number} height
   */
  static getVerticalCylinderShape( radius, height ) {
    return Shape.rect( -radius, -height / 2, 2 * radius, height );
  }

  /**
   * Returns the volume of a vertical cylinder with the given radius and height.
   * @public
   *
   * @param {number} radius
   * @param {number} height
   * @returns {number}
   */
  static getVolume( radius, height ) {
    return Math.PI * radius * radius * height;
  }

  /**
   * If there is an intersection with the ray and the cone, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   * @public
   * @override
   *
   * @param {Ray3} ray
   * @param {boolean} isTouch
   * @param {Vector3} translation
   * @param {number} radius
   * @param {number} height
   * @returns {number|null}
   */
  static intersect( ray, isTouch, translation, radius, height ) {
    const relativePosition = ray.position.minusXYZ( translation.x, translation.y, translation.z );

    const xp = 4 / ( radius * radius );
    const zp = 4 / ( radius * radius );

    const a = xp * ray.direction.x * ray.direction.x + zp * ray.direction.z * ray.direction.z;
    const b = 2 * ( xp * relativePosition.x * ray.direction.x + zp * relativePosition.z * ray.direction.z );
    const c = -1 + xp * relativePosition.x * relativePosition.x + zp * relativePosition.z * relativePosition.z;

    const tValues = Utils.solveQuadraticRootsReal( a, b, c ).filter( t => {
      if ( t <= 0 ) {
        return false;
      }
      const y = ray.pointAtDistance( t ).y;

      return Math.abs( y - translation.y ) <= height / 2;
    } );

    if ( tValues.length ) {
      return tValues[ 0 ];
    }
    else {
      return null;
    }
  }
}

// @public {IOType}
VerticalCylinder.VerticalCylinderIO = new IOType( 'VerticalCylinderIO', {
  valueType: VerticalCylinder,
  supertype: Mass.MassIO,
  documentation: 'Represents a cylinder laying on its end'
} );

densityBuoyancyCommon.register( 'VerticalCylinder', VerticalCylinder );
export default VerticalCylinder;