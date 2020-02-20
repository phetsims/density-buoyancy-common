// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const HSeparator = require( 'SUN/HSeparator' );
  const MassLabelNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassLabelNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const VBox = require( 'SCENERY/nodes/VBox' );

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

  return densityBuoyancyCommon.register( 'PrimarySecondaryPanelsNode', PrimarySecondaryPanelsNode );
} );
