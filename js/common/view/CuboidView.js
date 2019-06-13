// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );

  // constats
  const bufferSize = 18 * 6;

  class CuboidView extends MassView {
    /**
     * @param {Cuboid} cuboid
     */
    constructor( cuboid ) {
      const size = cuboid.sizeProperty.value;

      const positionArray = new Float32Array( bufferSize );
      const normalArray = new Float32Array( bufferSize );

      CuboidView.updateArrays( positionArray, normalArray, size );

      const boxGeometry = new THREE.BufferGeometry();
      boxGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
      boxGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );

      super( cuboid, boxGeometry );

      // @public {Cuboid}
      this.cuboid = cuboid;

      // @private {function}
      this.sizeListener = size => {
        CuboidView.updateArrays( boxGeometry.attributes.position.array, null, size );
        boxGeometry.attributes.position.needsUpdate = true;
        boxGeometry.computeBoundingSphere();
      };
      this.cuboid.sizeProperty.link( this.sizeListener );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.cuboid.sizeProperty.unlink( this.sizeListener );

      super.dispose();
    }

    /**
     * Updates provided geometry arrays given the specific size.
     * @private
     *
     * @param {Float32Array|null} positionArray
     * @param {Float32Array|null} normalArray
     * @param {Bounds3} size
     */
    static updateArrays( positionArray, normalArray, size ) {
      let positionIndex = 0;
      let normalIndex = 0;

      function position( x, y, z ) {
        if ( positionArray ) {
          positionArray[ positionIndex++ ] = x;
          positionArray[ positionIndex++ ] = y;
          positionArray[ positionIndex++ ] = z;
        }
      }

      function normal( x, y, z ) {
        if ( normalArray ) {
          for ( let i = 0; i < 6; i++ ) {
            normalArray[ normalIndex++ ] = x;
            normalArray[ normalIndex++ ] = y;
            normalArray[ normalIndex++ ] = z;
          }
        }
      }

      function quad( p0x, p0y, p0z, p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z ) {
        position( p0x, p0y, p0z );
        position( p1x, p1y, p1z );
        position( p2x, p2y, p2z );

        position( p0x, p0y, p0z );
        position( p2x, p2y, p2z );
        position( p3x, p3y, p3z );
      }
      
      // Bottom
      quad(
        size.minX, size.minY, size.minZ,
        size.maxX, size.minY, size.minZ,
        size.maxX, size.minY, size.maxZ,
        size.minX, size.minY, size.maxZ
      );
      normal( 0, -1, 0 );

      // Top
      quad(
        size.minX, size.maxY, size.minZ,
        size.minX, size.maxY, size.maxZ,
        size.maxX, size.maxY, size.maxZ,
        size.maxX, size.maxY, size.minZ
      );
      normal( 0, 1, 0 );

      // Left
      quad(
        size.minX, size.minY, size.minZ,
        size.minX, size.minY, size.maxZ,
        size.minX, size.maxY, size.maxZ,
        size.minX, size.maxY, size.minZ
      );
      normal( -1, 0, 0 );

      // Right
      quad(
        size.maxX, size.minY, size.minZ,
        size.maxX, size.maxY, size.minZ,
        size.maxX, size.maxY, size.maxZ,
        size.maxX, size.minY, size.maxZ
      );
      normal( 1, 0, 0 );

      // Back
      quad(
        size.minX, size.minY, size.minZ,
        size.minX, size.maxY, size.minZ,
        size.maxX, size.maxY, size.minZ,
        size.maxX, size.minY, size.minZ
      );
      normal( 0, 0, -1 );

      // Front
      quad(
        size.minX, size.minY, size.maxZ,
        size.maxX, size.minY, size.maxZ,
        size.maxX, size.maxY, size.maxZ,
        size.minX, size.maxY, size.maxZ
      );
      normal( 0, 0, 1 );
    }
  }

  return densityBuoyancyCommon.register( 'CuboidView', CuboidView );
} );
