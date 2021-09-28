// Copyright 2019-2021, University of Colorado Boulder

/**
 * Shows mass/volume controls for a primary and secondary mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import Node from '../../../../scenery/js/nodes/Node.js';
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

    const primaryControlNode = new BlockControlNode( primaryMass, popupLayer, merge( {
      labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode(),
      color: DensityBuoyancyCommonColors.labelAProperty,
      tandem: tandem.createTandem( 'blockAControlPanel' )
    }, omittedOptions ) );

    const secondaryControlNode = new BlockControlNode( secondaryMass, popupLayer, merge( {
      labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode(),
      color: DensityBuoyancyCommonColors.labelBProperty,
      tandem: tandem.createTandem( 'blockBControlPanel' )
    }, omittedOptions ) );

    super(
      new Node( {
        children: [ primaryControlNode ],
        visibleProperty: DerivedProperty.and( [ primaryMass.visibleProperty, primaryControlNode.visibleProperty ] )
      } ),
      new Node( {
        children: [ secondaryControlNode ],
        visibleProperty: DerivedProperty.and( [ secondaryMass.visibleProperty, secondaryControlNode.visibleProperty ] )
      } )
    );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );
export default PrimarySecondaryControlsNode;