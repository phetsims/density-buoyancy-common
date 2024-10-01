// Copyright 2024, University of Colorado Boulder

/**
 * A Panel with nodes that are separated by an HSeparator. When nodes are hidden, so will any HSeparators that are
 * no longer needed.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import interleave from '../../../../phet-core/js/interleave.js';
import { EmptySelfOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import { FlowBox, HSeparator, Node } from '../../../../scenery/js/imports.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';

export type MultiSectionPanelsNodeOptions = PanelOptions;

export default class MultiSectionPanelsNode extends Panel {

  // Don't use the _content from Panel (says JO)
  public readonly content: Node;

  public constructor( nodes: Node[], providedOptions?: MultiSectionPanelsNodeOptions ) {

    const options = optionize3<MultiSectionPanelsNodeOptions, EmptySelfOptions, PanelOptions>()( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, providedOptions );

    const children = interleave( nodes, () => new HSeparator() );

    const content = new FlowBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING,
      orientation: 'vertical',
      align: 'left',
      children: children
    } );
    super( content, options );
    this.content = content;
  }
}

densityBuoyancyCommon.register( 'MultiSectionPanelsNode', MultiSectionPanelsNode );