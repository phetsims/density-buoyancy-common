// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BlockControlNode from './BlockControlNode.js';
import DensityBuoyancyCommonColorProfile from './DensityBuoyancyCommonColorProfile.js';
import PrimarySecondaryPanelsNode from './PrimarySecondaryPanelsNode.js';

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

densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );
export default PrimarySecondaryControlsNode;