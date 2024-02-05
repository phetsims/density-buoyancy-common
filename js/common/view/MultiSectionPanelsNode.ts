// Copyright 2019-2022, University of Colorado Boulder

/**
 * A Panel with nodes that are separated by an HSeparator. When nodes are hidden, so will any HSeparators that are
 * no longer needed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { FlowBox, HSeparator, Node } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import interleave from '../../../../phet-core/js/interleave.js';

export default class MultiSectionPanelsNode extends Panel {

  public constructor( nodes: Node[] ) {

    const children = interleave( nodes, () => new HSeparator() );

    super( new FlowBox( {
      spacing: 10,
      orientation: 'vertical',
      align: 'left',
      children: children
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );
  }
}

densityBuoyancyCommon.register( 'MultiSectionPanelsNode', MultiSectionPanelsNode );
