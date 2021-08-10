// Copyright 2019-2021, University of Colorado Boulder

/**
 * The 3D view for a VerticalCylinder.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassView from './MassView.js';

// constants
const segments = 64;
const numElements = 12 * segments;

class VerticalCylinderView extends MassView {
  /**
   * @param {VerticalCylinder} verticalCylinder
   * @param {Object} [options]
   */
  constructor( verticalCylinder, options ) {

    const positionArray = new Float32Array( numElements * 3 );
    const normalArray = new Float32Array( numElements * 3 );
    const uvArray = new Float32Array( numElements * 2 );

    VerticalCylinderView.updateArrays( positionArray, normalArray, uvArray, verticalCylinder.radiusProperty.value, verticalCylinder.heightProperty.value );

    const verticalCylinderGeometry = new THREE.BufferGeometry();
    verticalCylinderGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
    verticalCylinderGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
    verticalCylinderGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

    super( verticalCylinder, verticalCylinderGeometry, options );

    // @public {VerticalCylinder}
    this.verticalCylinder = verticalCylinder;

    // @private {THREE.BufferGeometry}
    this.verticalCylinderGeometry = verticalCylinderGeometry;

    // @private {function}
    this.updateListener = size => {
      VerticalCylinderView.updateArrays( verticalCylinderGeometry.attributes.position.array, null, verticalCylinderGeometry.attributes.uv.array, verticalCylinder.radiusProperty.value, verticalCylinder.heightProperty.value );
      verticalCylinderGeometry.attributes.position.needsUpdate = true;
      verticalCylinderGeometry.attributes.uv.needsUpdate = true;
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
    this.verticalCylinderGeometry.dispose();

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
   * @param {Vector3} offsetPosition - How to transform all of the points
   * @returns {number} - The offset after the specified vertices have been written
   */
  static updateArrays( positionArray, normalArray, uvArray, radius, height, offset = 0, offsetPosition = Vector3.ZERO ) {
    const baseY = -height / 2;
    const topY = height / 2;

    let positionIndex = offset * 3;
    let normalIndex = offset * 3;
    let uvIndex = offset * 2;

    const offsetX = offsetPosition.x;
    const offsetY = offsetPosition.y;
    const offsetZ = offsetPosition.z;

    function position( x, y, z ) {
      if ( positionArray ) {
        positionArray[ positionIndex++ ] = x + offsetX;
        positionArray[ positionIndex++ ] = y + offsetY;
        positionArray[ positionIndex++ ] = z + offsetZ;
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

    const du = 5 * 2 * Math.PI * radius;
    const dv = 2.5 * height;
    const dvCap = 2.5 * radius;
    const vMin = 0.5 - dv;
    const vMax = 0.5 + dv;
    const vCapMin = 0.5 - dvCap;
    const vCapMax = 0.5 + dvCap;

    const TWO_PI = 2 * Math.PI;
    const HALF_PI = 0.5 * Math.PI;

    for ( let i = 0; i < segments; i++ ) {
      const ratio0 = i / segments;
      const ratio1 = ( i + 1 ) / segments;
      const theta0 = TWO_PI * ratio0 - HALF_PI;
      const theta1 = TWO_PI * ratio1 - HALF_PI;

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
      uv( 0.5, vCapMax );
      uv( du * ( ratio0 - 0.5 ), vCapMin );
      uv( du * ( ratio1 - 0.5 ), vCapMin );

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
      uv( du * ( ratio0 - 0.5 ), vMin );
      uv( du * ( ratio0 - 0.5 ), vMax );
      uv( du * ( ratio1 - 0.5 ), vMin );
      uv( du * ( ratio1 - 0.5 ), vMin );
      uv( du * ( ratio0 - 0.5 ), vMax );
      uv( du * ( ratio1 - 0.5 ), vMax );

      // Top
      position( 0, topY, 0 );
      position( x1, topY, z1 );
      position( x0, topY, z0 );
      normal( 0, 1, 0 );
      normal( 0, 1, 0 );
      normal( 0, 1, 0 );
      uv( 0.5, vCapMax );
      uv( du * ( ratio1 - 0.5 ), vCapMin );
      uv( du * ( ratio0 - 0.5 ), vCapMin );
    }

    return offset;
  }
}

densityBuoyancyCommon.register( 'VerticalCylinderView', VerticalCylinderView );
export default VerticalCylinderView;