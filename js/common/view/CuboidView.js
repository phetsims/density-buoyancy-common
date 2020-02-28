// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import TextureQuad from '../../../../mobius/js/TextureQuad.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass from '../model/Mass.js';
import MassLabelNode from './MassLabelNode.js';
import MassView from './MassView.js';

// constats
const numElements = 18 * 3;
const TAG_SIZE = 0.03;
const TAG_OFFSET = 0.005;

class CuboidView extends MassView {
  /**
   * @param {Cuboid} cuboid
   */
  constructor( cuboid ) {
    const size = cuboid.sizeProperty.value;

    const positionArray = new Float32Array( numElements * 3 );
    const normalArray = new Float32Array( numElements * 3 );
    const uvArray = new Float32Array( numElements * 2 );

    CuboidView.updateArrays( positionArray, normalArray, uvArray, size );

    const boxGeometry = new THREE.BufferGeometry();
    boxGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
    boxGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
    boxGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

    super( cuboid, boxGeometry );

    // @public {Cuboid}
    this.cuboid = cuboid;

    let tagMesh = null;
    if ( cuboid.tag === Mass.MassTag.PRIMARY ) {
      tagMesh = new TextureQuad( MassLabelNode.getPrimaryTexture(), TAG_SIZE, TAG_SIZE );
    }
    if ( cuboid.tag === Mass.MassTag.SECONDARY ) {
      tagMesh = new TextureQuad( MassLabelNode.getSecondaryTexture(), TAG_SIZE, TAG_SIZE );
    }

    if ( tagMesh ) {
      this.add( tagMesh );
    }

    const positionTag = () => {
      const size = cuboid.sizeProperty.value;
      tagMesh && tagMesh.position.set( size.minX + TAG_OFFSET, size.maxY - TAG_SIZE - TAG_OFFSET, size.maxZ + 0.0001 );
    };
    positionTag();

    // @private {function}
    this.updateListener = size => {
      positionTag();
      CuboidView.updateArrays( boxGeometry.attributes.position.array, null, boxGeometry.attributes.uv.array, size );
      boxGeometry.attributes.position.needsUpdate = true;
      boxGeometry.attributes.uv.needsUpdate = true;
      boxGeometry.computeBoundingSphere();
    };
    this.cuboid.sizeProperty.lazyLink( this.updateListener );

  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.cuboid.sizeProperty.unlink( this.updateListener );

    super.dispose();
  }

  /**
   * Updates provided geometry arrays given the specific size.
   * @private
   *
   * @param {Float32Array|null} positionArray
   * @param {Float32Array|null} normalArray
   * @param {Float32Array|null} uvArray
   * @param {Bounds3} size
   * @param {number} offset - How many vertices have been specified so far?
   * @param {Vector3} offsetPosition - How to transform all of the points
   * @returns {number} - The offset after the specified verticies have been written
   */
  static updateArrays( positionArray, normalArray, uvArray, size, offset = 0, offsetPosition = Vector3.ZERO ) {
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

    function uv( u, v ) {
      if ( uvArray ) {
        uvArray[ uvIndex++ ] = u;
        uvArray[ uvIndex++ ] = v;
      }
    }

    function quad( p0x, p0y, p0z, p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z ) {
      position( p0x, p0y, p0z );
      position( p1x, p1y, p1z );
      position( p2x, p2y, p2z );

      position( p0x, p0y, p0z );
      position( p2x, p2y, p2z );
      position( p3x, p3y, p3z );

      const du = 2.5 * ( Math.abs( p1x - p0x ) + Math.abs( p1y - p0y ) + Math.abs( p1z - p0z ) );
      const dv = 2.5 * ( Math.abs( p1x - p2x ) + Math.abs( p1y - p2y ) + Math.abs( p1z - p2z ) );
      const uMin = 0.5 - du;
      const uMax = 0.5 + du;
      const vMin = 0.5 - dv;
      const vMax = 0.5 + dv;

      uv( uMax, vMin );
      uv( uMin, vMin );
      uv( uMin, vMax );

      uv( uMax, vMin );
      uv( uMin, vMax );
      uv( uMax, vMax );

      offset += 6;
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

    return offset;
  }
}

densityBuoyancyCommon.register( 'CuboidView', CuboidView );
export default CuboidView;