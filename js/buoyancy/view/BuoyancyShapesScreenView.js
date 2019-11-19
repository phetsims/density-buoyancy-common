// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityControlNode' );
  const DensityReadoutListNode = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/view/DensityReadoutListNode' );
  const DisplayOptionsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DisplayOptionsNode' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector3 = require( 'DOT/Vector3' );

  // strings
  const densityString = require( 'string!DENSITY_BUOYANCY_COMMON/density' );

  // constants
  const MARGIN = 10; // TODO: refactor this out

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

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyShapesScreenView', BuoyancyShapesScreenView );
} );
