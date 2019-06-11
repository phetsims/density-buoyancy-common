// Copyright 2019, University of Colorado Boulder

/**
 * An axis-aligned cuboid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );

  class Cuboid extends Mass {
    /**
     * @param {Engine} engine
     * @param {Bounds3} size
     * @param {Object} config
     */
    constructor( engine, size, config ) {
      config = _.extend( {
        body: engine.createBox( size.width, size.height ),
        shape: Shape.rect( size.minX, size.minY, size.width, size.height ),
        volume: size.width * size.height * size.depth,
        canRotate: false

        // material
      }, config );

      assert && assert( !config.canRotate );

      super( engine, config );

      // @public {Property.<Bounds3>}
      this.sizeProperty = new Property( size );

      // Step information
      this.stepArea = 0;
      this.stepMaximumVolume = 0;
    }

    /**
     * Updates the size of the cuboid.
     * @public
     *
     * @param {Bounds3} size
     */
    updateSize( size ) {
      this.engine.updateBox( this.body, size.width, size.height );
      this.sizeProperty.value = size;
      this.shapeProperty.value = Shape.rect( size.minX, size.minY, size.width, size.height );
      this.volumeProperty.value = size.width * size.height * size.depth;
    }

    updateStepInformation() {
      // TODO: see if we can extend cuboid
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      const xOffset = this.stepMatrix.m02();
      const yOffset = this.stepMatrix.m12();

      this.stepX = xOffset;
      this.stepBottom = yOffset + this.sizeProperty.value.minY;
      this.stepTop = yOffset + this.sizeProperty.value.maxY;

      this.stepArea = this.sizeProperty.value.width * this.sizeProperty.value.depth;
      this.stepMaximumVolume = this.stepArea * this.sizeProperty.value.height;
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
      const size = this.sizeProperty.value;
      const translation = this.matrix.getTranslation().toVector3();

      return Cuboid.rayCuboidIntersection( size, translation, ray );
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
      this.sizeProperty.reset();
      this.updateSize( this.sizeProperty.value );

      super.reset();
    }
    /**
     * Returns a (quick) closest ray intersection with a cuboid (defined by the given Bounds3 and translation).
     * @public
     *
     * @param {Bounds3} bounds
     * @param {Vector3} translation
     * @param {Ray3} ray
     * @returns {number|null}
     */
    static rayCuboidIntersection( bounds, translation, ray ) {
      let tNear = Number.NEGATIVE_INFINITY;
      let tFar = Number.POSITIVE_INFINITY;

      if ( ray.direction.x > 0 ) {
        tNear = Math.max( tNear, ( bounds.minX + translation.x - ray.position.x ) / ray.direction.x );
        tFar = Math.min( tFar, ( bounds.maxX + translation.x - ray.position.x ) / ray.direction.x );
      } else if ( ray.direction.x < 0 ) {
        tNear = Math.max( tNear, ( bounds.maxX + translation.x - ray.position.x ) / ray.direction.x );
        tFar = Math.min( tFar, ( bounds.minX + translation.x - ray.position.x ) / ray.direction.x );
      }

      if ( ray.direction.y > 0 ) {
        tNear = Math.max( tNear, ( bounds.minY + translation.y - ray.position.y ) / ray.direction.y );
        tFar = Math.min( tFar, ( bounds.maxY + translation.y - ray.position.y ) / ray.direction.y );
      } else if ( ray.direction.y < 0 ) {
        tNear = Math.max( tNear, ( bounds.maxY + translation.y - ray.position.y ) / ray.direction.y );
        tFar = Math.min( tFar, ( bounds.minY + translation.y - ray.position.y ) / ray.direction.y );
      }

      if ( ray.direction.z > 0 ) {
        tNear = Math.max( tNear, ( bounds.minZ + translation.z - ray.position.z ) / ray.direction.z );
        tFar = Math.min( tFar, ( bounds.maxZ + translation.z - ray.position.z ) / ray.direction.z );
      } else if ( ray.direction.z < 0 ) {
        tNear = Math.max( tNear, ( bounds.maxZ + translation.z - ray.position.z ) / ray.direction.z );
        tFar = Math.min( tFar, ( bounds.minZ + translation.z - ray.position.z ) / ray.direction.z );
      }

      return ( tNear >= tFar ) ? null : ( tNear >= 0 ? tNear : ( isFinite( tFar ) && tFar >= 0 ? tFar : null ) );
    }
  }

  return densityBuoyancyCommon.register( 'Cuboid', Cuboid );
} );
