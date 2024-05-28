// Copyright 2019-2024, University of Colorado Boulder

/**
 * A mass/volume control specifically for blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Node } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cube from '../model/Cube.js';
import Cuboid from '../model/Cuboid.js';
import MaterialMassVolumeControlNode, { MaterialMassVolumeControlNodeOptions } from './MaterialMassVolumeControlNode.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';

type SelfOptions = {
  mysteryMaterials?: Material[];
};

export type BlockControlNodeOptions = MaterialMassVolumeControlNodeOptions & SelfOptions;

export default class BlockControlNode extends MaterialMassVolumeControlNode {
  public constructor( cuboid: Cuboid, listParent: Node, numberControlMassPropertyFeatured: boolean, options: BlockControlNodeOptions ) {

    // Add mystery materials at the end, if provided
    const materials = options.mysteryMaterials ?
                      DensityBuoyancyCommonConstants.SIMPLE_MASS_MATERIALS.concat( options.mysteryMaterials ) :
                      DensityBuoyancyCommonConstants.SIMPLE_MASS_MATERIALS;

    super( cuboid.materialProperty, cuboid.massProperty, cuboid.volumeProperty, materials,
      cubicMeters => cuboid.updateSize( Cube.boundsFromVolume( cubicMeters ) ), listParent, numberControlMassPropertyFeatured, options );
  }
}

densityBuoyancyCommon.register( 'BlockControlNode', BlockControlNode );