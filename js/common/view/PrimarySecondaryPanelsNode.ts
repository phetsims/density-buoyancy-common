// Copyright 2019-2024, University of Colorado Boulder

/**
 * A Panel with primary/secondary nodes
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import { Node } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MultiSectionPanelsNode from './MultiSectionPanelsNode.js';
import MassTagNode from './MassTagNode.js';
import MassTag from '../model/MassTag.js';

export default class PrimarySecondaryPanelsNode extends MultiSectionPanelsNode {

  public constructor( primaryNode: Node, secondaryNode: Node ) {
    super( [
      primaryNode,
      secondaryNode
    ] );
  }

  /**
   * Returns a Node that displays the "primary mass" tag label.
   */
  public static getPrimaryTagLabelNode(): Node {
    return new Node( {
      children: [ new MassTagNode( MassTag.PRIMARY, 40 ) ],
      scale: 1.3
    } );
  }

  /**
   * Returns a Node that displays the "secondary mass" tag label.
   */
  public static getSecondaryTagLabelNode(): Node {
    return new Node( {
      children: [ new MassTagNode( MassTag.SECONDARY, 40 ) ],
      scale: 1.3
    } );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryPanelsNode', PrimarySecondaryPanelsNode );