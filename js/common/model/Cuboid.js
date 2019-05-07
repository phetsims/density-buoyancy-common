// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );

  /**
   * @constructor
   */
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
        volume: size.width * size.height * size.depth

        // material
      }, config );

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

      if ( this.canRotate ) {
        return this.computeGeneralSubmergedArea( liquidLevel ) * this.sizeProperty.depth;
      }
      else {
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
    }
  }

  return densityBuoyancyCommon.register( 'Cuboid', Cuboid );
} );
