// Copyright 2019, University of Colorado Boulder

/**
 * An axis-aligned boat with essentially a cut-out interior that can fill with the liquid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AreaMarker = require( 'DENSITY_BUOYANCY_COMMON/common/model/AreaMarker' );
  const Bounds3 = require( 'DOT/Bounds3' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
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

      console.log( boatVertices );

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

      // @public {Property.<Bounds3>}
      this.sizeProperty = new Property( size );

      // @public {Property.<Bounds3>}
      this.interiorSizeProperty = new Property( interiorSize );

      // TODO: link updates if size changes
    }

    /**
     * Returns the submerged volume of this object, assuming a y value for the given liquid level.
     * @public
     * @override
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getDisplacedVolume( liquidLevel ) {
      // TODO: this is the same as Cuboid, no? (well, with the fix)
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      const offset = this.stepMatrix.m12();
      const bottom = offset + this.sizeProperty.value.minY;
      const top = offset + this.sizeProperty.value.maxY;
      const maximumVolume = this.sizeProperty.value.width * this.sizeProperty.value.height * this.sizeProperty.value.depth;

      if ( liquidLevel <= bottom ) {
        return 0;
      }
      else if ( liquidLevel >= top ) {
        return maximumVolume;
      }
      else {
        return maximumVolume * ( liquidLevel - bottom ) / ( top - bottom );
      }
    }

    /**
     * Pushes area markers for this mass onto the array.
     * @public
     * @override
     *
     * @param {Array.<AreaMarker>} areaMarkers
     */
    pushAreaMarkers( areaMarkers ) {
      // TODO: this is the same as Cuboid, no?
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      const offset = this.stepMatrix.m12();
      const area = this.sizeProperty.value.width * this.sizeProperty.value.depth;

      areaMarkers.push( AreaMarker.createFromPool(
        offset + this.sizeProperty.value.minY,
        area
      ) );
      areaMarkers.push( AreaMarker.createFromPool(
        offset + this.sizeProperty.value.maxY,
        -area
      ) );
    }
  }

  return densityBuoyancyCommon.register( 'Boat', Boat );
} );
