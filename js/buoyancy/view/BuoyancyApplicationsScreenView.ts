// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import UnitConversionProperty from '../../../../axon/js/UnitConversionProperty.js';
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
import FluidDensityControlNode from '../../common/view/FluidDensityControlNode.js';
import BuoyancyDisplayOptionsNode from '../../common/view/BuoyancyDisplayOptionsNode.js';
import MaterialMassVolumeControlNode from '../../common/view/MaterialMassVolumeControlNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyApplicationsModel, { Scene } from '../model/BuoyancyApplicationsModel.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import BottleView from './BottleView.js';
import BoatView from './BoatView.js';
import bottle_icon_png from '../../../images/bottle_icon_png.js';
import boat_icon_png from '../../../images/boat_icon_png.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PrecisionSliderThumb from '../../common/view/PrecisionSliderThumb.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;
const ICON_SCALE = 0.08;

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
      Material.COPPER,
      Material.MATERIAL_R,
      Material.MATERIAL_S
    ], volume => model.bottle.interiorVolumeProperty.set( volume ), this.popupLayer, {
      minMass: 0,
      maxCustomMass: 100,
      maxMass: 100,
      minVolumeLiters: 0,
      maxVolumeLiters: 10,
      minCustomVolumeLiters: 0.5,
      showMassAsReadout: true,
      supportHiddenMaterial: true,
      customKeepsConstantDensity: true,
      tandem: tandem.createTandem( 'bottleControlNode' )
    } );

    const airVolumeLabel = new Text( DensityBuoyancyCommonStrings.airVolumeStringProperty, {
      font: DensityBuoyancyCommonConstants.READOUT_FONT,
      maxWidth: 100
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const airLitersProperty = new DerivedProperty( [ model.bottle.interiorVolumeProperty ], volume => {
      return ( 0.01 - volume ) * 1000;
    } );

    const range = new Range( 0.05, 20 );
    // TODO: reset, https://github.com/phetsims/buoyancy/issues/120
    // TODO: PhET-iO state support, https://github.com/phetsims/buoyancy/issues/120
    const customDensityProperty = new NumberProperty( 1, {
      range: range
    } );
    const customDensityControlVisibleProperty = new DerivedProperty( [ model.bottle.interiorMaterialProperty ], material => material.custom );

    // TODO: best initialValue for this? https://github.com/phetsims/buoyancy/issues/120
    Multilink.lazyMultilink( [ customDensityProperty, customDensityControlVisibleProperty ], density => {
      if ( model.bottle.interiorMaterialProperty.value.custom ) {
        // @ts-expect-error TODO: readonly mass, that will need to change, https://github.com/phetsims/buoyancy/issues/120
        model.bottle.interiorMassProperty.value = density / model.bottle.interiorVolumeProperty.value;
        model.bottle.interiorMaterialProperty.value = Material.createCustomSolidMaterial( {
          density: density * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER,
          densityRange: new Range( 50, 20000 ) // TODO: based on above range, https://github.com/phetsims/buoyancy/issues/120
        } );
      }
    } );

    const customBottleDensityControl = new NumberControl( DensityBuoyancyCommonStrings.densityStringProperty, customDensityProperty, customDensityProperty.range, combineOptions<NumberControlOptions>( {
      visibleProperty: customDensityControlVisibleProperty,
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb() // TODO: Tandem? https://github.com/phetsims/buoyancy/issues/120
      },
      numberDisplayOptions: {
        valuePattern: DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY
      }
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

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
        customBottleDensityControl,
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
                maxWidth: 100
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
      highDensityMaxMass: 215,
      supportHiddenMaterial: true
    } );

    model.block.materialProperty.link( material => {
      if ( material === Material.MATERIAL_V ) {
        model.block.volumeProperty.value = 0.006;
      }
      else if ( material === Material.MATERIAL_W ) {
        model.block.volumeProperty.value = 0.003;
      }
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
            }
          }
        }, MaterialMassVolumeControlNode.getNumberControlOptions(), {
          sliderOptions: {
            thumbNode: new PrecisionSliderThumb(), // TODO: Tandem? https://github.com/phetsims/buoyancy/issues/120
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
          readoutItem: model.boat,
          readoutNameProperty: DensityBuoyancyCommonStrings.boatStringProperty
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
        createNode: () => BuoyancyApplicationsScreenView.getBottleIcon()
      },
      {
        value: Scene.BOAT,
        createNode: () => BuoyancyApplicationsScreenView.getBoatIcon()
      }
    ], {
      orientation: 'horizontal',
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        baseColor: DensityBuoyancyCommonColors.radioBackgroundColorProperty,
        xMargin: 10,
        yMargin: 10
        // buttonAppearanceStrategyOptions: {
        //   selectedLineWidth: 2,
        //   deselectedLineWidth: 1.5,
        //   selectedStroke: DensityBuoyancyCommonColors.radioBorderColorProperty
        // }
      }
    } );

    const fluidDensityControlPanel = new Panel( new FluidDensityControlNode( model.liquidMaterialProperty, [
      ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS,
      ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS
    ], this.popupLayer, {
      invisibleMaterials: invisibleMaterials,
      tandem: tandem.createTandem( 'densityControlNode' )
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( fluidDensityControlPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    ManualConstraint.create( this, [ rightSideVBox, fluidDensityControlPanel, bottleBoatSelectionNode ],
      ( rightSideVBoxWrapper, densityControlPanelWrapper, bottleBoatSelectionNodeWrapper ) => {
        bottleBoatSelectionNodeWrapper.left = rightSideVBoxWrapper.left;
        bottleBoatSelectionNodeWrapper.bottom = densityControlPanelWrapper.bottom;
      } );

    this.addChild( bottleBoatSelectionNode );

    this.addChild( this.popupLayer );
  }

  public override step( dt: number ): void {
    super.step( dt );

    this.positionResetSceneButton();
  }

  public static getBoatIcon(): Node {
    const boatIcon = DensityBuoyancyScreenView.getThreeIcon( boat_icon_png, () => {
      return DensityBuoyancyScreenView.getAngledIcon( 6, new Vector3( -0.03, 0, 0 ), scene => {
        scene.add( BoatView.getBoatDrawingData().group );
      }, null );
    } );
    boatIcon.setScaleMagnitude( ICON_SCALE );
    return boatIcon;
  }

  public static getBottleIcon(): Node {
    const bottle = DensityBuoyancyScreenView.getThreeIcon( bottle_icon_png, () => {
      return DensityBuoyancyScreenView.getAngledIcon( 3.4, new Vector3( -0.02, 0, 0 ), scene => {
        scene.add( BottleView.getBottleDrawingData().group );
      }, null );
    } );
    bottle.setScaleMagnitude( ICON_SCALE );
    return bottle;
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );