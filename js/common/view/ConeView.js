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

  class ConeView extends MassView {
    /**
     * @param {Cone} cone
     */
    constructor( cone ) {

      const positionArray = [];
      const normalArray = [];

      const segments = 64;
      // TODO: dynamic updates
      const radius = cone.radiusProperty.value;
      const height = cone.heightProperty.value;
      const isVertexUp = cone.isVertexUp;
      const vertexSign = cone.vertexSign;

      const vertexY = vertexSign * 0.75 * height;
      const baseY = -vertexSign * 0.25 * height;

      for ( let i = 0; i < segments; i++ ) {
        const theta0 = 2 * Math.PI * i / segments;
        const theta1 = 2 * Math.PI * ( i + 1 ) / segments;


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
        const normal = vertices[ 2 ].minus( vertices[ 0 ] ).cross( vertices[ 1 ].minus( vertices[ 0 ] ) ).normalized().negated();

        // Side
        for ( let j = 0; j < vertices.length; j++ ) {
          positionArray.push( vertices[ j ].x, vertices[ j ].y, vertices[ j ].z );
          normalArray.push( normal.x, normal.y, normal.z );
        }

        // Top/Bottom
        positionArray.push( 0, baseY, 0 );
        positionArray.push( vertices[ 2 ].x, vertices[ 2 ].y, vertices[ 2 ].z );
        positionArray.push( vertices[ 1 ].x, vertices[ 1 ].y, vertices[ 1 ].z );
        normalArray.push( 0, 0, -vertexSign, 0, 0, -vertexSign, 0, 0, -vertexSign );
      }

      const coneGeometry = new THREE.BufferGeometry();
      coneGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positionArray ), 3 ) );
      coneGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( normalArray ), 3 ) );

      super( cone, coneGeometry );

      // @public {Cone}
      this.cone = cone;
    }
  }

  return densityBuoyancyCommon.register( 'ConeView', ConeView );
} );
