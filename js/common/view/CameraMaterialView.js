// Copyright 2019-2020, University of Colorado Boulder

/**
 * A specific MaterialView that uses its own camera for an environment map texture.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonColorProfile from './DensityBuoyancyCommonColorProfile.js';
import MaterialView from './MaterialView.js';

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
    scene.background = ThreeUtils.colorToThree( DensityBuoyancyCommonColorProfile.skyBottomProperty.value );

    // NOTE NOTE NOTE: Just adjust this based on water level or other things?

    this.camera.position.copy( massView.position );
    this.camera.update( renderer, scene );

    scene.background = null;
    massView.visible = initiallyVisible;
    scene.remove( this.camera );

    super.update( massView, scene );
  }
}

densityBuoyancyCommon.register( 'CameraMaterialView', CameraMaterialView );
export default CameraMaterialView;