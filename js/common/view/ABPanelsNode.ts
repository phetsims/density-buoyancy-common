// Copyright 2019-2024, University of Colorado Boulder

/**
 * A Panel with primary/secondary nodes, called A and B.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import { Node } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MultiSectionPanelsNode from './MultiSectionPanelsNode.js';
import MassTagNode from './MassTagNode.js';
import MassTag from '../model/MassTag.js';

export default class ABPanelsNode extends MultiSectionPanelsNode {

  public constructor( nodeA: Node, nodeB: Node ) {
    super( [
      nodeA,
      nodeB
    ] );
  }

  /**
   * Returns a Node that displays the "primary mass" tag label.
   * TODO: Change these function name as well https://github.com/phetsims/density-buoyancy-common/issues/182
   */
  public static getPrimaryTagLabelNode(): Node {
    return new Node( {
      children: [ new MassTagNode( MassTag.OBJECT_A, 40 ) ],
      scale: 1.3
    } );
  }

  /**
   * Returns a Node that displays the "secondary mass" tag label.
   */
  public static getSecondaryTagLabelNode(): Node {
    return new Node( {
      children: [ new MassTagNode( MassTag.OBJECT_B, 40 ) ],
      scale: 1.3
    } );
  }
}

densityBuoyancyCommon.register( 'ABPanelsNode', ABPanelsNode );