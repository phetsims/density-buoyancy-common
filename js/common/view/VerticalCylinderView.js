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

  class VerticalCylinderView extends MassView {
    /**
     * @param {VerticalCylinder} verticalCylinder
     */
    constructor( verticalCylinder ) {

      const positionArray = new Float32Array( numElements * 3 );
      const normalArray = new Float32Array( numElements * 3 );
      const uvArray = new Float32Array( numElements * 2 );

      VerticalCylinderView.updateArrays( positionArray, normalArray, uvArray, verticalCylinder.radiusProperty.value, verticalCylinder.heightProperty.value );

      const verticalCylinderGeometry = new THREE.BufferGeometry();
      verticalCylinderGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
      verticalCylinderGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
      verticalCylinderGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

      super( verticalCylinder, verticalCylinderGeometry );

      // @public {VerticalCylinder}
      this.verticalCylinder = verticalCylinder;

      // @private {function}
      this.updateListener = size => {
        VerticalCylinderView.updateArrays( verticalCylinderGeometry.attributes.position.array, null, null, verticalCylinder.radiusProperty.value, verticalCylinder.heightProperty.value );
        verticalCylinderGeometry.attributes.position.needsUpdate = true;
        verticalCylinderGeometry.computeBoundingSphere();
      };
      this.verticalCylinder.radiusProperty.lazyLink( this.updateListener );
      this.verticalCylinder.heightProperty.lazyLink( this.updateListener );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.verticalCylinder.radiusProperty.unlink( this.updateListener );
      this.verticalCylinder.heightProperty.unlink( this.updateListener );

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
     * @param {number} height
     * @param {number} offset - How many vertices have been specified so far?
     * @returns {number} - The offset after the specified verticies have been written
     */
    static updateArrays( positionArray, normalArray, uvArray, radius, height, offset = 0 ) {
      const baseY = -height / 2;
      const topY = height / 2;

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
        const nx0 = Math.cos( theta0 );
        const nx1 = Math.cos( theta1 );
        const nz0 = Math.sin( theta0 );
        const nz1 = Math.sin( theta1 );

        // Positions
        const x0 = radius * nx0;
        const x1 = radius * nx1;
        const z0 = radius * nz0;
        const z1 = radius * nz1;

        // Base
        position( 0, baseY, 0 );
        position( x0, baseY, z0 );
        position( x1, baseY, z1 );
        normal( 0, -1, 0 );
        normal( 0, -1, 0 );
        normal( 0, -1, 0 );
        uv( 0.5, 1 );
        uv( theta0 / TWO_PI, 0 );
        uv( theta1 / TWO_PI, 0 );

        // Side
        position( x0, baseY, z0 );
        position( x0, topY, z0 );
        position( x1, baseY, z1 );
        position( x1, baseY, z1 );
        position( x0, topY, z0 );
        position( x1, topY, z1 );
        normal( nx0, 0, nz0 );
        normal( nx0, 0, nz0 );
        normal( nx1, 0, nz1 );
        normal( nx1, 0, nz1 );
        normal( nx0, 0, nz0 );
        normal( nx1, 0, nz1 );
        uv( theta0 / TWO_PI, 0 );
        uv( theta0 / TWO_PI, 1 );
        uv( theta1 / TWO_PI, 0 );
        uv( theta1 / TWO_PI, 0 );
        uv( theta0 / TWO_PI, 1 );
        uv( theta1 / TWO_PI, 1 );

        // Top
        position( 0, topY, 0 );
        position( x1, topY, z1 );
        position( x0, topY, z0 );
        normal( 0, 1, 0 );
        normal( 0, 1, 0 );
        normal( 0, 1, 0 );
        uv( 0.5, 1 );
        uv( theta1 / TWO_PI, 0 );
        uv( theta0 / TWO_PI, 0 );
      }

      return offset;
    }
  }

  return densityBuoyancyCommon.register( 'VerticalCylinderView', VerticalCylinderView );
} );
