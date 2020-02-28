// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid from '../model/Cuboid.js';
import Material from '../model/Material.js';
import MaterialMassVolumeControlNode from './MaterialMassVolumeControlNode.js';

// TODO: move out
class BlockControlNode extends MaterialMassVolumeControlNode {
  /**
   * @param {Cuboid} cuboid
   * @param {Node} listParent
   * @param {Object} [options]
   */
  constructor( cuboid, listParent, options ) {
    super( cuboid.materialProperty, cuboid.massProperty, cuboid.volumeProperty, [
      Material.STYROFOAM,
      Material.WOOD,
      Material.ICE,
      Material.BRICK,
      Material.ALUMINUM
    ], cubicMeters => cuboid.updateSize( Cuboid.boundsFromVolume( cubicMeters ) ), listParent, options );
  }
}

densityBuoyancyCommon.register( 'BlockControlNode', BlockControlNode );
export default BlockControlNode;