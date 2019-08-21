// Copyright 2019, University of Colorado Boulder

/**
 * A cylinder laying on its side (the caps are on the left/right)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Complex = require( 'DOT/Complex' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );

  class HorizontalCylinder extends Mass {
    /**
     * @param {Engine} engine
     * @param {number} radius
     * @param {number} length
     * @param {Object} config
     */
    constructor( engine, radius, length, config ) {
      config = _.extend( {
        body: engine.createHorizontalCylinder( radius, length ),
        shape: HorizontalCylinder.getHorizontalCylinderShape( radius, length ),
        volume: Math.PI * radius * radius * length,
        canRotate: false

        // material
      }, config );

      assert && assert( !config.canRotate );

      super( engine, config );

      // @public {Property.<number>}
      this.radiusProperty = new NumberProperty( radius );
      this.lengthProperty = new NumberProperty( length );

      // Step information
      this.stepRadius = 0;
      this.stepHeight = 0;
      this.stepArea = 0;
      this.stepMaximumVolume = 0;

      // TODO: link updates if size changes
    }

    /**
     * Updates the size of the cone.
     * @public
     *
     * @param {number} radius
     * @param {number} length
     */
    updateSize( radius, length ) {
      this.engine.updateHorizontalCylinder( this.body, radius, length );

      this.radiusProperty.value = radius;
      this.lengthProperty.value = length;

      this.shapeProperty.value = HorizontalCylinder.getHorizontalCylinderShape( radius, length );

      this.volumeProperty.value = Math.PI * radius * radius * length;
    }

    updateStepInformation() {
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

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
      const size = this.sizeProperty.value;
      const relativePosition = ray.position.minusXYZ( translation.x, translation.y, translation.z );

      // TODO: remove comments if things work
      // x^2/a^2 + ... = 1
      // ( ray.direction.x * t + relativePosition.x )^2 / a^2 + ... === 1

      const yp = 4 / ( size.height * size.height );
      const zp = 4 / ( size.depth * size.depth );

      const a = yp * ray.direction.y * ray.direction.y + zp * ray.direction.z * ray.direction.z;
      const b = 2 * ( yp * relativePosition.y * ray.direction.y + zp * relativePosition.z * ray.direction.z );
      const c = -1 + yp * relativePosition.y * relativePosition.y + zp * relativePosition.z * relativePosition.z;

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
        const z = new Complex( ratio - 1, 0 ).sqrtOf();
        const arcsinh = Math.log( z.plus( z.times( z ).plus( new Complex( 1, 0 ) ).sqrtOf() ) );

        // Computed with Mathematica
        return this.stepMaximumVolume * ( Math.PI + 2 * Math.sqrt( ratio - ratio * ratio ) * ( 2 * ratio - 1 ) + ( 2 * Math.sqrt( ratio - 1 ) * arcsinh ) / Math.sqrt( 1 - ratio ) ) / Math.PI;
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
      return Shape.rect( -length / 2, -radius, length / 2, radius );
    }
  }

  return densityBuoyancyCommon.register( 'HorizontalCylinder', HorizontalCylinder );
} );
