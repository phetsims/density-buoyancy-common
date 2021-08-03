// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignPropertyBox from '../../../../scenery/js/layout/AlignPropertyBox.js';
import ManualConstraint from '../../../../scenery/js/layout/ManualConstraint.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import Panel from '../../../../sun/js/Panel.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Cuboid from '../../common/model/Cuboid.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import DensityControlNode from '../../common/view/DensityControlNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import MaterialMassVolumeControlNode from '../../common/view/MaterialMassVolumeControlNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
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

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    // For clipping planes in BottleView
    this.sceneNode.stage.threeRenderer.localClippingEnabled = true;

    const bottleControlNode = new MaterialMassVolumeControlNode( model.bottle.interiorMaterialProperty, model.bottle.interiorMassProperty, model.bottle.interiorVolumeProperty, [
      Material.GASOLINE,
      Material.OIL,
      Material.WATER,
      Material.SAND,
      Material.CEMENT,
      Material.COPPER,
      Material.LEAD,
      Material.MERCURY
    ], volume => model.bottle.interiorVolumeProperty.set( volume ), this.popupLayer, tandem.createTandem( 'bottleControlNode' ), {
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
        bottleControlNode,
        new HSeparator( bottleControlNode.width ),
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
              alignBounds: airVolumeLabel.bounds.withMaxX( bottleControlNode.width ),
              xAlign: 'right',
              yAlign: 'center'
            } )
          ]
        } )
      ]
    } );

    const rightBottleContent = new AlignPropertyBox( new Panel( bottleBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS ), this.visibleBoundsProperty, {
      xAlign: 'right',
      yAlign: 'bottom',
      xMargin: 10,
      yMargin: 60
    } );

    const blockControlNode = new MaterialMassVolumeControlNode( model.block.materialProperty, model.block.massProperty, model.block.volumeProperty, _.sortBy( [
      Material.PYRITE,
      Material.STEEL,
      Material.SILVER,
      Material.TANTALUM,
      Material.GOLD,
      Material.PLATINUM,
      Material.STYROFOAM,
      Material.WOOD,
      Material.ICE,
      Material.BRICK,
      Material.ALUMINUM
    ], material => material.density ), cubicMeters => model.block.updateSize( Cuboid.boundsFromVolume( cubicMeters ) ), this.popupLayer, tandem.createTandem( 'blockControlNode' ) );

    const boatVolumeRange = new Range( 1, 20 );
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
        } ), boatVolumeRange, merge( {
          numberDisplayOptions: {
            valuePattern: StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
              liters: '{{value}}'
            } ),
            textOptions: {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: 120
            },
            useFullHeight: true
          },
          sliderOptions: {
            constrainValue: value => {
              return boatVolumeRange.constrainValue( Utils.roundToInterval( value, 0.1 ) );
            }
          }
        }, MaterialMassVolumeControlNode.getNumberControlOptions() ) )
      ]
    } );

    const rightBoatContent = new AlignPropertyBox( new Panel( boatBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS ), this.visibleBoundsProperty, {
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
      Material.GASOLINE,
      Material.WATER,
      Material.SEAWATER,
      Material.HONEY,
      Material.MERCURY,
      Material.DENSITY_P,
      Material.DENSITY_Q
    ], this.popupLayer ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignPropertyBox( densityControlPanel, this.visibleBoundsProperty, {
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

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

    this.addChild( new AlignPropertyBox( new VBox( {
      spacing: 10,
      children: [
        densityBox,
        new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ]
    } ), this.visibleBoundsProperty, {
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const bottleBoatSelectionNode = new RectangularRadioButtonGroup( model.sceneProperty, [
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
      selectedStroke: DensityBuoyancyCommonColors.radioBorderColorProperty,
      baseColor: DensityBuoyancyCommonColors.radioBackgroundColorProperty
    } );
    this.addChild( bottleBoatSelectionNode );

    ManualConstraint.create( this, [ densityControlPanel, bottleBoatSelectionNode ], ( panelWrapper, selectionWrapper ) => {
      selectionWrapper.bottom = panelWrapper.bottom;
      selectionWrapper.left = panelWrapper.right + MARGIN;
    } );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );
export default BuoyancyApplicationsScreenView;