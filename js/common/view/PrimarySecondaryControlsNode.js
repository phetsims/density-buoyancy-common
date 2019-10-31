// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const BlockControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/BlockControlNode' );
  const Checkbox = require( 'SUN/Checkbox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassLabelNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassLabelNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const secondBlockString = require( 'string!DENSITY_BUOYANCY_COMMON/secondBlock' );

  class PrimarySecondaryControlsNode extends VBox {

    /**
     * @param {Mass} primaryMass
     * @param {Mass} secondaryMass
     * @param {Property.<boolean>} secondaryMassVisibleProperty
     * @param {Node} popupLayer
     */
    constructor( primaryMass, secondaryMass, secondaryMassVisibleProperty, popupLayer ) {

      const primaryControl = new BlockControlNode( primaryMass, popupLayer, {
        labelNode: new Node( {
          children: [ MassLabelNode.PRIMARY_LABEL ],
          scale: 0.7
        } )
      } );
      const secondaryControl = new BlockControlNode( secondaryMass, popupLayer, {
        labelNode: new Node( {
          children: [ MassLabelNode.SECONDARY_LABEL ],
          scale: 0.7
        } )
      } );
      const secondaryCheckbox = new Checkbox( new Text( secondBlockString, {
        font: new PhetFont( 12 )
      } ), secondaryMassVisibleProperty, {
        boxWidth: 15
      } );

      const secondaryBox = new VBox( {
        spacing: 10,
        align: 'left',
        children: [
          secondaryCheckbox,
          secondaryControl
        ]
      } );

      secondaryMassVisibleProperty.link( secondaryVisible => {
        secondaryBox.children = secondaryVisible ? [ secondaryCheckbox, secondaryControl ] : [ secondaryCheckbox ];
      } );

      const rightAlignGroup = new AlignGroup( {
        matchVertical: false
      } );
      const rightAlignBoxOptions = {
        xAlign: 'left'
      };

      super( {
        spacing: 10,
        children: [
          new Panel( rightAlignGroup.createBox( primaryControl, rightAlignBoxOptions ) ),
          new Panel( rightAlignGroup.createBox( secondaryBox, rightAlignBoxOptions ) )
        ]
      } );
    }
  }

  return densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );
} );
