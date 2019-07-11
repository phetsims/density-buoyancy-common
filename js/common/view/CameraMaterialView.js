// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const MaterialView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MaterialView' );
  const ThreeUtil = require( 'MOBIUS/ThreeUtil' );

  class CameraMaterialView extends MaterialView {
    /**
     *
     */
    constructor() {
      super();

      // @protected {THREE.CubeCamera}
      this.camera = new THREE.CubeCamera( 0.01, 50, 512 );
    }

    /**
     * Returns the texture that can be used as an environmental map.
     * @public
     *
     * @returns {THREE.Texture}
     */
    getTexture() {
      return this.camera.renderTarget.texture;
    }

    /**
     * Updates the material view (before the main rendering)
     * @public
     * @override
     *
     * @param {MassView} massView
     * @param {THREE.Scene} scene
     * @param {THREE.Renderer} renderer
     */
    update( massView, scene, renderer ) {
      scene.add( this.camera );

      const initiallyVisible = massView.visible;
      massView.visible = false;
      // TODO: more of a cubemap. THEN use the cubemap in everything
      scene.background = ThreeUtil.colorToThree( DensityBuoyancyCommonColorProfile.skyBottomProperty.value );

      // NOTE NOTE NOTE: Just adjust this based on water level or other things?

      this.camera.position.copy( massView.position );
      this.camera.update( renderer, scene );

      scene.background = null;
      massView.visible = initiallyVisible;
      scene.remove( this.camera );

      super.update( massView, scene );
    }
  }

  return densityBuoyancyCommon.register( 'CameraMaterialView', CameraMaterialView );
} );
