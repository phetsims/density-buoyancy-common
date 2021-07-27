// Copyright 2019-2020, University of Colorado Boulder

/**
 * A container for a three.js material and various associated functions/data that are needed to update it.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class MaterialView {
  constructor() {
    // @public {THREE.Material} - defined by subtypes usually
    this.material = null;
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