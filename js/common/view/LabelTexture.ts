// Copyright 2020-2022, University of Colorado Boulder

/**
 * A wrapper for NodeTexture that scales it up and uses power-of-2 dimensions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import { Node, Utils } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export default class LabelTexture extends NodeTexture {

  private readonly containerNode: Node;

  public constructor( labelNode: Node ) {
    const containerNode = new Node( {
      children: [ labelNode ],
      scale: 2
    } );
    const width = Utils.toPowerOf2( Math.ceil( containerNode.width ) );
    const height = Utils.toPowerOf2( Math.ceil( containerNode.height ) );

    super( containerNode, width, height );

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
