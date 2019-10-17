// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds3 = require( 'DOT/Bounds3' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const InterpolatedProperty = require( 'DENSITY_BUOYANCY_COMMON/common/model/InterpolatedProperty' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
  const merge = require( 'PHET_CORE/merge' );
  const Shape = require( 'KITE/Shape' );
  const Vector3 = require( 'DOT/Vector3' );
  const VerticalCylinder = require( 'DENSITY_BUOYANCY_COMMON/common/model/VerticalCylinder' );

  const SCALE_WIDTH = 0.15;
  const SCALE_HEIGHT = 0.06;
  const SCALE_DEPTH = 0.2;
  const SCALE_BASE_HEIGHT = 0.05;
  const SCALE_TOP_HEIGHT = SCALE_HEIGHT - SCALE_BASE_HEIGHT;
  const SCALE_AREA = SCALE_WIDTH * SCALE_DEPTH;
  const SCALE_VOLUME = SCALE_AREA * SCALE_HEIGHT;
  const SCALE_BASE_BOUNDS = new Bounds3(
    -SCALE_WIDTH / 2,
    -SCALE_HEIGHT / 2,
    -SCALE_WIDTH / 2,
    SCALE_WIDTH / 2,
    SCALE_BASE_HEIGHT - SCALE_HEIGHT / 2,
    SCALE_DEPTH - SCALE_WIDTH / 2
  );
  const SCALE_FRONT_OFFSET = new Vector3(
    SCALE_BASE_BOUNDS.centerX,
    SCALE_BASE_BOUNDS.centerY,
    SCALE_BASE_BOUNDS.maxZ
  );

  class Scale extends Mass {
    /**
     * @param {Engine} engine
     * @param {Object} config
     */
    constructor( engine, config ) {
      config = merge( {
        body: engine.createBox( SCALE_WIDTH, SCALE_HEIGHT ),
        shape: Shape.rect( -SCALE_WIDTH / 2, -SCALE_HEIGHT / 2, SCALE_WIDTH, SCALE_HEIGHT ),
        volume: SCALE_VOLUME,
        canRotate: false

        // material
      }, config );

      super( engine, config );

      // @public {Property.<number>} - In Newtons.
      this.scaleForceProperty = new InterpolatedProperty( 0, {
        interpolate: InterpolatedProperty.interpolateNumber
      } );
    }

    updateStepInformation() {
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      const xOffset = this.stepMatrix.m02();
      const yOffset = this.stepMatrix.m12();

      this.stepX = xOffset;
      this.stepBottom = yOffset - SCALE_HEIGHT / 2;
      this.stepTop = yOffset + SCALE_HEIGHT / 2;
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
      const topOffsetTranslation = translation.plusXYZ( SCALE_HEIGHT / 2 - SCALE_TOP_HEIGHT / 2 );

      const baseIntersection = Cuboid.intersect( SCALE_BASE_BOUNDS, translation, ray );
      const topIntersection = VerticalCylinder.intersect( ray, isTouch, topOffsetTranslation, SCALE_WIDTH / 2, SCALE_TOP_HEIGHT );

      return ( baseIntersection && topIntersection ) ? Math.min( baseIntersection, topIntersection ) : ( baseIntersection || topIntersection );
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
        return SCALE_AREA;
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
        return SCALE_VOLUME;
      }
      else {
        return SCALE_VOLUME * ( liquidLevel - bottom ) / ( top - bottom );
      }
    }

    /**
     * Steps forward in time.
     * @public
     *
     * @param {number} dt
     * @param {number} interpolationRatio
     */
    step( dt, interpolationRatio ) {
      super.step( dt, interpolationRatio );

      this.scaleForceProperty.setRatio( interpolationRatio );
    }

    /**
     * Resets things to their original values.
     * @public
     */
    reset() {
      super.reset();
    }
  }

  // @public {number}
  Scale.SCALE_WIDTH = SCALE_WIDTH;
  Scale.SCALE_HEIGHT = SCALE_HEIGHT;
  Scale.SCALE_DEPTH = SCALE_DEPTH;
  Scale.SCALE_BASE_HEIGHT = SCALE_BASE_HEIGHT;
  Scale.SCALE_TOP_HEIGHT = SCALE_TOP_HEIGHT;
  Scale.SCALE_AREA = SCALE_AREA;
  Scale.SCALE_VOLUME = SCALE_VOLUME;

  // @public {Bounds3}
  Scale.SCALE_BASE_BOUNDS = SCALE_BASE_BOUNDS;

  // @public {Vector3}
  Scale.SCALE_FRONT_OFFSET = SCALE_FRONT_OFFSET;

  return densityBuoyancyCommon.register( 'Scale', Scale );
} );
