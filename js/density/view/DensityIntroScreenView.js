// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const BlockControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/BlockControlNode' );
  const Checkbox = require( 'SUN/Checkbox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const secondBlockString = require( 'string!DENSITY_BUOYANCY_COMMON/secondBlock' );

  class DensityIntroScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {DensityBuoyancyModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem );

      if ( !this.enabled ) {
        return this;
      }

      const primaryControl = new BlockControlNode( model.primaryMass, this.popupLayer );
      const secondaryControl = new BlockControlNode( model.secondaryMass, this.popupLayer );
      const secondaryCheckbox = new Checkbox( new Text( secondBlockString, {
        font: new PhetFont( 12 )
      } ), model.secondaryMassVisibleProperty, {
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

      model.secondaryMassVisibleProperty.link( secondaryVisible => {
        secondaryBox.children = secondaryVisible ? [ secondaryCheckbox, secondaryControl ] : [ secondaryCheckbox ];
      } );

      const rightAlignGroup = new AlignGroup( {
        matchVertical: false
      } );
      const rightAlignBoxOptions = {
        xAlign: 'left'
      };

      const rightBox = new VBox( {
        spacing: 10,
        children: [
          new Panel( rightAlignGroup.createBox( primaryControl, rightAlignBoxOptions ) ),
          new Panel( rightAlignGroup.createBox( secondaryBox, rightAlignBoxOptions ) )
        ]
      } );

      this.addChild( new AlignBox( rightBox, {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'top',
        xMargin: 10,
        yMargin: 10
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );
} );
