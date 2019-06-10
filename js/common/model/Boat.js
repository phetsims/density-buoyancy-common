// Copyright 2019, University of Colorado Boulder

/**
 * An axis-aligned boat with essentially a cut-out interior that can fill with the liquid.
 *
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
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  class Boat extends Mass {
    /**
     * @param {Engine} engine
     * @param {Bounds3} size
     * @param {number} thickness
     * @param {Object} config
     */
    constructor( engine, size, thickness, config ) {

      // TODO: Boat needs to be dynamic (or at least theoretically possible)

      // TODO: can we just extend Cuboid?

      let interiorSize = new Bounds3(
        size.minX + thickness,
        size.minY + thickness,
        size.minZ + thickness,
        size.maxX - thickness,
        size.maxY,
        size.maxZ - thickness
      );

      const fullVolume = size.width * size.height * size.depth;
      const interiorVolume = interiorSize.width * interiorSize.height * interiorSize.depth;
      const volume = fullVolume - interiorVolume;

      const fullArea = size.width * size.height;
      const interiorArea = interiorSize.width * interiorSize.height;
      const area = fullArea - interiorArea;

      const centroid = size.center.times( fullArea ).minus( interiorSize.center.times( interiorArea ) ).dividedScalar( area );

      size = size.shifted( -centroid.x, -centroid.y, -centroid.z );
      interiorSize = interiorSize.shifted( -centroid.x, -centroid.y, -centroid.z );

      const boatVertices = [
        new Vector2( size.minX, size.minY ),
        new Vector2( size.maxX, size.minY ),
        new Vector2( size.maxX, size.maxY ),
        new Vector2( interiorSize.maxX, interiorSize.maxY ),
        new Vector2( interiorSize.maxX, interiorSize.minY ),
        new Vector2( interiorSize.minX, interiorSize.minY ),
        new Vector2( interiorSize.minX, interiorSize.maxY ),
        new Vector2( size.minX, size.maxY )
      ];

      config = _.extend( {
        body: engine.createBoat( boatVertices ),
        shape: Shape.polygon( boatVertices ),
        displacedShape: Shape.rect( size.minX, size.minY, size.width, size.height ),
        volume: volume,
        canRotate: false

        // material
      }, config );

      assert && assert( !config.canRotate );

      super( engine, config );

      // @public {number}
      this.thickness = thickness;

      // @public {Property.<Bounds3>}
      this.sizeProperty = new Property( size );

      // @public {Property.<Bounds3>}
      this.interiorSizeProperty = new Property( interiorSize );

      // @public {Property.<number>}
      this.liquidVolumeProperty = new NumberProperty( 0 );

      // @public {Property.<number>} - The y coordinate of the main liquid level in the boat (relative to interiorSize.minY)
      this.liquidYProperty = new InterpolatedProperty( 0, {
        interpolate: InterpolatedProperty.interpolateNumber
      } );

      // @private {Array.<Bounds3>} - Used for intersection (and they overlap for ease)
      this.intersectionBoundsArray = [
        // Bottom
        new Bounds3( size.minX, size.minY, size.minZ, size.minZ, interiorSize.minY, size.maxZ ),

        // Right side
        new Bounds3( interiorSize.minX, size.minY, size.minZ, size.maxX, size.maxY, size.maxZ ),

        // Left side
        new Bounds3( size.minX, size.minY, size.minZ, interiorSize.minX, size.maxY, size.maxZ ),

        // Front side
        new Bounds3( size.minX, size.minY, interiorSize.maxZ, size.maxX, size.maxY, size.maxZ ),

        // Back side
        new Bounds3( size.minX, size.minY, size.minZ, size.maxX, size.maxY, interiorSize.minZ )
      ];
 
      // Step information
      this.stepArea = 0;
      this.stepMaximumVolume = 0;
      this.boatMinX = 0;
      this.boatMaxX = 0;
      this.boatInternalBottom = 0;
      this.boatInternalArea = 0;

      // TODO: link updates if size changes
    }

    /**
     * Steps forward in time.
     * @public
     * @override
     *
     * @param {number} dt
     * @param {number} interpolationRatio
     */
    step( dt, interpolationRatio ) {
      super.step( dt, interpolationRatio );

      this.liquidYProperty.setRatio( interpolationRatio );
    }
    /**
     * Returns whether this is a boat (as more complicated handling is needed in this case).
     * @public
     * @override
     *
     * @returns {boolean}
     */
    isBoat() {
      return true;
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

      this.boatMinX = xOffset + this.sizeProperty.value.minX;
      this.boatMaxX = xOffset + this.sizeProperty.value.maxX;

      this.boatInternalBottom = this.stepBottom + this.thickness;
      this.boatInternalArea = ( this.sizeProperty.value.width - this.thickness * 2 ) * ( this.sizeProperty.value.depth - this.thickness * 2 );
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

      let best = null;
      this.intersectionBoundsArray.forEach( bounds => {
        const intersection = Cuboid.rayCuboidIntersection( bounds, translation, ray );
        if ( intersection !== null && ( best === null || intersection < best ) ) {
          best = intersection;
        }
      } );
      return best;
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
     * TODO: doc. Uses liquid compensation
     * @public
     * @override
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getDisplacedBuoyantVolume( liquidLevel ) {
      // TODO: yikes! Imagine boat with liquid with things floating in it. figure out.
      // TODO: NOPE NOPE NOPE NOPE NOPE NOPE NOPE this isn't right
      return this.getDisplacedVolume( liquidLevel ) - this.boatInternalArea * this.liquidYProperty.currentValue;
    }

    reset() {
      this.sizeProperty.reset();
      this.interiorSizeProperty.reset();
      this.liquidVolumeProperty.reset();
      this.liquidYProperty.reset();

      super.reset();
    }
  }

  return densityBuoyancyCommon.register( 'Boat', Boat );
} );
