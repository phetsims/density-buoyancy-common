// Copyright 2019-2020, University of Colorado Boulder

/**
 * An up/down cone
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass from './Mass.js';

class Cone extends Mass {
  /**
   * @param {Engine} engine
   * @param {number} radius
   * @param {number} height
   * @param {boolean} isVertexUp
   * @param {Object} config
   */
  constructor( engine, radius, height, isVertexUp, config ) {

    const initialVertices = Cone.getConeVertices( radius, height, isVertexUp );

    config = merge( {
      body: engine.createFromVertices( initialVertices, false ),
      shape: Shape.polygon( initialVertices ),
      volume: Cone.getVolume( radius, height ),
      canRotate: false

      // material
    }, config );

    assert && assert( !config.canRotate );

    super( engine, config );

    // @public {Property.<number>}
    this.radiusProperty = new NumberProperty( radius );
    this.heightProperty = new NumberProperty( height );

    // @public {boolean}
    this.isVertexUp = isVertexUp;

    // @private {number}
    this.vertexSign = isVertexUp ? 1 : -1;

    // Step information
    this.stepRadius = 0;
    this.stepHeight = 0;
    this.stepArea = 0;
    this.stepMaximumVolume = 0;

    this.updateSize( radius, height );

    // TODO: link updates if size changes
  }

  /**
   * Updates the size of the cone.
   * @public
   *
   * @param {number} radius
   * @param {number} height
   */
  updateSize( radius, height ) {
    const vertices = Cone.getConeVertices( radius, height, this.isVertexUp );

    this.engine.updateFromVertices( this.body, vertices, false );

    this.radiusProperty.value = radius;
    this.heightProperty.value = height;

    this.shapeProperty.value = Shape.polygon( vertices );
    this.volumeProperty.value = Cone.getVolume( radius, height );

    this.forceOffsetProperty.value = new Vector3( 0, 0, 0 );
    this.massOffsetProperty.value = new Vector3( 0, -this.heightProperty.value * ( this.isVertexUp ? 0.1 : 0.6 ), radius * 0.7 );
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
      Cone.getRadiusFromRatio( widthRatio ),
      Cone.getHeightFromRatio( heightRatio )
    );
  }

  updateStepInformation() {
    this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

    const xOffset = this.stepMatrix.m02();
    const yOffset = this.stepMatrix.m12();

    this.stepX = xOffset;
    this.stepBottom = yOffset - this.heightProperty.value * ( this.isVertexUp ? 0.25 : 0.75 );
    this.stepTop = yOffset + this.heightProperty.value * ( this.isVertexUp ? 0.75 : 0.25 );

    this.stepRadius = this.radiusProperty.value;
    this.stepHeight = this.heightProperty.value;
    this.stepArea = Math.PI * this.stepRadius * this.stepRadius;
    this.stepMaximumVolume = this.stepArea * this.heightProperty.value / 3;
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
    const height = this.heightProperty.value;
    const radius = this.radiusProperty.value;

    const tipY = translation.y + this.vertexSign * height * 0.75;
    const baseY = translation.y - this.vertexSign * height * 0.25;
    const cos = radius / height;
    const cosSquared = cos * cos;
    const cosSquaredInverse = 1 / cosSquared;

    const relativePosition = ray.position.minusXYZ( translation.x, tipY, translation.z );

    const a = cosSquaredInverse * ( ray.direction.x * ray.direction.x + ray.direction.z * ray.direction.z ) - ray.direction.y * ray.direction.y;
    const b = cosSquaredInverse * 2 * ( relativePosition.x * ray.direction.x + relativePosition.z * ray.direction.z ) - 2 * relativePosition.y * ray.direction.y;
    const c = cosSquaredInverse * ( relativePosition.x * relativePosition.x + relativePosition.z * relativePosition.z ) - relativePosition.y * relativePosition.y;

    const tValues = Utils.solveQuadraticRootsReal( a, b, c ).filter( t => {
      if ( t <= 0 ) {
        return false;
      }
      const y = ray.pointAtDistance( t ).y;
      if ( this.isVertexUp ) {
        return y < tipY && y > baseY;
      }
      else {
        return y > tipY && y < baseY;
      }
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
      let ratio = ( liquidLevel - this.stepBottom ) / ( this.stepTop - this.stepBottom );
      if ( this.isVertexUp ) {
        ratio = 1 - ratio;
      }
      const radius = this.stepRadius * ratio;
      return Math.PI * radius * radius;
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

      if ( this.isVertexUp ) {
        // a = pi * ( r * ( 1 - t ) )^2 = pi * r^2 * ( 1 - t )^2 = ( pi * r^2 ) - ( pi * r^2 * t^2 )
        // v = pi * r^2 * t - 1/3 pi * r^2 * t^3 = pi * r^2 * ( t - 1/3 t^3 )
        return this.stepArea * this.heightProperty.value * ( ratio * ( 3 + ratio * ( ratio - 3 ) ) ) / 3;
      }
      else {
        // a = pi * (r*t)^2 = pi * r^2 * t^2
        // v = 1/3 pi * r^2 * t^3
        return this.stepArea * this.heightProperty.value * ratio * ratio * ratio / 3;
      }
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
   * Returns an array of vertices for the 2d physics model
   * @public
   *
   * @param {number} radius
   * @param {number} height
   * @param {boolean} isVertexUp
   * @returns {Array.<Vector2>}
   */
  static getConeVertices( radius, height, isVertexUp ) {
    const vertexSign = isVertexUp ? 1 : -1;

    return [
      new Vector2( 0, 0.75 * vertexSign * height ),
      new Vector2( -vertexSign * radius, -0.25 * vertexSign * height ),
      new Vector2( vertexSign * radius, -0.25 * vertexSign * height )
    ];
  }

  /**
   * Returns the volume of a cone with the given radius and height.
   * @public
   *
   * @param {number} radius
   * @param {number} height
   * @returns {number}
   */
  static getVolume( radius, height ) {
    return Math.PI * radius * radius * height / 3;
  }
}

densityBuoyancyCommon.register( 'Cone', Cone );
export default Cone;