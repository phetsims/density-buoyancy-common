// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
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
import { AlignBox, Color, GatedVisibleProperty, HBox, HSeparator, Image, ManualConstraint, Node, Text, VBox } from '../../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import RectangularRadioButtonGroup from '../../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants, { toLiters } from '../../../common/DensityBuoyancyCommonConstants.js';
import Cube from '../../../common/model/Cube.js';
import Material from '../../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../../common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../../common/view/DensityBuoyancyScreenView.js';
import BuoyancyDisplayOptionsPanel from '../BuoyancyDisplayOptionsPanel.js';
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
import Bottle from '../../model/applications/Bottle.js';
import MassView from '../../../common/view/MassView.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import FluidDensityPanel from '../FluidDensityPanel.js';
import BuoyancyScreenView from '../BuoyancyScreenView.js';
import StrictOmit from '../../../../../phet-core/js/types/StrictOmit.js';
import FluidIconMesh from '../../../common/view/FluidIconMesh.js';
import BoatDesign from '../../model/applications/BoatDesign.js';
import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import Mass from '../../../common/model/Mass.js';
import Cuboid from '../../../common/model/Cuboid.js';
import CuboidView from '../../../common/view/CuboidView.js';
import Scale from '../../../common/model/Scale.js';
import ScaleView from '../../../common/view/ScaleView.js';
import Boat from '../../model/applications/Boat.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;
const ICON_SCALE = 0.08;

type BuoyancyExploreScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class BuoyancyApplicationsScreenView extends BuoyancyScreenView<BuoyancyApplicationsModel> {

  private readonly positionResetSceneButton: () => void;

  public constructor( model: BuoyancyApplicationsModel, options: BuoyancyExploreScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      supportsDepthLines: false,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: true,
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    // For clipping planes in BottleView
    if ( this.sceneNode.stage.threeRenderer ) {
      this.sceneNode.stage.threeRenderer.localClippingEnabled = true;
    }

    const resetBoatSceneButtonTandem = tandem.createTandem( 'resetBoatSceneButton' );
    const resetBoatSceneButton = new RectangularPushButton( {
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
      visibleProperty: new GatedVisibleProperty(
        new DerivedProperty( [ model.sceneProperty ], scene => scene === 'BOAT' ),
        resetBoatSceneButtonTandem ),
      tandem: resetBoatSceneButtonTandem
    } );
    this.addChild( resetBoatSceneButton );

    this.positionResetSceneButton = () => {
      resetBoatSceneButton.rightTop = this.modelToViewPoint( new Vector3(
        this.model.poolBounds.maxX,
        this.model.poolBounds.minY,
        this.model.poolBounds.maxZ
      ) ).plusXY( 0, 5 );
    };
    this.transformEmitter.addListener( this.positionResetSceneButton );
    this.positionResetSceneButton();

    const bottleControlsTandem = tandem.createTandem( 'bottleControls' );
    const materialInsideControlsTandem = bottleControlsTandem.createTandem( 'materialInsideControls' );
    const materialInsideControls = new MaterialMassVolumeControlNode( model.bottle.materialInsideProperty, model.bottle.interiorMassProperty, model.bottle.materialInsideVolumeProperty, [
      Material.GASOLINE,
      Material.OIL,
      Material.WATER,
      Material.SAND,
      Material.CONCRETE,
      Material.COPPER,
      Material.MATERIAL_R,
      Material.MATERIAL_S
    ], volume => model.bottle.materialInsideVolumeProperty.set( volume ), this.popupLayer, true, {
      minMass: 0,
      minCustomMass: 0,
      maxCustomMass: 100,
      maxMass: 100,
      minVolumeLiters: model.bottle.materialInsideVolumeRange.min,
      maxVolumeLiters: model.bottle.materialInsideVolumeRange.max,
      minCustomVolumeLiters: 0.5,
      showMassAsReadout: true,
      supportHiddenMaterial: true,
      customKeepsConstantDensity: true,
      tandem: materialInsideControlsTandem
    } );

    // This DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const airLitersProperty = new DerivedProperty( [ model.bottle.materialInsideVolumeProperty ], volume => toLiters( 0.01 - volume ) );

    const customDensityControlVisibleProperty = new DerivedProperty( [ model.bottle.materialInsideProperty ],
      material => material.custom );

    let materialChangeLocked = false;
    Multilink.lazyMultilink( [
      model.bottle.customDensityProperty,
      model.bottle.customDensityProperty.rangeProperty,
      model.bottle.interiorMassProperty,
      customDensityControlVisibleProperty
    ], ( density, densityRange ) => {
      if ( !materialChangeLocked && model.bottle.materialInsideProperty.value.custom ) {
        materialChangeLocked = true;
        model.bottle.materialInsideProperty.value = Material.createCustomSolidMaterial( {
          density: density * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER,
          densityRange: densityRange.times( DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER )
        } );
        materialChangeLocked = false;
      }
    } );

    const customBottleDensityControlTandem = materialInsideControlsTandem.createTandem( 'customBottleDensityNumberControl' );
    const customBottleDensityControl = new NumberControl( DensityBuoyancyCommonStrings.densityStringProperty, model.bottle.customDensityProperty, model.bottle.customDensityProperty.range, combineOptions<NumberControlOptions>( {
      visibleProperty: new GatedVisibleProperty( customDensityControlVisibleProperty, customBottleDensityControlTandem ),
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

    const airVolumeMaxWidth = ( materialInsideControls.width - DensityBuoyancyCommonConstants.SPACING_SMALL ) / 2;
    const airVolumeDisplayTandem = bottleControlsTandem.createTandem( 'airVolumeDisplay' );

    const bottleBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'left',
      stretch: true,
      tandem: bottleControlsTandem,
      children: [
        new Text( DensityBuoyancyCommonStrings.materialInsideStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160,
          visibleProperty: materialInsideControls.visibleProperty
        } ),
        materialInsideControls,
        customBottleDensityControl,
        new HSeparator(),
        new HBox( {
          tandem: airVolumeDisplayTandem,
          visibleProperty: new BooleanProperty( true, {
            tandem: airVolumeDisplayTandem.createTandem( 'visibleProperty' ),
            phetioFeatured: true
          } ),
          spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
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
                maxWidth: airVolumeMaxWidth * 0.9 // to account for the numberDisplay padding
              }
            } )
          ]
        } )
      ]
    } );

    const rightBottleContent = new Panel( bottleBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    const blockControls = new MaterialMassVolumeControlNode( model.block.materialProperty, model.block.massProperty, model.block.volumeProperty, _.sortBy( [
        Material.PYRITE,
        Material.STEEL,
        Material.SILVER,
        Material.TANTALUM,
        Material.GOLD,
        Material.PLATINUM
      ].concat( Material.SIMPLE_MASS_MATERIALS ),
      material => material.density ).concat( [ // Adding Mystery Materials at the end, so they aren't sorted by density // TODO: Doesn't the class always make mystery at the end? https://github.com/phetsims/density-buoyancy-common/issues/176
      Material.MATERIAL_V,
      Material.MATERIAL_W
    ] ), cubicMeters => model.block.updateSize( Cube.boundsFromVolume( cubicMeters ) ), this.popupLayer, true, {
      tandem: tandem.createTandem( 'blockControls' ),
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
    const boatVolumeRange = model.boat.maxVolumeDisplacedProperty.range.times( DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER );
    const boatBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'left',
      children: [
        blockControls,
        new HSeparator(),
        // Convert cubic meters => liters
        new NumberControl( DensityBuoyancyCommonStrings.boatVolumeStringProperty, new UnitConversionProperty( model.boat.maxVolumeDisplacedProperty, {
          factor: DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
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
            phetioLinkedProperty: model.boat.maxVolumeDisplacedProperty,
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

    const objectDensityAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.objectDensityStringProperty, {
      contentWidthMax: boatBox.width,
      tandem: tandem.createTandem( 'objectDensityAccordionBox' )
    } );

    const percentSubmergedAccordionBox = new SubmergedAccordionBox( {
      readoutItems: [ {
        readoutItem: model.block
      } ],
      contentWidthMax: boatBox.width,
      tandem: tandem.createTandem( 'percentSubmergedAccordionBox' )
    } );

    const rightSideVBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'right',
      excludeInvisibleChildrenFromBounds: true,
      children: [
        rightBottleContent,
        rightBoatContent,
        objectDensityAccordionBox,
        percentSubmergedAccordionBox
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
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.sceneProperty.link( scene => {
      rightBottleContent.visible = scene === 'BOTTLE';
      rightBoatContent.visible = scene === 'BOAT';
      this.poolScaleHeightControl!.visible = scene === 'BOTTLE';
      if ( this.poolScaleHeightControl && !this.poolScaleHeightControl.visible ) {
        this.poolScaleHeightControl.interruptSubtreeInput();
      }
    } );

    const displayedMysteryMaterials = [
      Material.FLUID_E,
      Material.FLUID_F
    ];

    const invisibleMaterials = [ ...Material.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );


    model.sceneProperty.link( scene => {
      const materials = scene === 'BOTTLE' ? [
        model.bottle.materialInsideProperty,
        model.bottle.materialProperty
      ] : scene === 'BOAT' ? [
        model.block.materialProperty,
        model.boat.materialProperty
      ] : [];
      assert && assert( materials.length > 0, 'unsupported Scene', scene );
      objectDensityAccordionBox.setReadoutItems( materials.map( material => {
        return { readoutItem: material };
      } ) );
      const submergedObjects = [ {
        readoutItem: scene === 'BOTTLE' ? model.bottle : model.boat,
        readoutNameProperty: scene === 'BOTTLE' ? DensityBuoyancyCommonStrings.bottleStringProperty : DensityBuoyancyCommonStrings.boatStringProperty
      } ];
      percentSubmergedAccordionBox.setReadoutItems( submergedObjects );
    } );

    const displayOptionsPanel = new BuoyancyDisplayOptionsPanel( this.displayProperties, {
      tandem: tandem.createTandem( 'displayOptionsPanel' ),
      contentWidth: this.modelToViewPoint( new Vector3(
        this.model.poolBounds.left,
        this.model.poolBounds.top,
        this.model.poolBounds.front
      ) ).x - 2 * MARGIN
    } );

    this.addChild( new AlignBox( displayOptionsPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const sceneRadioButtonGroup = new RectangularRadioButtonGroup( model.sceneProperty, [ {
      value: 'BOTTLE',
      createNode: () => BuoyancyApplicationsScreenView.getBottleIcon(),
      tandemName: 'bottleRadioButton'
    }, {
      value: 'BOAT',
      createNode: () => BuoyancyApplicationsScreenView.getBoatIcon(),
      tandemName: 'boatRadioButton'
    } ], {
      orientation: 'horizontal',
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        baseColor: DensityBuoyancyCommonColors.radioBackgroundColorProperty,
        xMargin: 10,
        yMargin: 10
      },
      tandem: tandem.createTandem( 'sceneRadioButtonGroup' )
    } );

    const customMaterial = Material.createCustomLiquidMaterial( {
      density: 1000, // Same as water, in SI (kg/m^3)
      densityRange: DensityBuoyancyCommonConstants.FLUID_DENSITY_RANGE_PER_M3
    } );

    const fluidDensityPanel = new FluidDensityPanel( model, customMaterial, invisibleMaterials, this.popupLayer, tandem.createTandem( 'fluidDensityControlPanel' ) );

    this.addChild( new AlignBox( fluidDensityPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    ManualConstraint.create( this, [ this.resetAllButton, sceneRadioButtonGroup ],
      ( resetAllButtonWrapper, bottleBoatSelectionNodeWrapper ) => {
        bottleBoatSelectionNodeWrapper.right = resetAllButtonWrapper.left - DensityBuoyancyCommonConstants.MARGIN;
        bottleBoatSelectionNodeWrapper.bottom = resetAllButtonWrapper.bottom;
      } );

    this.addChild( sceneRadioButtonGroup );

    this.addChild( this.popupLayer );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const blockLayer = new Node( { pdomOrder: [] } );
    this.addChild( blockLayer );
    const bottleBoatLayer = new Node( { pdomOrder: [] } );
    this.addChild( bottleBoatLayer );

    this.resetEmitter.addListener( () => {
      percentSubmergedAccordionBox.reset();
      objectDensityAccordionBox.reset();
    } );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      blockLayer,
      bottleBoatLayer,

      rightBoatContent,
      rightBottleContent,

      resetBoatSceneButton,
      fluidDensityPanel,
      this.poolScaleHeightControl
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
      displayOptionsPanel,
      objectDensityAccordionBox,
      percentSubmergedAccordionBox,
      sceneRadioButtonGroup,
      this.resetAllButton
    ];

    const fluidGeometry = new THREE.BufferGeometry();
    const fluidPositionArray = DensityBuoyancyScreenView.createFluidVertexArray();
    fluidGeometry.addAttribute( 'position', new THREE.BufferAttribute( fluidPositionArray, 3 ) );
    fluidGeometry.addAttribute( 'normal', new THREE.BufferAttribute( DensityBuoyancyScreenView.createFluidNormalArray(), 3 ) );

    // boolean for optimization, to prevent zeroing out the remainder of the array if we have already done so
    let wasFilled = false;

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.pool.fluidYInterpolatedProperty.link( y => {
      wasFilled = this.fillFluidGeometry( y, fluidPositionArray, fluidGeometry, wasFilled );
    } );
  }

  protected override getMassViewFromMass( mass: Mass ): MassView {
    let massView!: MassView;

    if ( mass instanceof Cuboid ) {
      massView = new CuboidView( mass, this, this.displayProperties );
    }
    else if ( mass instanceof Scale ) {
      massView = new ScaleView( mass, this, this.model.gravityProperty );
    }
    else if ( mass instanceof Bottle ) {
      massView = new BottleView( mass, this, this.displayProperties );
    }
    else if ( mass instanceof Boat ) {
      massView = new BoatView( mass, this, this.model.pool.fluidYInterpolatedProperty, this.displayProperties );
    }

    assert && assert( !!massView, `massView is falsy, mass: ${mass.constructor.name}` );

    return massView;
  }

  public override step( dt: number ): void {
    super.step( dt );

    this.positionResetSceneButton();
  }

  protected override fillFluidGeometry( y: number, fluidPositionArray: Float32Array, fluidGeometry: THREE.BufferGeometry, wasFilled: boolean ): boolean {
    const boat = this.model.boat;
    const hasVisibleBoat = boat && boat.visibleProperty.value;
    wasFilled = BoatDesign.fillFluidVertexArray(
      y,
      hasVisibleBoat ? boat.matrix.translation.x : 0,
      hasVisibleBoat ? y - boat.matrix.translation.y : 0,
      hasVisibleBoat ? boat.maxVolumeDisplacedProperty.value / 0.001 : 0,
      this.model.poolBounds, fluidPositionArray, wasFilled );
    fluidGeometry.attributes.position.needsUpdate = true;
    fluidGeometry.computeBoundingSphere();

    return wasFilled;
  }

  private static getBoatIcon(): Node {
    const boatIcon = DensityBuoyancyScreenView.getThreeIcon( boat_icon_png, () => {
      return DensityBuoyancyScreenView.getAngledIcon( 6, new Vector3( -0.03, 0, 0 ), scene => {

        const topBoatClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );
        const bottomBoatClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
        const topPoolClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );
        const bottomPoolClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );

        scene.add( BoatView.getBoatDrawingData( topBoatClipPlane, bottomBoatClipPlane, topPoolClipPlane, bottomPoolClipPlane ).group );
      }, null );
    } );
    boatIcon.setScaleMagnitude( ICON_SCALE );
    return boatIcon;
  }

  private static getBottleIcon(): Node {
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

      scene.add( new FluidIconMesh() );
    } );
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );