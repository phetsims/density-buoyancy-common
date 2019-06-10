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

      const tipY = translation.y + this.vertexSign * 0.75;
      const baseY = translation.y - this.vertexSign * 0.25;
      const cos = this.radiusProperty.value / this.heightProperty.value;
      const cosSquared = cos * cos;
      const cosSquaredInverse = 1 / cosSquared;

      const relativePosition = ray.position.minusXYZ( translation.x, tipY, translation.z );

      const a = cosSquaredInverse * ( ray.direction.x * ray.direction.x + ray.direction.z * ray.direction.z ) - ray.direction.y * ray.direction.y;
      const b = cosSquaredInverse * 2 * ( relativePosition.x * ray.direction.x + relativePosition.z * ray.direction.z ) - relativePosition.y * ray.direction.y;
      const c = cosSquaredInverse * ( relativePosition.x * relativePosition.x + relativePosition.z * relativePosition.z ) - relativePosition.y * relativePosition.y;

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
