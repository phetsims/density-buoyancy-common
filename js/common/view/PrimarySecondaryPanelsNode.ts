// Copyright 2019-2024, University of Colorado Boulder

/**
 * A Panel with primary/secondary nodes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Node } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { PRIMARY_LABEL, SECONDARY_LABEL } from './MassLabelNode.js';
import MultiSectionPanelsNode from './MultiSectionPanelsNode.js';

export default class PrimarySecondaryPanelsNode extends MultiSectionPanelsNode {

  public constructor( primaryNode: Node, secondaryNode: Node ) {
    super( [
      primaryNode,
      secondaryNode
    ] );
  }

  /**
   * Returns a Node that displays the "primary mass" label.
   */
  public static getPrimaryLabelNode(): Node {
    return new Node( {
      children: [ PRIMARY_LABEL ],
      scale: 0.7
    } );
  }

  /**
   * Returns a Node that displays the "secondary mass" label.
   */
  public static getSecondaryLabelNode(): Node {
    return new Node( {
      children: [ SECONDARY_LABEL ],
      scale: 0.7
    } );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryPanelsNode', PrimarySecondaryPanelsNode );
