// Copyright 2019-2021, University of Colorado Boulder

/**
 * Shows mass/volume controls for a primary and secondary mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BlockControlNode from './BlockControlNode.js';
import densityBuoyancyCommonColorProfile from './densityBuoyancyCommonColorProfile.js';
import PrimarySecondaryPanelsNode from './PrimarySecondaryPanelsNode.js';

class PrimarySecondaryControlsNode extends PrimarySecondaryPanelsNode {

  /**
   * @param {Mass} primaryMass
   * @param {Mass} secondaryMass
   * @param {Property.<boolean>} secondaryMassVisibleProperty
   * @param {Node} popupLayer
   * @param {Object} [options]
   */
  constructor( primaryMass, secondaryMass, secondaryMassVisibleProperty, popupLayer, options ) {
    super(
      new BlockControlNode( primaryMass, popupLayer, merge( {
        labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode(),
        color: densityBuoyancyCommonColorProfile.labelAProperty
      }, options ) ),
      new BlockControlNode( secondaryMass, popupLayer, merge( {
        labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode(),
        color: densityBuoyancyCommonColorProfile.labelBProperty
      }, options ) ),
      secondaryMassVisibleProperty
    );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );
export default PrimarySecondaryControlsNode;