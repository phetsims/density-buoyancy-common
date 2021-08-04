// Copyright 2020, University of Colorado Boulder

/**
 * A wrapper for NodeTexture that scales it up and uses power-of-2 dimensions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Utils from '../../../../scenery/js/util/Utils.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class LabelTexture extends NodeTexture {
  /**
   * @param {Node} labelNode
   */
  constructor( labelNode ) {
    const containerNode = new Node( {
      children: [ labelNode ],
      scale: 2
    } );
    const width = Utils.toPowerOf2( Math.ceil( containerNode.width ) );
    const height = Utils.toPowerOf2( Math.ceil( containerNode.height ) );

    super( containerNode, width, height );

    // @private {Node}
    this.containerNode = containerNode;
  }

  /**
   * Releases references
   * @public
   * @override
   */
  dispose() {
    this.containerNode.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'LabelTexture', LabelTexture );
export default LabelTexture;