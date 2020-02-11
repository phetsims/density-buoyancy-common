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
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityControlNode' );
  const DensityReadoutListNode = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/view/DensityReadoutListNode' );
  const DisplayOptionsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DisplayOptionsNode' );
  const DynamicProperty = require( 'AXON/DynamicProperty' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Panel = require( 'SUN/Panel' );
  const PrimarySecondaryPanelsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/PrimarySecondaryPanelsNode' );
  const Property = require( 'AXON/Property' );
  const ShapeSizeControlNode = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/view/ShapeSizeControlNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector3 = require( 'DOT/Vector3' );

  // strings
  const densityString = require( 'string!DENSITY_BUOYANCY_COMMON/density' );
  const secondShapeString = require( 'string!DENSITY_BUOYANCY_COMMON/secondShape' );

  // constants
  const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

  class BuoyancyShapesScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {BuoyancyIntroModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem, {
        cameraLookAt: new Vector3( 0, -0.18, 0 )
      } );

      if ( !this.enabled ) {
        return this;
      }

      const densityControlPanel = new Panel( new DensityControlNode( model.liquidMaterialProperty, [
        Material.AIR,
        Material.GASOLINE,
        Material.WATER,
        Material.SEAWATER,
        Material.HONEY,
        Material.MERCURY,
        Material.DENSITY_R,
        Material.DENSITY_S
      ], this.popupLayer ), {
        xMargin: 10,
        yMargin: 10,
        centerX: this.layoutBounds.centerX,
        bottom: this.layoutBounds.bottom - MARGIN
      } );
      this.addChild( densityControlPanel );

      const displayOptionsNode = new DisplayOptionsNode( model );

      const densityContainer = new VBox( {
        spacing: 0,
        children: [
          new HStrut( displayOptionsNode.width - 10 ), // Same internal size as displayOptionsNode
          new DensityReadoutListNode( [ new Property( Material.WOOD ) ] )
        ]
      } );

      // TODO: check common accordion box styles
      const densityBox = new AccordionBox( densityContainer, {
        titleNode: new Text( densityString, { font: DensityBuoyancyCommonConstants.TITLE_FONT } ),
        expandedProperty: model.densityReadoutExpandedProperty,
        fill: 'white',
        titleYMargin: 5,
        buttonXMargin: 5,
        titleAlignX: 'left',
        cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS
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

      const primarySecondaryPanelsNode = new PrimarySecondaryPanelsNode(
        new ShapeSizeControlNode(
          model.primaryShapeProperty,
          model.primaryWidthRatioProperty,
          model.primaryHeightRatioProperty,
          new DynamicProperty( model.primaryMassProperty, {
            derive: 'volumeProperty'
          } ),
          this.popupLayer,
          { labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode() }
        ),
        new ShapeSizeControlNode(
          model.secondaryShapeProperty,
          model.secondaryWidthRatioProperty,
          model.secondaryHeightRatioProperty,
          new DynamicProperty( model.secondaryMassProperty, {
            derive: 'volumeProperty'
          } ),
          this.popupLayer,
          { labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode() }
        ),
        secondShapeString,
        model.secondaryMassVisibleProperty
      );

      this.addChild( new AlignBox( primarySecondaryPanelsNode, {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'top',
        margin: MARGIN
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyShapesScreenView', BuoyancyShapesScreenView );
} );
