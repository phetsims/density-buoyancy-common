// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import UnitConversionProperty from '../../../../../axon/js/UnitConversionProperty.js';
import Range from '../../../../../dot/js/Range.js';
import Utils from '../../../../../dot/js/Utils.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import { combineOptions } from '../../../../../phet-core/js/optionize.js';
import resetArrow_png from '../../../../../scenery-phet/images/resetArrow_png.js';
import NumberControl, { NumberControlOptions } from '../../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, Color, HBox, HSeparator, Image, ManualConstraint, Node, Text, VBox } from '../../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import RectangularRadioButtonGroup from '../../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../../common/DensityBuoyancyCommonConstants.js';
import Cube from '../../../common/model/Cube.js';
import Material from '../../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../../common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../../common/view/DensityBuoyancyScreenView.js';
import FluidDensityControlNode from '../../../common/view/FluidDensityControlNode.js';
import BuoyancyDisplayOptionsPanel from '../../../common/view/BuoyancyDisplayOptionsPanel.js';
import MaterialMassVolumeControlNode from '../../../common/view/MaterialMassVolumeControlNode.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../../DensityBuoyancyCommonStrings.js';
import BuoyancyApplicationsModel from '../../model/applications/BuoyancyApplicationsModel.js';
import DensityAccordionBox from '../DensityAccordionBox.js';
import arrayRemove from '../../../../../phet-core/js/arrayRemove.js';
import BottleView from './BottleView.js';
import BoatView from './BoatView.js';
import bottle_icon_png from '../../../../images/bottle_icon_png.js';
import boat_icon_png from '../../../../images/boat_icon_png.js';
import SubmergedAccordionBox from '../SubmergedAccordionBox.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import PrecisionSliderThumb from '../../../common/view/PrecisionSliderThumb.js';
import ThreeUtils from '../../../../../mobius/js/ThreeUtils.js';
import Bottle from '../../model/applications/Bottle.js';
import MassView from '../../../common/view/MassView.js';
import Vector2 from '../../../../../dot/js/Vector2.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;
const ICON_SCALE = 0.08;

export default class BuoyancyApplicationsScreenView extends DensityBuoyancyScreenView<BuoyancyApplicationsModel> {

  private readonly positionResetSceneButton: () => void;

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
      visibleProperty: new DerivedProperty( [ model.sceneProperty ], scene => scene === 'boat' ),
      tandem: tandem.createTandem( 'resetSceneButton' )
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
    ], volume => model.bottle.interiorVolumeProperty.set( volume ), this.popupLayer, true, {
      minMass: 0,
      minCustomMass: 0,
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

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const airLitersProperty = new DerivedProperty( [ model.bottle.interiorVolumeProperty ], volume => {
      return ( 0.01 - volume ) * 1000;
    } );

    let materialChangeLocked = false;
    Multilink.lazyMultilink( [ model.customDensityProperty, model.bottle.interiorMassProperty, model.customDensityControlVisibleProperty ], density => {
      if ( !materialChangeLocked && model.bottle.interiorMaterialProperty.value.custom ) {
        materialChangeLocked = true;
        model.bottle.interiorMaterialProperty.value = Material.createCustomSolidMaterial( {
          density: density * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER,
          densityRange: model.customDensityProperty.range.copy().times( DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER )
        } );
        materialChangeLocked = false;
      }
    } );

    const customBottleDensityControlTandem = tandem.createTandem( 'customBottleDensityNumberControl' );
    const customBottleDensityControl = new NumberControl( DensityBuoyancyCommonStrings.densityStringProperty, model.customDensityProperty, model.customDensityProperty.range, combineOptions<NumberControlOptions>( {
      visibleProperty: model.customDensityControlVisibleProperty,
      sliderOptions: {
        accessibleName: DensityBuoyancyCommonStrings.densityStringProperty,
        thumbNode: new PrecisionSliderThumb( {
          tandem: customBottleDensityControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
        } )
      },
      numberDisplayOptions: {
        valuePattern: DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY
      },
      tandem: customBottleDensityControlTandem
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    const spacing = 5;
    const airVolumeMaxWidth = ( bottleControlNode.width - spacing ) / 2;

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
          spacing: spacing,
          children: [
            new Text( DensityBuoyancyCommonStrings.airVolumeStringProperty, {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: airVolumeMaxWidth * 0.95 // to account for numberDisplay padding
            } ),
            new NumberDisplay( airLitersProperty, new Range( 0, 10 ), {
              valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
              useRichText: true,
              decimalPlaces: 2,
              textOptions: {
                font: new PhetFont( 12 ),
                maxWidth: airVolumeMaxWidth
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
      material => material.density ).concat( [ // Adding Mystery Materials at the end, so they aren't sorted by density
      Material.MATERIAL_V,
      Material.MATERIAL_W
    ] ), cubicMeters => model.block.updateSize( Cube.boundsFromVolume( cubicMeters ) ), this.popupLayer, true, {
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

    const boatVolumeControlTandem = tandem.createTandem( 'boatVolumeNumberControl' );
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
            thumbNode: new PrecisionSliderThumb( {
              tandem: boatVolumeControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
            } ),
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
            } ],
            accessibleName: DensityBuoyancyCommonStrings.boatVolumeStringProperty
          },
          tandem: boatVolumeControlTandem
        } ) )
      ]
    } );

    const rightBoatContent = new Panel( boatBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    const densityAccordionBox = new DensityAccordionBox( {
      contentWidthMax: boatBox.width,
      tandem: tandem.createTandem( 'densityAccordionBox' )
    } );

    const submergedAccordionBox = new SubmergedAccordionBox( {
      readoutItems: [ {
        readoutItem: model.block
      } ],
      contentWidthMax: boatBox.width,
      tandem: tandem.createTandem( 'submergedAccordionBox' )
    } );

    const rightSideVBox = new VBox( {
      spacing: 10,
      align: 'right',
      excludeInvisibleChildrenFromBounds: true,
      children: [
        rightBottleContent,
        rightBoatContent,
        densityAccordionBox,
        submergedAccordionBox
      ]
    } );

    this.addChild( new AlignBox( rightSideVBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ rightSideVBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    }, {
      strictAxonDependencies: false // This workaround is deemed acceptable for visibleBoundsProperty listening, https://github.com/phetsims/faradays-electromagnetic-lab/issues/65
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.sceneProperty.link( scene => {
      rightBottleContent.visible = scene === 'bottle';
      rightBoatContent.visible = scene === 'boat';
    } );

    const displayedMysteryMaterials = [
      Material.DENSITY_E,
      Material.DENSITY_F
    ];

    const invisibleMaterials = [ ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );


    model.sceneProperty.link( scene => {
      const materials = scene === 'bottle' ? [
        model.bottle.interiorMaterialProperty,
        model.bottle.materialProperty
      ] : scene === 'boat' ? [
        model.block.materialProperty,
        model.boat.materialProperty
      ] : [];
      assert && assert( materials.length > 0, 'unsupported Scene', scene );
      densityAccordionBox.setReadoutItems( materials.map( material => {
        return { readoutItem: material };
      } ) );
      const submergedObjects = scene === 'bottle' ?
        [ {
          readoutItem: model.bottle,
          readoutNameProperty: DensityBuoyancyCommonStrings.bottleStringProperty
        } ] :
        [ {
          readoutItem: model.boat,
          readoutNameProperty: DensityBuoyancyCommonStrings.boatStringProperty
        }
        ];
      submergedAccordionBox.setReadoutItems( submergedObjects );
    } );

    const buoyancyDisplayOptionsPanel = new BuoyancyDisplayOptionsPanel( model, {
      tandem: tandem.createTandem( 'buoyancyDisplayOptionsPanel' ),
      contentWidth: this.modelToViewPoint( new Vector3(
        this.model.poolBounds.left,
        this.model.poolBounds.top,
        this.model.poolBounds.front
      ) ).x - 2 * MARGIN
    } );

    this.addChild( new AlignBox( buoyancyDisplayOptionsPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const bottleBoatRadioButtonGroup = new RectangularRadioButtonGroup( model.sceneProperty, [
      {
        value: 'bottle',
        createNode: () => BuoyancyApplicationsScreenView.getBottleIcon(),
        tandemName: 'bottleRadioButton'
      },
      {
        value: 'boat',
        createNode: () => BuoyancyApplicationsScreenView.getBoatIcon(),
        tandemName: 'boatRadioButton'
      }
    ], {
      orientation: 'horizontal',
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        baseColor: DensityBuoyancyCommonColors.radioBackgroundColorProperty,
        xMargin: 10,
        yMargin: 10
      },
      tandem: tandem.createTandem( 'bottleBoatRadioButtonGroup' )
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

    ManualConstraint.create( this, [ rightSideVBox, fluidDensityControlPanel, bottleBoatRadioButtonGroup ],
      ( rightSideVBoxWrapper, densityControlPanelWrapper, bottleBoatSelectionNodeWrapper ) => {
        bottleBoatSelectionNodeWrapper.left = rightSideVBoxWrapper.left;
        bottleBoatSelectionNodeWrapper.bottom = densityControlPanelWrapper.bottom;
      } );

    this.addChild( bottleBoatRadioButtonGroup );

    this.addChild( this.popupLayer );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const blockLayer = new Node( { pdomOrder: [] } );
    this.addChild( blockLayer );
    const bottleBoatLayer = new Node( { pdomOrder: [] } );
    this.addChild( bottleBoatLayer );

    this.resetEmitter.addListener( () => {
      submergedAccordionBox.reset();
      densityAccordionBox.reset();
    } );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      blockLayer,
      bottleBoatLayer,

      rightBoatContent,
      rightBottleContent,

      resetSceneButton,
      fluidDensityControlPanel
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView.mass === model.bottle || massView.mass === model.boat ) {
        bottleBoatLayer.pdomOrder = [ ...bottleBoatLayer.pdomOrder!, massView.focusablePath ];

        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
      else if ( massView.mass === model.block ) {
        blockLayer.pdomOrder = [ ...blockLayer.pdomOrder!, massView.focusablePath ];

        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
    };
    this.massViews.addItemAddedListener( massViewAdded );
    this.massViews.forEach( massViewAdded );

    this.pdomControlAreaNode.pdomOrder = [
      buoyancyDisplayOptionsPanel,
      densityAccordionBox,
      submergedAccordionBox,
      bottleBoatRadioButtonGroup,
      this.resetAllButton
    ];
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

  public static getBuoyancyApplicationsIcon(): Node {

    return DensityBuoyancyScreenView.getAngledIcon( 5.5, new Vector3( 0, 0, 0 ), scene => {

      const primaryGeometry = Bottle.getPrimaryGeometry();

      const bottleGroup = new THREE.Group();

      const frontBottomMaterial = new THREE.MeshPhongMaterial( {
        color: Material.OIL.liquidColor!.value.toHexString(),
        opacity: 0.8,
        transparent: true,
        side: THREE.FrontSide
      } );
      const frontBottom = new THREE.Mesh( primaryGeometry, frontBottomMaterial );
      frontBottom.renderOrder = -1;
      bottleGroup.add( frontBottom );

      const cap = new THREE.Mesh( Bottle.getCapGeometry(), new THREE.MeshPhongMaterial( {
        color: 0xFF3333,
        side: THREE.DoubleSide
      } ) );
      bottleGroup.add( cap );

      bottleGroup.scale.multiplyScalar( 0.5 );
      bottleGroup.position.add( new THREE.Vector3( 0.01, 0, 0.05 ) );

      scene.add( bottleGroup );

      const waterMaterial = new THREE.MeshLambertMaterial( {
        transparent: true
      } );
      const waterColor = DensityBuoyancyCommonColors.materialWaterColorProperty.value;
      waterMaterial.color = ThreeUtils.colorToThree( waterColor );
      waterMaterial.opacity = waterColor.alpha;

      // Fake it!
      const waterGeometry = new THREE.BoxGeometry( 1, 1, 0.2 );

      const water = new THREE.Mesh( waterGeometry, waterMaterial );
      water.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.5, 0.1 ) ) );
      scene.add( water );
    } );
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );