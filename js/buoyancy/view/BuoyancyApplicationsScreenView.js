// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const Boat = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Boat' );
  const BuoyancyApplicationsModel = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/BuoyancyApplicationsModel' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityControlNode' );
  const DensityReadoutListNode = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/view/DensityReadoutListNode' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DisplayOptionsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DisplayOptionsNode' );
  const DynamicProperty = require( 'AXON/DynamicProperty' );
  const HSeparator = require( 'SUN/HSeparator' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const MaterialMassVolumeControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/MaterialMassVolumeControlNode' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector3 = require( 'DOT/Vector3' );

  // strings
  const airVolumeString = require( 'string!DENSITY_BUOYANCY_COMMON/airVolume' );
  const boatVolumeString = require( 'string!DENSITY_BUOYANCY_COMMON/boatVolume' );
  const densityString = require( 'string!DENSITY_BUOYANCY_COMMON/density' );
  const litersPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/litersPattern' );
  const materialInsideString = require( 'string!DENSITY_BUOYANCY_COMMON/materialInside' );

  // constants
  const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

  class BuoyancyApplicationsScreenView extends DensityBuoyancyScreenView {

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

      // For clipping planes in BottleView
      this.sceneNode.stage.threeRenderer.localClippingEnabled = true;

      const boatGeometry = Boat.getPrimaryGeometry( 10 );

      // @private {THREE.Mesh}
      this.boatMesh = new THREE.Mesh( boatGeometry, new THREE.MeshLambertMaterial( {
      // const boatMesh = new THREE.Mesh( boatGeometry, new THREE.MeshBasicMaterial( {
      // const boatMesh = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 32, 32 ), new THREE.MeshBasicMaterial( {
        // side: THREE.DoubleSide,
        color: 0xffaa44
      } ) );
      // this.sceneNode.stage.threeScene.add( this.boatMesh );

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

      const airVolumeLabel = new Text( airVolumeString, { font: new PhetFont( 12 ) } );

      const airLitersProperty = new DerivedProperty( [ model.bottle.interiorVolumeProperty ], volume => {
        return ( 0.01 - volume ) * 1000;
      } );

      const bottleBox = new VBox( {
        spacing: 10,
        align: 'left',
        children: [
          new Text( materialInsideString, {
            font: DensityBuoyancyCommonConstants.TITLE_FONT
          } ),
          bottleControl,
          new HSeparator( bottleControl.width ),
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

      const rightBottleContent = new AlignBox( new Panel( bottleBox, {
        xMargin: 10,
        yMargin: 10,
        resize: true
      } ), {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'bottom',
        xMargin: 10,
        yMargin: 60
      } );

      const blockControlNode = new MaterialMassVolumeControlNode( model.block.materialProperty, model.block.massProperty, model.block.volumeProperty, [
        Material.PYRITE,
        Material.STEEL,
        Material.SILVER,
        Material.TANTALUM,
        Material.GOLD,
        Material.PLATINUM
      ], cubicMeters => model.block.updateSize( Cuboid.boundsFromVolume( cubicMeters ) ), this.popupLayer );

      const boatBox = new VBox( {
        spacing: 10,
        align: 'left',
        children: [
          blockControlNode,
          new HSeparator( blockControlNode.width ),
          new NumberControl( boatVolumeString, new DynamicProperty( new Property( model.boat.displacementVolumeProperty ), {
            map: cubicMeters => 1000 * cubicMeters,
            inverseMap: liters => liters / 1000,
            bidirectional: true
          } ), new Range( 0, 20 ), merge( {
            numberDisplayOptions: {
              valuePattern: StringUtils.fillIn( litersPatternString, {
                liters: '{{value}}'
              } )
            }
          }, MaterialMassVolumeControlNode.getNumberControlOptions() ) )
        ]
      } );

      const rightBoatContent = new AlignBox( new Panel( boatBox, {
        xMargin: 10,
        yMargin: 10,
        resize: true
      } ), {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'bottom',
        xMargin: 10,
        yMargin: 60
      } );

      this.addChild( rightBottleContent );
      this.addChild( rightBoatContent );
      model.sceneProperty.link( scene => {
        rightBottleContent.visible = scene === BuoyancyApplicationsModel.Scene.BOTTLE;
        rightBoatContent.visible = scene === BuoyancyApplicationsModel.Scene.BOAT;
      } );

      const densityControlPanel = new Panel( new DensityControlNode( model.liquidMaterialProperty, [
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
      } );
      this.addChild( densityControlPanel );

      const displayOptionsNode = new DisplayOptionsNode( model );

      const densityContainer = new VBox( {
        spacing: 0,
        children: [
          new HStrut( displayOptionsNode.width - 10 ), // Same internal size as displayOptionsNode
          new DensityReadoutListNode( [
            model.bottle.interiorMaterialProperty,
            model.bottle.materialProperty
          ] )
        ]
      } );

      const densityBox = new AccordionBox( densityContainer, {
        titleNode: new Text( densityString, { font: DensityBuoyancyCommonConstants.TITLE_FONT } ),
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

      this.addChild( new RadioButtonGroup( model.sceneProperty, [
        {
          value: BuoyancyApplicationsModel.Scene.BOTTLE,
          node: new Text( '(bottle)' )
        },
        {
          value: BuoyancyApplicationsModel.Scene.BOAT,
          node: new Text( '(boat)' )
        }
      ], {
        orientation: 'horizontal',
        buttonContentXMargin: 10,
        buttonContentYMargin: 10,
        selectedLineWidth: 2,
        deselectedLineWidth: 1.5,
        touchAreaXDilation: 6,
        touchAreaYDilation: 6,
        selectedStroke: DensityBuoyancyCommonColorProfile.radioBorderProperty,
        baseColor: DensityBuoyancyCommonColorProfile.radioBackgroundProperty,

        bottom: this.layoutBounds.bottom - MARGIN,
        left: densityControlPanel.right + MARGIN
      } ) );

      this.addChild( this.popupLayer );
    }

    // TODO: remove
    step( dt ) {
      super.step( dt );

      this.boatMesh.rotation.y += dt * 0.5;
      this.boatMesh.rotation.x += dt * 0.1;
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );
} );
