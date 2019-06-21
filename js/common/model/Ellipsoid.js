// Copyright 2019, University of Colorado Boulder

/**
 * An adjustable Ellipsoid
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
  const Util = require( 'DOT/Util' );

  class Ellipsoid extends Mass {
    /**
     * @param {Engine} engine
     * @param {Bounds3} size
     * @param {Object} config
     */
    constructor( engine, size, config ) {
      config = _.extend( {
        body: engine.createEllipsoid( size.width, size.height ),
        shape: Ellipsoid.getEllipsoidShape( size.width, size.height ),
        volume: Math.PI * size.width * size.height * size.depth / 6,
        canRotate: false

        // material
      }, config );

      assert && assert( !config.canRotate );

      super( engine, config );

      // @public {Property.<Bounds3>}
      this.sizeProperty = new Property( size );

      // Step information
      this.stepMaximumArea = 0;
      this.stepMaximumVolume = 0;
    }

    /**
     * Updates the size of the ellipsoid.
     * @public
     *
     * @param {Bounds3} size
     */
    updateSize( size ) {
      this.engine.updateEllipsoid( this.body, size.width, size.height );
      this.sizeProperty.value = size;
      this.shapeProperty.value = Ellipsoid.getEllipsoidShape( size.width, size.height );
      this.volumeProperty.value = Math.PI * size.width * size.height * size.depth / 6;
    }

    updateStepInformation() {
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      const xOffset = this.stepMatrix.m02();
      const yOffset = this.stepMatrix.m12();

      this.stepX = xOffset;
      this.stepBottom = yOffset + this.sizeProperty.value.minY;
      this.stepTop = yOffset + this.sizeProperty.value.maxY;

      const a = this.sizeProperty.value.width / 2;
      const b = this.sizeProperty.value.height / 2;
      const c = this.sizeProperty.value.depth / 2;
      this.stepMaximumArea = 4 * Math.PI * a * c; // 4 * pi * a * c
      this.stepMaximumVolume = this.stepMaximumArea * b / 3; // 4/3 * pi * a * b * c
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
      const size = this.sizeProperty.value;
      const relativePosition = ray.position.minusXYZ( translation.x, translation.y, translation.z );

      const xp = 4 / ( size.width * size.width );
      const yp = 4 / ( size.height * size.height );
      const zp = 4 / ( size.depth * size.depth );

      // TODO: remove comments if things work
      // x^2/a^2 + ... = 1
      // ( ray.direction.x * t + relativePosition.x )^2 / a^2 + ... === 1

      const a = xp * ray.direction.x * ray.direction.x + yp * ray.direction.y * ray.direction.y + zp * ray.direction.z * ray.direction.z;
      const b = 2 * ( xp * relativePosition.x * ray.direction.x + yp * relativePosition.y * ray.direction.y + zp * relativePosition.z * ray.direction.z );
      const c = -1 + xp * relativePosition.x * relativePosition.x + yp * relativePosition.y * relativePosition.y + zp * relativePosition.z * relativePosition.z;

      const tValues = Util.solveQuadraticRootsReal( a, b, c ).filter( t => t > 0 );

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

        return this.stepMaximumArea * ( ratio - ratio * ratio ); // 4 * pi * a * c * ( t - t^2 )
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

        return this.stepMaximumVolume * ratio * ratio * ( 3 - 2 * ratio ); // 4/3 * pi * a * b * c * t^2 * ( 3 - 2t )
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
     * Returns an ellipsoid shape
     * @public
     *
     * @param {number} width
     * @param {number} height
     * @returns {Shape}
     */
    static getEllipsoidShape( width, height ) {
      return Shape.ellipse( 0, 0, width / 2, height / 2, 0 );
    }
  }

  return densityBuoyancyCommon.register( 'Ellipsoid', Ellipsoid );
} );
