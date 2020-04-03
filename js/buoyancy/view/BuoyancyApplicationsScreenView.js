// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Cuboid from '../../common/model/Cuboid.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColorProfile from '../../common/view/DensityBuoyancyCommonColorProfile.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import DensityControlNode from '../../common/view/DensityControlNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import MaterialMassVolumeControlNode from '../../common/view/MaterialMassVolumeControlNode.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Boat from '../model/Boat.js';
import BuoyancyApplicationsModel from '../model/BuoyancyApplicationsModel.js';
import DensityReadoutListNode from './DensityReadoutListNode.js';

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

    const airVolumeLabel = new Text( densityBuoyancyCommonStrings.airVolume, {
      font: new PhetFont( 12 ),
      maxWidth: 160
    } );

    const airLitersProperty = new DerivedProperty( [ model.bottle.interiorVolumeProperty ], volume => {
      return ( 0.01 - volume ) * 1000;
    } );

    const bottleBox = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new Text( densityBuoyancyCommonStrings.materialInside, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        bottleControl,
        new HSeparator( bottleControl.width ),
        new Node( {
          children: [
            airVolumeLabel,
            new AlignBox( new NumberDisplay( airLitersProperty, new Range( 0, 10 ), {
              valuePattern: StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
                liters: '{{value}}'
              } ),
              decimalPlaces: 2,
              textOptions: {
                font: new PhetFont( 12 ),
                maxWidth: 120
              }
            } ), {
              alignBounds: airVolumeLabel.bounds.withMaxX( bottleControl.width ),
              xAlign: 'right',
              yAlign: 'center'
            } )
          ]
        } )
      ]
    } );

    const rightBottleContent = new AlignBox( new Panel( bottleBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS ), {
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
        new NumberControl( densityBuoyancyCommonStrings.boatVolume, new DynamicProperty( new Property( model.boat.displacementVolumeProperty ), {
          map: cubicMeters => 1000 * cubicMeters,
          inverseMap: liters => liters / 1000,
          bidirectional: true
        } ), new Range( 0, 20 ), merge( {
          numberDisplayOptions: {
            valuePattern: StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
              liters: '{{value}}'
            } ),
            textOptions: {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: 120
            }
          }
        }, MaterialMassVolumeControlNode.getNumberControlOptions() ) )
      ]
    } );

    const rightBoatContent = new AlignBox( new Panel( boatBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS ), {
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
    ], this.popupLayer ), merge( {
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - MARGIN
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );
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

    const densityBox = new AccordionBox( densityContainer, merge( {
      titleNode: new Text( densityBuoyancyCommonStrings.density, {
        maxWidth: 160,
        font: DensityBuoyancyCommonConstants.TITLE_FONT
      } ),
      expandedProperty: model.densityReadoutExpandedProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new VBox( {
      spacing: 10,
      children: [
        densityBox,
        new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS )
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

    if ( !this.enabled ) {
      return;
    }

    this.boatMesh.rotation.y += dt * 0.5;
    this.boatMesh.rotation.x += dt * 0.1;
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );
export default BuoyancyApplicationsScreenView;