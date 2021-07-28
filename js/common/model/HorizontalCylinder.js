// Copyright 2019-2020, University of Colorado Boulder

/**
 * A cylinder laying on its side (the caps are on the left/right)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass from './Mass.js';

class HorizontalCylinder extends Mass {
  /**
   * @param {Engine} engine
   * @param {number} radius
   * @param {number} length
   * @param {Object} config
   */
  constructor( engine, radius, length, config ) {
    config = merge( {
      body: engine.createBox( length, radius * 2 ),
      shape: HorizontalCylinder.getHorizontalCylinderShape( radius, length ),
      volume: HorizontalCylinder.getVolume( radius, length ),
      canRotate: false

      // material
    }, config );

    assert && assert( !config.canRotate );

    super( engine, config );

    // @public {Property.<number>}
    this.radiusProperty = new NumberProperty( radius );
    this.lengthProperty = new NumberProperty( length );

    // @private {number} - Step information
    this.stepRadius = 0;
    this.stepHeight = 0;
    this.stepArea = 0;
    this.stepMaximumVolume = 0;

    this.updateSize( radius, length );
  }

  /**
   * Updates the size of the cone.
   * @public
   *
   * @param {number} radius
   * @param {number} length
   */
  updateSize( radius, length ) {
    this.engine.updateBox( this.body, length, radius * 2 );

    this.radiusProperty.value = radius;
    this.lengthProperty.value = length;

    this.shapeProperty.value = HorizontalCylinder.getHorizontalCylinderShape( radius, length );
    this.volumeProperty.value = HorizontalCylinder.getVolume( radius, length );

    this.forceOffsetProperty.value = new Vector3( 0, 0, radius );
    this.massOffsetProperty.value = new Vector3( 0, -radius * 0.5, radius * 0.7 );
  }

  /**
   * Returns the radius from a general size scale
   * @public
   * @override
   *
   * @param {number} heightRatio
   * @returns {number}
   */
  static getRadiusFromRatio( heightRatio ) {
    return 0.01 + heightRatio * 0.09;
  }

  /**
   * Returns the length from a general size scale
   * @public
   * @override
   *
   * @param {number} widthRatio
   * @returns {number}
   */
  static getLengthFromRatio( widthRatio ) {
    return 2 * ( 0.01 + widthRatio * 0.09 );
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
      HorizontalCylinder.getRadiusFromRatio( heightRatio ),
      HorizontalCylinder.getLengthFromRatio( widthRatio )
    );
  }

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyanct forces,
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
    this.stepBottom = yOffset - this.radiusProperty.value;
    this.stepTop = yOffset + this.radiusProperty.value;

    this.stepRadius = this.radiusProperty.value;
    this.stepHeight = this.lengthProperty.value;
    this.stepMaximumArea = 2 * this.stepRadius * this.lengthProperty.value;
    this.stepMaximumVolume = Math.PI * this.stepRadius * this.stepRadius * this.lengthProperty.value;
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
    const translation = this.matrix.getTranslation().toVector3();
    const radius = this.radiusProperty.value;
    const length = this.lengthProperty.value;
    const relativePosition = ray.position.minusXYZ( translation.x, translation.y, translation.z );

    const yp = 4 / ( radius * radius );
    const zp = 4 / ( radius * radius );

    const a = yp * ray.direction.y * ray.direction.y + zp * ray.direction.z * ray.direction.z;
    const b = 2 * ( yp * relativePosition.y * ray.direction.y + zp * relativePosition.z * ray.direction.z );
    const c = -1 + yp * relativePosition.y * relativePosition.y + zp * relativePosition.z * relativePosition.z;

    const tValues = Utils.solveQuadraticRootsReal( a, b, c ).filter( t => {
      if ( t <= 0 ) {
        return false;
      }
      const x = ray.pointAtDistance( t ).x;

      return Math.abs( x - translation.x ) <= length / 2;
    } );

    if ( tValues.length ) {
      return tValues[ 0 ];
    }
    else {
      return null;
    }
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
      const ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );

      return this.stepMaximumArea * 2 * Math.sqrt( ratio - ratio * ratio );
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
    if ( liquidLevel <= this.stepBottom ) {
      return 0;
    }
    else if ( liquidLevel >= this.stepTop ) {
      return this.stepMaximumVolume;
    }
    else {
      const ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );
      const f = 2 * ratio - 1;

      // Computed with Mathematica
      return this.stepMaximumVolume * ( 2 * Math.sqrt( ratio - ratio * ratio ) * f + Math.acos( -f ) ) / Math.PI;
    }
  }

  /**
   * Resets things to their original values.
   * @public
   */
  reset() {
    this.radiusProperty.reset();
    this.lengthProperty.reset();
    this.updateSize( this.radiusProperty.value, this.lengthProperty.value );

    super.reset();
  }

  /**
   * Returns a horizontal cylinder shape for a given radius/length.
   * @public
   *
   * @param {number} radius
   * @param {number} length
   */
  static getHorizontalCylinderShape( radius, length ) {
    return Shape.rect( -length / 2, -radius, length, 2 * radius );
  }

  /**
   * Returns the volume of a horizontal cylinder with the given radius and length.
   * @public
   *
   * @param {number} radius
   * @param {number} length
   * @returns {number}
   */
  static getVolume( radius, length ) {
    return Math.PI * radius * radius * length;
  }
}

// @public {IOType}
HorizontalCylinder.HorizontalCylinderIO = new IOType( 'HorizontalCylinderIO', {
  valueType: HorizontalCylinder,
  supertype: Mass.MassIO,
  documentation: 'Represents a cylinder laying on its side'
} );

densityBuoyancyCommon.register( 'HorizontalCylinder', HorizontalCylinder );
export default HorizontalCylinder;