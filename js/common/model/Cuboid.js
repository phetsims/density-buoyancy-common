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
        displacedShape: Shape.rect( size.minX, size.minY, size.width, size.height ),
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

      // TODO: link updates if size changes
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

    intersect( ray, isTouch ) {
      let tNear = Number.NEGATIVE_INFINITY;
      let tFar = Number.POSITIVE_INFINITY;

      const size = this.sizeProperty.value;
      const translation = this.matrix.getTranslation().toVector3();

      if ( ray.direction.x > 0 ) {
        tNear = Math.max( tNear, ( size.minX + translation.x - ray.position.x ) / ray.direction.x );
        tFar = Math.min( tFar, ( size.maxX + translation.x - ray.position.x ) / ray.direction.x );
      } else if ( ray.direction.x < 0 ) {
        tNear = Math.max( tNear, ( size.maxX + translation.x - ray.position.x ) / ray.direction.x );
        tFar = Math.min( tFar, ( size.minX + translation.x - ray.position.x ) / ray.direction.x );
      }

      if ( ray.direction.y > 0 ) {
        tNear = Math.max( tNear, ( size.minY + translation.y - ray.position.y ) / ray.direction.y );
        tFar = Math.min( tFar, ( size.maxY + translation.y - ray.position.y ) / ray.direction.y );
      } else if ( ray.direction.y < 0 ) {
        tNear = Math.max( tNear, ( size.maxY + translation.y - ray.position.y ) / ray.direction.y );
        tFar = Math.min( tFar, ( size.minY + translation.y - ray.position.y ) / ray.direction.y );
      }

      if ( ray.direction.z > 0 ) {
        tNear = Math.max( tNear, ( size.minZ + translation.z - ray.position.z ) / ray.direction.z );
        tFar = Math.min( tFar, ( size.maxZ + translation.z - ray.position.z ) / ray.direction.z );
      } else if ( ray.direction.z < 0 ) {
        tNear = Math.max( tNear, ( size.maxZ + translation.z - ray.position.z ) / ray.direction.z );
        tFar = Math.min( tFar, ( size.minZ + translation.z - ray.position.z ) / ray.direction.z );
      }

      return ( tNear >= tFar ) ? null : ( tNear >= 0 ? tNear : ( isFinite( tFar ) && tFar >= 0 ? tFar : null ) );
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
  }

  return densityBuoyancyCommon.register( 'Cuboid', Cuboid );
} );
