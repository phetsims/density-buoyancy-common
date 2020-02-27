// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import MassLabelNode from './MassLabelNode.js';

class PrimarySecondaryPanelsNode extends Panel {

  /**
   * @param {Node} primaryNode
   * @param {Node} secondaryNode
   * @param {Property.<boolean>} secondaryMassVisibleProperty
   */
  constructor( primaryNode, secondaryNode, secondaryMassVisibleProperty ) {

    const rightAlignGroup = new AlignGroup( {
      matchVertical: false
    } );
    const rightAlignBoxOptions = {
      xAlign: 'left'
    };

    const primaryContent = rightAlignGroup.createBox( primaryNode, rightAlignBoxOptions );
    const secondaryContent = rightAlignGroup.createBox( secondaryNode, rightAlignBoxOptions );

    const separator = new HSeparator( rightAlignGroup.maxWidth );
    rightAlignGroup.maxWidthProperty.link( maxWidth => {
      separator.x2 = maxWidth;
    } );

    const box = new VBox( {
      spacing: 10
    } );
    secondaryMassVisibleProperty.link( secondaryVisible => {
      box.children = secondaryVisible ? [ primaryContent, separator, secondaryContent ] : [ primaryContent ];
    } );

    super( box, DensityBuoyancyCommonConstants.PANEL_OPTIONS );
  }

  static getPrimaryLabelNode() {
    return new Node( {
      children: [ MassLabelNode.PRIMARY_LABEL ],
      scale: 0.7
    } );
  }

  static getSecondaryLabelNode() {
    return new Node( {
      children: [ MassLabelNode.SECONDARY_LABEL ],
      scale: 0.7
    } );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryPanelsNode', PrimarySecondaryPanelsNode );
export default PrimarySecondaryPanelsNode;