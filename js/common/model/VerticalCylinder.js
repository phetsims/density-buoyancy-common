// Copyright 2019, University of Colorado Boulder

/**
 * A cylinder laying on its end (the caps are on the top and bottom)
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

  class VerticalCylinder extends Mass {
    /**
     * @param {Engine} engine
     * @param {number} radius
     * @param {number} height
     * @param {Object} config
     */
    constructor( engine, radius, height, config ) {
      config = _.extend( {
        body: engine.createVerticalCylinder( radius, height ),
        shape: VerticalCylinder.getVerticalCylinderShape( radius, height ),
        volume: Math.PI * radius * radius * height,
        canRotate: false

        // material
      }, config );

      assert && assert( !config.canRotate );

      super( engine, config );

      // @public {Property.<number>}
      this.radiusProperty = new NumberProperty( radius );
      this.heightProperty = new NumberProperty( height );

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
     * @param {number} height
     */
    updateSize( radius, height ) {
      this.engine.updateVerticalCylinder( this.body, radius, height );

      this.radiusProperty.value = radius;
      this.heightProperty.value = height;

      this.shapeProperty.value = VerticalCylinder.getVerticalCylinderShape( radius, height );

      this.volumeProperty.value = Math.PI * radius * radius * height;
    }

    updateStepInformation() {
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

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
      const translation = this.matrix.getTranslation().toVector3();
      const radius = this.radiusProperty.value;
      const height = this.heightProperty.value;
      const relativePosition = ray.position.minusXYZ( translation.x, translation.y, translation.z );

      const xp = 4 / ( radius * radius );
      const zp = 4 / ( radius * radius );

      const a = xp * ray.direction.x * ray.direction.x + zp * ray.direction.z * ray.direction.z;
      const b = 2 * ( xp * relativePosition.x * ray.direction.x + zp * relativePosition.z * ray.direction.z );
      const c = -1 + xp * relativePosition.x * relativePosition.x + zp * relativePosition.z * relativePosition.z;

      const tValues = Util.solveQuadraticRootsReal( a, b, c ).filter( t => {
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
      return Shape.rect( -radius, -height / 2, radius, height / 2 );
    }
  }

  return densityBuoyancyCommon.register( 'VerticalCylinder', VerticalCylinder );
} );
