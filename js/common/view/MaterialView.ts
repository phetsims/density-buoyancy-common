// Copyright 2019-2022, University of Colorado Boulder

/**
 * A container for a three.js material and various associated functions/data that are needed to update it.
 *
 * Still used for subtyping the disposal, as we need a wrapper to store additional information.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class MaterialView<T extends THREE.Material = THREE.Material> {

  readonly material: T;

  constructor( material: T ) {
    this.material = material;
  }

  /**
   * Releases references
   */
  dispose() {
    this.material.dispose();
  }
}

densityBuoyancyCommon.register( 'MaterialView', MaterialView );
export default MaterialView;