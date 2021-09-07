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
   * @param {Node} popupLayer
   * @param {Object} [options] - Applied to each BlockControlNode
   */
  constructor( primaryMass, secondaryMass, popupLayer, options ) {

    const tandem = options.tandem;
    const omittedOptions = _.omit( options, [ 'tandem' ] );

    super(
      new BlockControlNode( primaryMass, popupLayer, merge( {
        labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode(),
        color: DensityBuoyancyCommonColors.labelAProperty,
        visibleProperty: primaryMass.visibleProperty,
        tandem: tandem.createTandem( 'blockAControlPanel' )
      }, omittedOptions ) ),
      new BlockControlNode( secondaryMass, popupLayer, merge( {
        labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode(),
        color: DensityBuoyancyCommonColors.labelBProperty,
        visibleProperty: secondaryMass.visibleProperty,
        tandem: tandem.createTandem( 'blockBControlPanel' )
      }, omittedOptions ) )
    );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );
export default PrimarySecondaryControlsNode;