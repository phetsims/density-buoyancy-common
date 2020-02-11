// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const Checkbox = require( 'SUN/Checkbox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const MassLabelNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassLabelNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  class PrimarySecondaryPanelsNode extends VBox {

    /**
     * @param {Node} primaryNode
     * @param {Node} secondaryNode
     * @param {string} secondaryLabel
     * @param {Property.<boolean>} secondaryMassVisibleProperty
     */
    constructor( primaryNode, secondaryNode, secondaryLabel, secondaryMassVisibleProperty ) {

      const secondaryCheckbox = new Checkbox( new Text( secondaryLabel, {
        font: new PhetFont( 12 )
      } ), secondaryMassVisibleProperty, {
        boxWidth: 15
      } );

      const secondaryBox = new VBox( {
        spacing: 10,
        align: 'left',
        children: [
          secondaryCheckbox,
          secondaryNode
        ]
      } );

      secondaryMassVisibleProperty.link( secondaryVisible => {
        secondaryBox.children = secondaryVisible ? [ secondaryCheckbox, secondaryNode ] : [ secondaryCheckbox ];
      } );

      const rightAlignGroup = new AlignGroup( {
        matchVertical: false
      } );
      const rightAlignBoxOptions = {
        xAlign: 'left'
      };
      const panelOptions = {
        cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
        xMargin: 10,
        yMargin: 10
      };

      super( {
        spacing: 10,
        children: [
          new Panel( rightAlignGroup.createBox( primaryNode, rightAlignBoxOptions ), panelOptions ),
          new Panel( rightAlignGroup.createBox( secondaryBox, rightAlignBoxOptions ), panelOptions )
        ]
      } );
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
