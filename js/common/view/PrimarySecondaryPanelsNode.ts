// Copyright 2019-2022, University of Colorado Boulder

/**
 * A Panel with primary/secondary nodes, where the primary one is always shown, and the secondary one is conditionally
 * shown based on a boolean Property.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { FlowBox, Node, VDivider } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import { PRIMARY_LABEL, SECONDARY_LABEL } from './MassLabelNode.js';

class PrimarySecondaryPanelsNode extends Panel {

  constructor( primaryNode: Node, secondaryNode: Node ) {
    super( new FlowBox( {
      spacing: 10,
      orientation: 'vertical',
      align: 'left',
      children: [
        primaryNode,
        new VDivider(),
        secondaryNode
      ]
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );
  }

  /**
   * Returns a Node that displays the "primary mass" label.
   */
  static getPrimaryLabelNode(): Node {
    return new Node( {
      children: [ PRIMARY_LABEL ],
      scale: 0.7
    } );
  }

  /**
   * Returns a Node that displays the "secondary mass" label.
   */
  static getSecondaryLabelNode(): Node {
    return new Node( {
      children: [ SECONDARY_LABEL ],
      scale: 0.7
    } );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryPanelsNode', PrimarySecondaryPanelsNode );
export default PrimarySecondaryPanelsNode;