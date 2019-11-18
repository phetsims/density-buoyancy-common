// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityControlNode' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const HSeparator = require( 'SUN/HSeparator' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const MaterialMassVolumeControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/MaterialMassVolumeControlNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const airVolumeString = require( 'string!DENSITY_BUOYANCY_COMMON/airVolume' );
  const litersPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/litersPattern' );
  const materialInsideString = require( 'string!DENSITY_BUOYANCY_COMMON/materialInside' );

  // constants
  const MARGIN = 10; // TODO: refactor to one place

  class BuoyancyApplicationsScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {BuoyancyIntroModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem );

      if ( !this.enabled ) {
        return this;
      }

      // For clipping planes in BottleView
      this.sceneNode.stage.threeRenderer.localClippingEnabled = true;

      const bottleControl = new MaterialMassVolumeControlNode( model.bottle.interiorMaterialProperty, model.bottle.interiorMassProperty, model.bottle.interiorVolumeProperty, [
        Material.GASOLINE,
        Material.OIL,
        Material.WATER,
        Material.SAND,
        Material.CEMENT,
        Material.COPPER,
        Material.LEAD,
        Material.MERCURY
      ], volume => model.bottle.interiorVolumeProperty.set( volume ), this.popupLayer, {
        minMass: 0,
        maxCustomMass: 100,
        maxMass: Material.MERCURY.density * 0.01,

        // TODO: better units?
        minVolumeLiters: 0,
        maxVolumeLiters: 10
      } );

      const bottleControlSeparator = new HSeparator( bottleControl.width );

      const airVolumeLabel = new Text( airVolumeString, { font: new PhetFont( 12 ) } );

      const airLitersProperty = new DerivedProperty( [ model.bottle.interiorVolumeProperty ], volume => {
        return ( 0.01 - volume ) * 1000;
      } );

      const bottleBox = new VBox( {
        spacing: 10,
        align: 'left',
        children: [
          new Text( materialInsideString, {
            font: new PhetFont( 12 )
          } ),
          bottleControl,
          bottleControlSeparator,
          new Node( {
            children: [
              airVolumeLabel,
              new AlignBox( new NumberDisplay( airLitersProperty, new Range( 0, 10 ), {
                valuePattern: StringUtils.fillIn( litersPatternString, {
                  liters: '{{value}}'
                } ),
                decimalPlaces: 2,
                font: new PhetFont( 12 )
              } ), {
                alignBounds: airVolumeLabel.bounds.withMaxX( bottleControl.width ),
                xAlign: 'right',
                yAlign: 'center'
              } )
            ]
          } )
        ]
      } );

      this.addChild( new AlignBox( new Panel( bottleBox, {
        xMargin: 10,
        yMargin: 10,
        resize: true
      } ), {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'bottom',
        xMargin: 10,
        yMargin: 60
      } ) );

      this.addChild( new Panel( new DensityControlNode( model.liquidMaterialProperty, [
        Material.AIR,
        Material.GASOLINE,
        Material.WATER,
        Material.SEAWATER,
        Material.HONEY,
        Material.MERCURY,
        Material.DENSITY_P,
        Material.DENSITY_Q
      ], this.popupLayer ), {
        xMargin: 10,
        yMargin: 10,
        centerX: this.layoutBounds.centerX,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );
} );
