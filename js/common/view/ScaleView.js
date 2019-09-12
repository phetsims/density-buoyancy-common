// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const CuboidView = require( 'DENSITY_BUOYANCY_COMMON/common/view/CuboidView' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );
  const Vector3 = require( 'DOT/Vector3' );
  const VerticalCylinderView = require( 'DENSITY_BUOYANCY_COMMON/common/view/VerticalCylinderView' );

  class ScaleView extends MassView {
    /**
     * @param {Scale} mass
     */
    constructor( mass ) {
      const cuboidElements = 18 * 3;
      const cylinderElements = 12 * 64; // TODO: share these!
      const numElements = cuboidElements + cylinderElements;

      const positionArray = new Float32Array( numElements * 3 );
      const normalArray = new Float32Array( numElements * 3 );
      const uvArray = new Float32Array( numElements * 2 );

      const topOffset = new Vector3(
        0,
        ( Scale.SCALE_HEIGHT - Scale.SCALE_TOP_HEIGHT ) / 2,
        0
      );

      CuboidView.updateArrays( positionArray, normalArray, uvArray, Scale.SCALE_BASE_BOUNDS );
      VerticalCylinderView.updateArrays( positionArray, normalArray, uvArray, Scale.SCALE_WIDTH / 2, Scale.SCALE_TOP_HEIGHT, cuboidElements, topOffset );

      const scaleGeometry = new THREE.BufferGeometry();
      scaleGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
      scaleGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
      scaleGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

      super( mass, scaleGeometry );

      // @public {Scale}
      this.mass = mass;
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'ScaleView', ScaleView );
} );
