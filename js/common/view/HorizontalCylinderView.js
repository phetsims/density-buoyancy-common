// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );

  // constants
  const segments = 64;
  const numElements = 12 * segments;

  class HorizontalCylinderView extends MassView {
    /**
     * @param {VerticalCylinder} verticalCylinder
     */
    constructor( verticalCylinder ) {

      const positionArray = new Float32Array( numElements * 3 );
      const normalArray = new Float32Array( numElements * 3 );
      const uvArray = new Float32Array( numElements * 2 );

      HorizontalCylinderView.updateArrays( positionArray, normalArray, uvArray, verticalCylinder.radiusProperty.value, verticalCylinder.lengthProperty.value );

      const verticalCylinderGeometry = new THREE.BufferGeometry();
      verticalCylinderGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
      verticalCylinderGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
      verticalCylinderGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

      super( verticalCylinder, verticalCylinderGeometry );

      // @public {VerticalCylinder}
      this.verticalCylinder = verticalCylinder;

      // @private {function}
      this.updateListener = size => {
        HorizontalCylinderView.updateArrays( verticalCylinderGeometry.attributes.position.array, null, null, verticalCylinder.radiusProperty.value, verticalCylinder.lengthProperty.value );
        verticalCylinderGeometry.attributes.position.needsUpdate = true;
        verticalCylinderGeometry.computeBoundingSphere();
      };
      this.verticalCylinder.radiusProperty.lazyLink( this.updateListener );
      this.verticalCylinder.lengthProperty.lazyLink( this.updateListener );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.verticalCylinder.radiusProperty.unlink( this.updateListener );
      this.verticalCylinder.lengthProperty.unlink( this.updateListener );

      super.dispose();
    }

    /**
     * Updates provided geometry arrays given the specific size.
     * @private
     *
     * @param {Float32Array|null} positionArray
     * @param {Float32Array|null} normalArray
     * @param {Float32Array|null} uvArray
     * @param {number} radius
     * @param {number} length
     * @param {number} offset - How many vertices have been specified so far?
     * @returns {number} - The offset after the specified verticies have been written
     */
    static updateArrays( positionArray, normalArray, uvArray, radius, length, offset = 0 ) {
      const leftX = -length / 2;
      const rightX = length / 2;

      let positionIndex = offset * 3;
      let normalIndex = offset * 3;
      let uvIndex = offset * 2;

      function position( x, y, z ) {
        if ( positionArray ) {
          positionArray[ positionIndex++ ] = x;
          positionArray[ positionIndex++ ] = y;
          positionArray[ positionIndex++ ] = z;
        }

        offset++;
      }

      function normal( x, y, z ) {
        if ( normalArray ) {
          normalArray[ normalIndex++ ] = x;
          normalArray[ normalIndex++ ] = y;
          normalArray[ normalIndex++ ] = z;
        }
      }

      function uv( u, v ) {
        if ( uvArray ) {
          uvArray[ uvIndex++ ] = u;
          uvArray[ uvIndex++ ] = v;
        }
      }

      const TWO_PI = 2 * Math.PI;

      for ( let i = 0; i < segments; i++ ) {
        const theta0 = TWO_PI * i / segments;
        const theta1 = TWO_PI * ( i + 1 ) / segments;

        // Normals
        const ny0 = Math.cos( theta0 );
        const ny1 = Math.cos( theta1 );
        const nz0 = Math.sin( theta0 );
        const nz1 = Math.sin( theta1 );

        // Positions
        const y0 = radius * ny0;
        const y1 = radius * ny1;
        const z0 = radius * nz0;
        const z1 = radius * nz1;

        // Left cap
        position( leftX, 0, 0 );
        position( leftX, y1, z1 );
        position( leftX, y0, z0 );
        normal( -1, 0, 0 );
        normal( -1, 0, 0 );
        normal( -1, 0, 0 );
        uv( 1, 0.5,  );
        uv( 0, theta1 / TWO_PI );
        uv( 0, theta0 / TWO_PI );

        // Side
        position( leftX, y0, z0 );
        position( leftX, y1, z1 );
        position( rightX, y0, z0 );
        position( rightX, y0, z0 );
        position( leftX, y1, z1 );
        position( rightX, y1, z1 );
        normal( 0, ny0, nz0 );
        normal( 0, ny0, nz0 );
        normal( 0, ny1, nz1 );
        normal( 0, ny0, nz0 );
        normal( 0, ny1, nz1 );
        normal( 0, ny1, nz1 );
        uv( 1, theta0 / TWO_PI );
        uv( 0, theta0 / TWO_PI );
        uv( 0, theta1 / TWO_PI );
        uv( 1, theta0 / TWO_PI );
        uv( 0, theta1 / TWO_PI );
        uv( 1, theta1 / TWO_PI );

        // Right cap
        position( rightX, 0, 0 );
        position( rightX, y0, z0 );
        position( rightX, y1, z1 );
        normal( 1, 0, 0 );
        normal( 1, 0, 0 );
        normal( 1, 0, 0 );
        uv( 1, 0.5 );
        uv( 0, theta0 / TWO_PI );
        uv( 0, theta1 / TWO_PI );
      }

      return offset;
    }
  }

  return densityBuoyancyCommon.register( 'HorizontalCylinderView', HorizontalCylinderView );
} );
