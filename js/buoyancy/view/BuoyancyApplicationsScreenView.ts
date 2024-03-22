// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import UnitConversionProperty from '../../../../axon/js/UnitConversionProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import resetArrow_png from '../../../../scenery-phet/images/resetArrow_png.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, Color, HBox, HSeparator, Image, ManualConstraint, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Cube from '../../common/model/Cube.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import LiquidDensityControlNode from '../../common/view/LiquidDensityControlNode.js';
import BuoyancyDisplayOptionsNode from '../../common/view/BuoyancyDisplayOptionsNode.js';
import MaterialMassVolumeControlNode from '../../common/view/MaterialMassVolumeControlNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyApplicationsModel, { Scene } from '../model/BuoyancyApplicationsModel.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import BoatView from './BoatView.js';
import BottleView from './BottleView.js';
import DensityBuoyancyCommonQueryParameters from '../../common/DensityBuoyancyCommonQueryParameters.js';
import bottle_icon_png from '../../../images/bottle_icon_png.js';
import boat_icon_png from '../../../images/boat_icon_png.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;
const ICON_SCALE = 0.1;
const ICON_IMAGE_SCALE = new Vector2( ICON_SCALE, -ICON_SCALE );


export default class BuoyancyApplicationsScreenView extends DensityBuoyancyScreenView<BuoyancyApplicationsModel> {

  private positionResetSceneButton: () => void;

  public constructor( model: BuoyancyApplicationsModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    // For clipping planes in BottleView
    if ( this.sceneNode.stage.threeRenderer ) {
      this.sceneNode.stage.threeRenderer.localClippingEnabled = true;
    }

    const resetSceneButton = new RectangularPushButton( {
      content: new Node( {
        children: [
          new Image( resetArrow_png, { scale: 0.3 } )
        ]
      } ),
      xMargin: 5,
      yMargin: 3,
      baseColor: new Color( 220, 220, 220 ),
      listener: () => {
        model.resetBoatScene();
      },
      visibleProperty: new DerivedProperty( [ model.sceneProperty ], scene => scene === Scene.BOAT )
    } );
    this.addChild( resetSceneButton );

    this.positionResetSceneButton = () => {
      resetSceneButton.rightTop = this.modelToViewPoint( new Vector3(
        this.model.poolBounds.maxX,
        this.model.poolBounds.minY,
        this.model.poolBounds.maxZ
      ) ).plusXY( 0, 5 );
    };
    this.transformEmitter.addListener( this.positionResetSceneButton );
    this.positionResetSceneButton();

    const bottleControlNode = new MaterialMassVolumeControlNode( model.bottle.interiorMaterialProperty, model.bottle.interiorMassProperty, model.bottle.interiorVolumeProperty, [
      Material.GASOLINE,
      Material.OIL,
      Material.WATER,
      Material.SAND,
      Material.CONCRETE,
      Material.COPPER
    ], volume => model.bottle.interiorVolumeProperty.set( volume ), this.popupLayer, {
      minMass: 0,
      maxCustomMass: 100,
      maxMass: 100,
      minVolumeLiters: 0,
      maxVolumeLiters: 10,
      minCustomVolumeLiters: 0.5,
      tandem: tandem.createTandem( 'bottleControlNode' )
    } );

    const airVolumeLabel = new Text( DensityBuoyancyCommonStrings.airVolumeStringProperty, {
      font: DensityBuoyancyCommonConstants.READOUT_FONT,
      maxWidth: 160
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const airLitersProperty = new DerivedProperty( [ model.bottle.interiorVolumeProperty ], volume => {
      return ( 0.01 - volume ) * 1000;
    } );

    const bottleBox = new VBox( {
      spacing: 10,
      align: 'left',
      stretch: true,
      children: [
        new Text( DensityBuoyancyCommonStrings.materialInsideStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        bottleControlNode,
        new HSeparator(),
        new HBox( {
          spacing: 5,
          children: [
            airVolumeLabel,
            new NumberDisplay( airLitersProperty, new Range( 0, 10 ), {
              valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
              useRichText: true,
              decimalPlaces: 2,
              textOptions: {
                font: new PhetFont( 12 ),
                maxWidth: 120
              }
            } )
          ]
        } )
      ]
    } );

    const rightBottleContent = new Panel( bottleBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    const boatControlNode = new MaterialMassVolumeControlNode( model.block.materialProperty, model.block.massProperty, model.block.volumeProperty, _.sortBy( [
        Material.PYRITE,
        Material.STEEL,
        Material.SILVER,
        Material.TANTALUM,
        Material.GOLD,
        Material.PLATINUM
      ].concat( DensityBuoyancyCommonConstants.SIMPLE_MASS_MATERIALS ),
      material => material.density ).concat( [ // Adding Mystery Materials at the end so they aren't sorted by density
      Material.MATERIAL_V,
      Material.MATERIAL_W
    ] ), cubicMeters => model.block.updateSize( Cube.boundsFromVolume( cubicMeters ) ), this.popupLayer, {
      tandem: tandem.createTandem( 'boatControlNode' ),
      highDensityMaxMass: 215
    } );

    const boatVolumeRange = new Range( 5, 30 );
    const boatBox = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        boatControlNode,
        new HSeparator(),
        // Convert cubic meters => liters
        new NumberControl( DensityBuoyancyCommonStrings.boatVolumeStringProperty, new UnitConversionProperty( model.boat.displacementVolumeProperty, {
          factor: 1000
        } ), boatVolumeRange, combineOptions<NumberControlOptions>( {
          numberDisplayOptions: {
            valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
            useRichText: true,
            textOptions: {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: 120
            },
            useFullHeight: true
          }
        }, MaterialMassVolumeControlNode.getNumberControlOptions(), {
          sliderOptions: {
            trackSize: new Dimension2( 120, 0.5 ),
            thumbSize: DensityBuoyancyCommonConstants.THUMB_SIZE,
            constrainValue: ( value: number ) => {
              return boatVolumeRange.constrainValue( Utils.roundToInterval( value, 0.1 ) );
            },
            phetioLinkedProperty: model.boat.displacementVolumeProperty,
            majorTickLength: 5,
            majorTicks: [ {
              value: boatVolumeRange.min,
              label: new Text( boatVolumeRange.min, { font: new PhetFont( 12 ), maxWidth: 50 } )
            }, {
              value: boatVolumeRange.max,
              label: new Text( boatVolumeRange.max, { font: new PhetFont( 12 ), maxWidth: 50 } )
            } ]
          }
        } ) )
      ]
    } );

    const rightBoatContent = new Panel( boatBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    const densityBox = new DensityAccordionBox( {
      expandedProperty: model.densityExpandedProperty,
      contentWidthMax: boatBox.width
    } );

    const submergedBox = new SubmergedAccordionBox( model.gravityProperty, model.liquidMaterialProperty, {
      readoutItems: [ {
        readoutItem: model.block
      } ],
      contentWidthMax: boatBox.width
    } );

    const rightSideVBox = new VBox( {
      spacing: 10,
      align: 'right',
      excludeInvisibleChildrenFromBounds: true,
      children: [
        rightBottleContent,
        rightBoatContent,
        densityBox,
        submergedBox
      ]
    } );

    this.addChild( new AlignBox( rightSideVBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.sceneProperty.link( scene => {
      rightBottleContent.visible = scene === Scene.BOTTLE;
      rightBoatContent.visible = scene === Scene.BOAT;
    } );

    const displayedMysteryMaterials = [
      Material.DENSITY_E,
      Material.DENSITY_F
    ];

    const invisibleMaterials = [ ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );

    const densityControlPanel = new Panel( new LiquidDensityControlNode( model.liquidMaterialProperty, [
      ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS,
      ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS
    ], this.popupLayer, {
      invisibleMaterials: invisibleMaterials,
      tandem: tandem.createTandem( 'densityControlNode' )
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( densityControlPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const displayOptionsNode = new BuoyancyDisplayOptionsNode( model );

    model.sceneProperty.link( scene => {
      const materials = scene === Scene.BOTTLE ? [
        model.bottle.interiorMaterialProperty,
        model.bottle.materialProperty
      ] : scene === Scene.BOAT ? [
        model.block.materialProperty,
        model.boat.materialProperty
      ] : [];
      assert && assert( materials.length > 0, 'unsupported Scene', scene );
      densityBox.setReadoutItems( materials.map( material => {
        return { readoutItem: material };
      } ) );
      const submergedObjects = scene === Scene.BOTTLE ?
        [ {
          readoutItem: model.bottle,
          readoutNameProperty: DensityBuoyancyCommonStrings.bottleStringProperty
        } ] :
        [ {
          readoutItem: model.block,
          readoutNameProperty: DensityBuoyancyCommonStrings.shape.blockStringProperty
        }
        ];
      submergedBox.setReadoutItems( submergedObjects );
    } );


    this.addChild( new AlignBox( new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS ), {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const bottleBoatSelectionNode = new RectangularRadioButtonGroup( model.sceneProperty, [
      {
        value: Scene.BOTTLE,
        createNode: () => DensityBuoyancyCommonQueryParameters.generateIconImages ?
                          BuoyancyApplicationsScreenView.getBottleIcon() : new Image( bottle_icon_png, { scale: ICON_IMAGE_SCALE } )
      },
      {
        value: Scene.BOAT,
        createNode: () => DensityBuoyancyCommonQueryParameters.generateIconImages ?
                          BuoyancyApplicationsScreenView.getBoatIcon() : new Image( boat_icon_png, { scale: ICON_IMAGE_SCALE } )
      }
    ], {
      orientation: 'horizontal',
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        baseColor: DensityBuoyancyCommonColors.radioBackgroundColorProperty,
        xMargin: 10,
        yMargin: 10,
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2,
          deselectedLineWidth: 1.5,
          selectedStroke: DensityBuoyancyCommonColors.radioBorderColorProperty
        }
      }
    } );
    this.addChild( bottleBoatSelectionNode );

    ManualConstraint.create( this, [ densityControlPanel, bottleBoatSelectionNode ], ( panelWrapper, selectionWrapper ) => {
      selectionWrapper.bottom = panelWrapper.bottom;
      selectionWrapper.left = panelWrapper.right + MARGIN;
    } );

    this.addChild( this.popupLayer );
  }

  public override step( dt: number ): void {
    super.step( dt );

    this.positionResetSceneButton();
  }

  public static getBoatIcon(): Node {
    if ( !ThreeUtils.isWebGLEnabled() ) {
      return DensityBuoyancyScreenView.getFallbackIcon();
    }

    // Hard coded zoom and view-port vector help to center the icon.
    const angledIcon = DensityBuoyancyScreenView.getAngledIcon( 6, new Vector3( -0.03, 0, 0 ), scene => {
      scene.add( BoatView.getBoatDrawingData().group );
    }, null );

    angledIcon.setScaleMagnitude( ICON_SCALE );

    return angledIcon;
  }

  public static getBottleIcon(): Node {
    if ( !ThreeUtils.isWebGLEnabled() ) {
      return DensityBuoyancyScreenView.getFallbackIcon();
    }

    // Hard coded zoom and view-port vector help to center the icon.
    const angledIcon = DensityBuoyancyScreenView.getAngledIcon( 3.4, new Vector3( -0.02, 0, 0 ), scene => {
      scene.add( BottleView.getBottleDrawingData().group );
    }, null );

    angledIcon.setScaleMagnitude( ICON_SCALE );

    return angledIcon;
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );