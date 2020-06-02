// Copyright 2019-2020, University of Colorado Boulder

/**
 * A container for a three.js material and various associated functions/data that are needed to update it.
 *
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

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.material.dispose();
  }
}

densityBuoyancyCommon.register( 'MaterialView', MaterialView );
export default MaterialView;