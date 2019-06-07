// Copyright 2019, University of Colorado Boulder

/**
 * An up/down cone
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );
  // const Vector3 = require( 'DOT/Vector3' );

  class Cone extends Mass {
    /**
     * @param {Engine} engine
     * @param {number} radius
     * @param {number} height
     * @param {boolean} isVertexUp
     * @param {Object} config
     */
    constructor( engine, radius, height, isVertexUp, config ) {
      const vertexSign = isVertexUp ? 1 : -1;
      const shape = Shape.polygon( [
        new Vector2( 0, 0.75 * vertexSign * height ),
        new Vector2( radius, -0.25 * vertexSign * height ),
        new Vector2( -radius, -0.25 * vertexSign * height )
      ] );

      config = _.extend( {
        body: engine.createCone( radius, height, isVertexUp ),
        shape: shape,
        displacedShape: shape,
        volume: Math.PI * radius * radius * height / 3,
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
      this.vertexSign = vertexSign;

      // Step information
      this.stepRadius = 0;
      this.stepHeight = 0;
      this.stepArea = 0;
      this.stepMaximumVolume = 0;

      // TODO: link updates if size changes
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

    intersect( ray, isTouch ) {
/*



  normalize( ray.relativePosition + t * ray.direction ).y = cos


  ( relativePosition.y + t * ray.direction.y ) / sqrt(
    ( relativePosition.x + t * ray.direction.x )^2 +
    ( relativePosition.y + t * ray.direction.y )^2 +
    ( relativePosition.y + t * ray.direction.z )^2
  ) === cos

  ( relativePosition.y + t * ray.direction.y )^2 / (
    ( relativePosition.x + t * ray.direction.x )^2 +
    ( relativePosition.y + t * ray.direction.y )^2 +
    ( relativePosition.y + t * ray.direction.z )^2
  ) === cos^2

  ( relativePosition.y + t * ray.direction.y )^2 === cos^2 * (
    ( relativePosition.x + t * ray.direction.x )^2 +
    ( relativePosition.y + t * ray.direction.y )^2 +
    ( relativePosition.y + t * ray.direction.z )^2
  )

  0 === cos^2 * (
    ( relativePosition.x + t * ray.direction.x )^2 +
    ( relativePosition.y + t * ray.direction.y )^2 +
    ( relativePosition.y + t * ray.direction.z )^2
  ) - ( relativePosition.y + t * ray.direction.y )^2

  0 === cos^2 * (
    relativePosition.x^2 + relativePosition.x * ray.direction.x * t + ray.direction.x^2 * t^2 +
    relativePosition.y^2 + relativePosition.y * ray.direction.y * t + ray.direction.y^2 * t^2 +
    relativePosition.z^2 + relativePosition.z * ray.direction.z * t + ray.direction.z^2 * t^2 +
  ) - ( relativePosition.y^2 + relativePosition.y * ray.direction.y * t + ray.direction.y^2 * t^2 )

  0 === cos^2 * (
    relativePosition.x^2 + relativePosition.y^2 + relativePosition.z^2
    t * ( relativePosition.x * ray.direction.x + relativePosition.y * ray.direction.y + relativePosition.z * ray.direction.z )
    t^2 * ( ray.direction.x^2 + ray.direction.y^2 + ray.direction.z^2 )
  ) - ( relativePosition.y^2 + relativePosition.y * ray.direction.y * t + ray.direction.y^2 * t^2 )

  cos^2 ( relativePosition.x^2 + relativePosition.y^2 + relativePosition.z^2 ) - relativePosition.y^2
  cos^2 ( relativePosition.x * ray.direction.x + relativePosition.y * ray.direction.y + relativePosition.z * ray.direction.z ) - relativePosition.y * ray.direction.y
  cos^2 ( ray.direction.x^2 + ray.direction.y^2 + ray.direction.z^2 ) - ray.direction.y^2

  0 === cos^2 * (
    relativePosition.x^2 + relativePosition.y^2 + relativePosition.z^2
    t * ( relativePosition.x * ray.direction.x + relativePosition.y * ray.direction.y + relativePosition.z * ray.direction.z )
    t^2 * ( ray.direction.x^2 + ray.direction.y^2 + ray.direction.z^2 )
  ) - ( relativePosition.y^2 + relativePosition.y * ray.direction.y * t + ray.direction.y^2 * t^2 )
*/



/*
      // normalized( ray.relativePosition + t * ray.direction ).y = cos

      ( ray.relativePosition.y + t * ray.direction.y ) / Math.sqrt(
        ( ray.relativePosition.x + t * ray.direction.x ) ^ 2
        ( ray.relativePosition.y + t * ray.direction.y ) ^ 2
        ( ray.relativePosition.y + t * ray.direction.z ) ^ 2
      ) === cos

      0 === cos^2 * (
        ( ray.relativePosition.x + t * ray.direction.x ) ^ 2
        ( ray.relativePosition.y + t * ray.direction.y ) ^ 2
        ( ray.relativePosition.y + t * ray.direction.z ) ^ 2
      ) - ( ray.relativePosition.y + t * ray.direction.y )^2

      (rp + t * dir)^2 =
      cos^2( rp^2 + rp * t * dir + t^2 * dir^2 )    -     rp.y^2 + rp.y * t * dir.y + t^2 * dir^2

      cosSquared




ax^2 + by^2 + cz^2 + d === 0


a * ( rp.x + t * rd.x )^2 + b * ( rp.y + t * rd.y )^2 + c * ( rp.z + t * rd.z )^2 + d === 0



t^2: a * rd.x * rd.x + b * rd.y * rd.y + c * rd.z * rd.z
t  : a * rp.x * rd.x + b * rp.y * rd.y + c * rp.z * rd.z
   : a * rp.x * rp.x + b * rp.y * rp.y + c * rp.z * rp.z + d

*/

      const translation = this.matrix.getTranslation().toVector3();

      const tipY = translation.y + this.vertexSign * 0.75;
      const baseY = translation.y - this.vertexSign * 0.25;
      const cos = this.radiusProperty.value / this.heightProperty.value;
      const cosSquared = cos * cos;

      const relativePosition = ray.position.minusXYZ( translation.x, tipY, translation.z );

// console.log( `tip: ${translation.x}, ${translation.y + tipY}, )
      // const a = ray.direction.x * ray.direction.x - ( 1 / cosSquared ) * ray.direction.y * ray.direction.y + ray.direction.z * ray.direction.z;
      // const b = relativePosition.x * ray.direction.x - ( 1 / cosSquared ) * relativePosition.y * ray.direction.y + relativePosition.z * ray.direction.z;
      // const c = relativePosition.x * relativePosition.x - ( 1 / cosSquared ) * relativePosition.y * relativePosition.y + relativePosition.z * relativePosition.z;

      const a = cosSquared - ray.direction.y * ray.direction.y;
      const b = cosSquared * relativePosition.dot( ray.direction ) - relativePosition.y * ray.direction.y;
      const c = cosSquared * relativePosition.dot( relativePosition ) - relativePosition.y * relativePosition.y;
  //cosSquared * ( Math.pow(relativePosition.x,2) + Math.pow(relativePosition.y,2) + Math.pow(relativePosition.z,2) ) - Math.pow(relativePosition.y,2)
  //cosSquared * ( relativePosition.x * ray.direction.x + relativePosition.y * ray.direction.y + relativePosition.z * ray.direction.z ) - relativePosition.y * ray.direction.y
  //cosSquared * ( Math.pow(ray.direction.x,2) + Math.pow(ray.direction.y,2) + Math.pow(ray.direction.z,2) ) - Math.pow(ray.direction.y,2)

      // const coneDirection = new Vector3( 0, -this.vertexSign, 0 );

      // const dv = ray.direction.dot( coneDirection );
      // const cov = relativePosition.dot( coneDirection );
      // const coco = relativePosition.dot( relativePosition );
      // const dco = ray.direction.dot( relativePosition );

      // const a = dv * dv - cosSquared;
      // const b = 2 * ( dv * cov - dco * cosSquared );
      // const c = cov * cov - coco * cosSquared;

      const tValues = Util.solveQuadraticRootsReal( a, b, c ).filter( t => {
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
          return this.stepArea * ( ratio - ratio * ratio * ratio / 3 );
        }
        else {
          // a = pi * (r*t)^2 = pi * r^2 * t^2
          // v = 1/3 pi * r^2 * t^3
          return this.stepArea * ratio * ratio * ratio / 3;
        }
      }
    }
  }

  return densityBuoyancyCommon.register( 'Cone', Cone );
} );
