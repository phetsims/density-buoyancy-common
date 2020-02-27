// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class MaterialView {
  constructor() {
    // @public {THREE.Material}
    this.material = null;
  }

  /**
   * Updates the material view (before the main rendering)
   * @public
   *
   * @param {MassView} massView
   * @param {THREE.Scene} scene
   */
  update( massView, scene ) {

  }
}

densityBuoyancyCommon.register( 'MaterialView', MaterialView );
export default MaterialView;