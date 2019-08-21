// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );
  const Vector3 = require( 'DOT/Vector3' );

  // constants
  const segments = 64;
  const numElements = 6 * segments;

  class ConeView extends MassView {
    /**
     * @param {Cone} cone
     */
    constructor( cone ) {

      const positionArray = new Float32Array( numElements * 3 );
      const normalArray = new Float32Array( numElements * 3 );
      const uvArray = new Float32Array( numElements * 2 );

      ConeView.updateArrays( positionArray, normalArray, uvArray, cone.radiusProperty.value, cone.heightProperty.value, cone.isVertexUp );

      const coneGeometry = new THREE.BufferGeometry();
      coneGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
      coneGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
      coneGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

      super( cone, coneGeometry );

      // @public {Cone}
      this.cone = cone;

      // @private {function}
      this.updateListener = size => {
        ConeView.updateArrays( coneGeometry.attributes.position.array, coneGeometry.attributes.normal.array, null, cone.radiusProperty.value, cone.heightProperty.value, cone.isVertexUp );
        coneGeometry.attributes.position.needsUpdate = true;
        coneGeometry.attributes.normal.needsUpdate = true;
        coneGeometry.computeBoundingSphere();
      };
      this.cone.radiusProperty.lazyLink( this.updateListener );
      this.cone.heightProperty.lazyLink( this.updateListener );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.cone.radiusProperty.unlink( this.updateListener );
      this.cone.heightProperty.unlink( this.updateListener );

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
     * @param {boolean} isVertexUp
     * @param {number} offset - How many vertices have been specified so far?
     * @returns {number} - The offset after the specified verticies have been written
     */
    static updateArrays( positionArray, normalArray, uvArray, radius, height, isVertexUp, offset = 0 ) {
      const vertexSign = isVertexUp ? 1 : -1;
      const vertexY = vertexSign * 0.75 * height;
      const baseY = -vertexSign * 0.25 * height;

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

        const vertices = [
          new Vector3( 0, vertexY, 0 ),
          new Vector3(
            radius * Math.cos( isVertexUp ? theta1 : theta0 ),
            baseY,
            radius * Math.sin( isVertexUp ? theta1 : theta0 )
          ),
          new Vector3(
            radius * Math.cos( isVertexUp ? theta0 : theta1 ),
            baseY,
            radius * Math.sin( isVertexUp ? theta0 : theta1 )
          )
        ];

        // TODO: make sure it's pointed the right way? x/z signs should be the same
        const normalVector = vertices[ 2 ].minus( vertices[ 0 ] ).cross( vertices[ 1 ].minus( vertices[ 0 ] ) ).normalized().negated();

        // Side
        for ( let j = 0; j < vertices.length; j++ ) {
          position( vertices[ j ].x, vertices[ j ].y, vertices[ j ].z );
          normal( normalVector.x, normalVector.y, normalVector.z );
        }
        uv( 0.5, 0 );
        uv( ( isVertexUp ? theta1 : theta0 ) / TWO_PI, 1 );
        uv( ( isVertexUp ? theta0 : theta1 ) / TWO_PI, 1 );

        // Top/Bottom
        position( 0, baseY, 0 );
        position( vertices[ 2 ].x, vertices[ 2 ].y, vertices[ 2 ].z );
        position( vertices[ 1 ].x, vertices[ 1 ].y, vertices[ 1 ].z );
        normal( 0, 0, -vertexSign );
        normal( 0, 0, -vertexSign );
        normal( 0, 0, -vertexSign );
        uv( 0.5, 0 );
        uv( ( isVertexUp ? theta0 : theta1 ) / TWO_PI, 1 );
        uv( ( isVertexUp ? theta1 : theta0 ) / TWO_PI, 1 );
      }

      return offset;
    }
  }

  return densityBuoyancyCommon.register( 'ConeView', ConeView );
} );
