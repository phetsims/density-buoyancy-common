// Copyright 2019-2021, University of Colorado Boulder

/**
 * Shows mass/volume controls for a primary and secondary mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BlockControlNode from './BlockControlNode.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import PrimarySecondaryPanelsNode from './PrimarySecondaryPanelsNode.js';

class PrimarySecondaryControlsNode extends PrimarySecondaryPanelsNode {

  /**
   * @param {Mass} primaryMass
   * @param {Mass} secondaryMass
   * @param {Property.<boolean>} secondaryMassVisibleProperty
   * @param {Node} popupLayer
   * @param {Tandem} tandem
   * @param {Object} [options] - Applied to each BlockControlNode
   */
  constructor( primaryMass, secondaryMass, secondaryMassVisibleProperty, popupLayer, tandem, options ) {
    super(
      new BlockControlNode( primaryMass, popupLayer, tandem.createTandem( 'primaryBlockControlNode' ), merge( {
        labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode(),
        color: DensityBuoyancyCommonColors.labelAProperty
      }, options ) ),
      new BlockControlNode( secondaryMass, popupLayer, tandem.createTandem( 'secondaryBlockControlNode' ), merge( {
        labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode(),
        color: DensityBuoyancyCommonColors.labelBProperty,
        visibleProperty: secondaryMassVisibleProperty
      }, options ) )
    );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );
export default PrimarySecondaryControlsNode;