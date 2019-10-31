// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityControlNode' );
  const DisplayOptionsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DisplayOptionsNode' );
  const GravityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/GravityControlNode' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PrimarySecondaryControlsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/PrimarySecondaryControlsNode' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const blockAString = require( 'string!DENSITY_BUOYANCY_COMMON/blockA' );
  const blockBString = require( 'string!DENSITY_BUOYANCY_COMMON/blockB' );
  const densityString = require( 'string!DENSITY_BUOYANCY_COMMON/density' );
  const kilogramsPerLiterPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPerLiterPattern' );

  // constants
  const MARGIN = 10;

  class BuoyancyExploreScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {BuoyancyExploreModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem );

      if ( !this.enabled ) {
        return this;
      }

      const displayOptionsNode = new DisplayOptionsNode( model );

      const densityAText = new Text( '', {
        font: new PhetFont( { size: 14, weight: 'bold' } ),
        fill: DensityBuoyancyCommonColorProfile.labelAProperty
      } );
      const densityBText = new Text( '', {
        font: new PhetFont( { size: 14, weight: 'bold' } ),
        fill: DensityBuoyancyCommonColorProfile.labelBProperty
      } );

      model.primaryMass.materialProperty.link( material => {
        // TODO: that string utils fill-in or to-fixed density conversion
        densityAText.text = StringUtils.fillIn( kilogramsPerLiterPatternString, {
          value: Util.toFixed( material.density / 1000, 2 )
        } );
      } );
      model.secondaryMass.materialProperty.link( material => {
        densityBText.text = StringUtils.fillIn( kilogramsPerLiterPatternString, {
          value: Util.toFixed( material.density / 1000, 2 )
        } );
      } );

      // TODO: handle maxWidths here nicely
      const labelAText = new Text( blockAString, { font: new PhetFont( 14 ), maxWidth: 200 } );
      const labelBText = new Text( blockBString, { font: new PhetFont( 14 ), maxWidth: 200 } );

      // vertical alignment
      densityBText.top = densityAText.bottom + 3;
      labelAText.centerY = densityAText.centerY;
      labelBText.centerY = densityBText.centerY;

      // horizontal alignment
      densityAText.x = densityBText.x = Math.max( labelAText.width, labelBText.width ) + 5;

      const densityContainer = new Node( {
        children: [
          labelAText, labelBText,
          densityAText, densityBText,
          new HStrut( displayOptionsNode.width - 10 ) // Same internal size as displayOptionsNode
        ]
      } );

      const densityBox = new AccordionBox( densityContainer, {
        titleNode: new Text( densityString, { font: new PhetFont( { size: 14, weight: 'bold' } ) } ),
        expandedProperty: model.densityReadoutExpandedProperty,
        fill: 'white',
        titleYMargin: 5,
        buttonXMargin: 5,
        titleAlignX: 'left'
      } );

      this.addChild( new VBox( {
        spacing: 10,
        children: [
          densityBox,
          new Panel( displayOptionsNode, {
            xMargin: 10,
            yMargin: 10
          } )
        ],
        left: this.layoutBounds.left + MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( new Panel( new DensityControlNode( model.liquidMaterialProperty, this.popupLayer ), {
        xMargin: 10,
        yMargin: 10,
        right: this.layoutBounds.centerX - MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer ), {
        xMargin: 10,
        yMargin: 10,
        left: this.layoutBounds.centerX + MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      const rightBox = new PrimarySecondaryControlsNode(
        model.primaryMass,
        model.secondaryMass,
        model.secondaryMassVisibleProperty,
        this.popupLayer
      );

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

  return densityBuoyancyCommon.register( 'BuoyancyExploreScreenView', BuoyancyExploreScreenView );
} );
