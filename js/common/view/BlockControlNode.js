// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const MaterialMassVolumeControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/MaterialMassVolumeControlNode' );

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

  return densityBuoyancyCommon.register( 'BlockControlNode', BlockControlNode );
} );
