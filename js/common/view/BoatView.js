// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector3 = require( 'DOT/Vector3' );

  class BoatView extends MassView {
    /**
     * @param {Boat} boat
     */
    constructor( boat ) {

      const positionArray = [];
      const normalArray = [];

      const size = boat.sizeProperty.value;
      const interiorSize = boat.interiorSizeProperty.value;
      const center = size.center;

      const addSection = ( inside0, outside0, inside1, outside1, normal ) => {
        positionArray.push(
          center.x, interiorSize.minY, center.y, 
          inside1.x, interiorSize.minY, inside1.y,
          inside0.x, interiorSize.minY, inside0.y,

          inside1.x, interiorSize.minY, inside1.y,
          inside1.x, interiorSize.maxY, inside1.y,
          inside0.x, interiorSize.minY, inside0.y,
          
          inside0.x, interiorSize.minY, inside0.y,
          inside1.x, interiorSize.maxY, inside1.y,
          inside0.x, interiorSize.maxY, inside0.y,

          inside1.x, interiorSize.maxY, inside1.y,
          outside1.x, size.maxY, outside1.y,
          inside0.x, interiorSize.maxY, inside0.y,

          inside0.x, interiorSize.maxY, inside0.y,
          outside1.x, size.maxY, outside1.y,
          outside0.x, size.maxY, outside0.y,

          outside1.x, size.minY, outside1.y,
          outside0.x, size.minY, outside0.y,
          outside1.x, size.maxY, outside1.y,
          
          outside0.x, size.minY, outside0.y,
          outside0.x, size.maxY, outside0.y,
          outside1.x, size.maxY, outside1.y,

          center.x, size.minY, center.y, 
          outside0.x, size.minY, outside0.y,
          outside1.x, size.minY, outside1.y
        );
        normalArray.push(
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

          -normal.x, -normal.y, -normal.z,
          -normal.x, -normal.y, -normal.z,
          -normal.x, -normal.y, -normal.z,

          -normal.x, -normal.y, -normal.z,
          -normal.x, -normal.y, -normal.z,
          -normal.x, -normal.y, -normal.z,

          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,

          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,

          0, -1, 0,
          0, -1, 0,
          0, -1, 0
        );
      };

      addSection(
        new Vector2( interiorSize.maxX, interiorSize.minZ ),
        new Vector2( size.maxX, size.minZ ),
        new Vector2( interiorSize.maxX, interiorSize.maxZ ),
        new Vector2( size.maxX, size.maxZ ),
        new Vector3( 1, 0, 0 )
      );
      addSection(
        new Vector2( interiorSize.maxX, interiorSize.maxZ ),
        new Vector2( size.maxX, size.maxZ ),
        new Vector2( interiorSize.minX, interiorSize.maxZ ),
        new Vector2( size.minX, size.maxZ ),
        new Vector3( 0, 0, 1 )
      );
      addSection(
        new Vector2( interiorSize.minX, interiorSize.maxZ ),
        new Vector2( size.minX, size.maxZ ),
        new Vector2( interiorSize.minX, interiorSize.minZ ),
        new Vector2( size.minX, size.minZ ),
        new Vector3( -1, 0, 0 )
      );
      addSection(
        new Vector2( interiorSize.minX, interiorSize.minZ ),
        new Vector2( size.minX, size.minZ ),
        new Vector2( interiorSize.maxX, interiorSize.minZ ),
        new Vector2( size.maxX, size.minZ ),
        new Vector3( 0, 0, -1 )
      );

      // Pool interior
      const boatGeometry = new THREE.BufferGeometry();
      boatGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positionArray ), 3 ) );
      boatGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( normalArray ), 3 ) );

      super( boat, boatGeometry );

      // @public {Boat}
      this.boat = boat;
    }
  }

  return densityBuoyancyCommon.register( 'BoatView', BoatView );
} );
