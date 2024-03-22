// Copyright 2020-2024, University of Colorado Boulder

/**
 * A wrapper for NodeTexture that scales it up and uses power-of-2 dimensions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import { Node } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export default class LabelTexture extends NodeTexture {

  private readonly containerNode: Node;

  public constructor( labelNode: Node ) {
    const containerNode = new Node( {
      children: [ labelNode ],
      scale: 2
    } );

    super( containerNode, {
      calculateDimensionFromNode: true
    } );

    this.containerNode = containerNode;
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.containerNode.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'LabelTexture', LabelTexture );