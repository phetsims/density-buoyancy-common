// Copyright 2019, University of Colorado Boulder

/**
 * An axis-aligned cuboid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AreaMarker = require( 'DENSITY_BUOYANCY_COMMON/common/model/AreaMarker' );
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
    getSubmergedVolume( liquidLevel ) {
      this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      const offset = this.stepMatrix.m12();
      const bottom = offset + this.sizeProperty.value.minY;
      const top = offset + this.sizeProperty.value.maxY;
      if ( liquidLevel <= bottom ) {
        return 0;
      }
      else if ( liquidLevel >= top ) {
        return this.volumeProperty.value;
      }
      else {
        return this.volumeProperty.value * ( liquidLevel - bottom ) / ( top - bottom );
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

  return densityBuoyancyCommon.register( 'Cuboid', Cuboid );
} );
