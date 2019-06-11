// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );

  class CuboidView extends MassView {
    /**
     * @param {Cuboid} cuboid
     */
    constructor( cuboid ) {
      const size = cuboid.sizeProperty.value;

      const positionArray = CuboidView.getPositionArray( size );
      const normalArray = CuboidView.getNormalArray();

      const boxGeometry = new THREE.BufferGeometry();
      boxGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positionArray ), 3 ) );
      boxGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( normalArray ), 3 ) );

      super( cuboid, boxGeometry );

      // @public {Cuboid}
      this.cuboid = cuboid;

      // @private {function}
      this.sizeListener = size => {
        const positionArray = CuboidView.getPositionArray( size );
        for ( let i = 0; i < positionArray.length; i++ ) {
          boxGeometry.attributes.position.array[ i ] = positionArray[ i ];
        }
        boxGeometry.attributes.position.needsUpdate = true;
        boxGeometry.computeBoundingSphere();
      };
      this.cuboid.sizeProperty.lazyLink( this.sizeListener );
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

    static getPositionArray( size ) {
      const array = [];
      function quad( p0x, p0y, p0z, p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z ) {
        array.push(
          p0x, p0y, p0z,
          p1x, p1y, p1z,
          p2x, p2y, p2z,

          p0x, p0y, p0z,
          p2x, p2y, p2z,
          p3x, p3y, p3z
        );
      }

      // Bottom
      quad(
        size.minX, size.minY, size.minZ,
        size.maxX, size.minY, size.minZ,
        size.maxX, size.minY, size.maxZ,
        size.minX, size.minY, size.maxZ
      );

      // Top
      quad(
        size.minX, size.maxY, size.minZ,
        size.minX, size.maxY, size.maxZ,
        size.maxX, size.maxY, size.maxZ,
        size.maxX, size.maxY, size.minZ
      );

      // Left
      quad(
        size.minX, size.minY, size.minZ,
        size.minX, size.minY, size.maxZ,
        size.minX, size.maxY, size.maxZ,
        size.minX, size.maxY, size.minZ
      );

      // Right
      quad(
        size.maxX, size.minY, size.minZ,
        size.maxX, size.maxY, size.minZ,
        size.maxX, size.maxY, size.maxZ,
        size.maxX, size.minY, size.maxZ
      );

      // Back
      quad(
        size.minX, size.minY, size.minZ,
        size.minX, size.maxY, size.minZ,
        size.maxX, size.maxY, size.minZ,
        size.maxX, size.minY, size.minZ
      );

      // Front
      quad(
        size.minX, size.minY, size.maxZ,
        size.maxX, size.minY, size.maxZ,
        size.maxX, size.maxY, size.maxZ,
        size.minX, size.maxY, size.maxZ
      );

      return array;
    }

    static getNormalArray() {
      // TODO: easier way to repeat these
      return [
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ];
    }
  }

  return densityBuoyancyCommon.register( 'CuboidView', CuboidView );
} );
