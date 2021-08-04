// Copyright 2019-2021, University of Colorado Boulder

/**
 * A container for a three.js material and various associated functions/data that are needed to update it.
 *
 * Still used for subtyping the disposal, as we need a wrapper to store additional information.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class MaterialView {
  /**
   * @param {THREE.Material} material
   */
  constructor( material ) {
    // @public {THREE.Material}
    this.material = material;
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