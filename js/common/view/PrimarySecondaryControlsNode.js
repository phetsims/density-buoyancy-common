// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BlockControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/BlockControlNode' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const PrimarySecondaryPanelsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/PrimarySecondaryPanelsNode' );

  class PrimarySecondaryControlsNode extends PrimarySecondaryPanelsNode {

    /**
     * @param {Mass} primaryMass
     * @param {Mass} secondaryMass
     * @param {Property.<boolean>} secondaryMassVisibleProperty
     * @param {Node} popupLayer
     */
    constructor( primaryMass, secondaryMass, secondaryMassVisibleProperty, popupLayer ) {
      super(
        new BlockControlNode( primaryMass, popupLayer, {
          labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode(),
          color: DensityBuoyancyCommonColorProfile.labelAProperty
        } ),
        new BlockControlNode( secondaryMass, popupLayer, {
          labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode(),
          color: DensityBuoyancyCommonColorProfile.labelBProperty
        } ),
        secondaryMassVisibleProperty
      );
    }
  }

  return densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );
} );
