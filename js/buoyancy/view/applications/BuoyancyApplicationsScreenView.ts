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
import { Color, GatedVisibleProperty, HBox, HSeparator, Image, Node, Text, VBox } from '../../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import RectangularRadioButtonGroup from '../../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants, { toLiters } from '../../../common/DensityBuoyancyCommonConstants.js';
import Cube from '../../../common/model/Cube.js';
import Material from '../../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../../common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions, PointedAtMassView } from '../../../common/view/DensityBuoyancyScreenView.js';
import MaterialMassVolumeControlNode from '../../../common/view/MaterialMassVolumeControlNode.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../../DensityBuoyancyCommonStrings.js';
import BuoyancyApplicationsModel from '../../model/applications/BuoyancyApplicationsModel.js';
import DensityAccordionBox from '../DensityAccordionBox.js';
import BottleView from './BottleView.js';
import BoatView from './BoatView.js';
import SubmergedAccordionBox from '../SubmergedAccordionBox.js';
import PrecisionSliderThumb from '../../../common/view/PrecisionSliderThumb.js';
import Bottle from '../../model/applications/Bottle.js';
import MassView from '../../../common/view/MassView.js';
import FluidDensityPanel from '../FluidDensityPanel.js';
import BuoyancyScreenView from '../BuoyancyScreenView.js';
import StrictOmit from '../../../../../phet-core/js/types/StrictOmit.js';
import BoatDesign from '../../model/applications/BoatDesign.js';
import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import Mass from '../../../common/model/Mass.js';
import Boat from '../../model/applications/Boat.js';
import DebugView from '../../../common/view/DebugView.js';
import ApplicationsDebugView from './ApplicationsDebugView.js';
import getBoatIcon from './getBoatIcon.js';
import getBottleIcon from './getBottleIcon.js';

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

    const resetBoatButtonTandem = tandem.createTandem( 'resetBoatButton' );
    const resetBoatButton = new RectangularPushButton( {

      content: new Image( resetArrow_png, { scale: 0.3 } ),
      xMargin: 5,
      yMargin: 3,
      baseColor: new Color( 220, 220, 220 ),
      listener: () => {
        model.resetBoatScene();
      },
      visibleProperty: new GatedVisibleProperty(
        new DerivedProperty( [ model.applicationModeProperty ], scene => scene === 'boat' ),
        resetBoatButtonTandem ),
      tandem: resetBoatButtonTandem
    } );
    this.addChild( resetBoatButton );

    this.positionResetSceneButton = () => {
      resetBoatButton.rightTop = this.modelToViewPoint( new Vector3(
        this.model.poolBounds.maxX,
        this.model.poolBounds.minY,
        this.model.poolBounds.maxZ
      ) ).plusXY( 0, 5 );
    };
    this.transformEmitter.addListener( this.positionResetSceneButton );
    this.positionResetSceneButton();

    const bottleControlsTandem = tandem.createTandem( 'bottleControls' );
    const materialInsideControlsTandem = bottleControlsTandem.createTandem( 'materialInsideControls' );
    const materialInsideControls = new MaterialMassVolumeControlNode( model.bottle.materialInsideProperty, model.bottle.materialInsideMassProperty, model.bottle.materialInsideVolumeProperty,
      model.bottle.materialInsideProperty.availableValues, volume => model.bottle.materialInsideVolumeProperty.set( volume ), this.popupLayer, {
        minMass: 0,
        minCustomMass: 0,
        maxCustomMass: 100,
        maxMass: 100,
        minVolumeLiters: model.bottle.materialInsideVolumeRange.min,
        maxVolumeLiters: model.bottle.materialInsideVolumeRange.max,
        minCustomVolumeLiters: 0.5,
        showMassAsReadout: true,
        customKeepsConstantDensity: true,
        ownsCustomDensityRange: false, // Bottle has a good range for itself.
        tandem: materialInsideControlsTandem,

        // When controlling the material inside, the custom density is an independent variable and should not automatically
        // sync with the previously selected material's density.
        syncCustomMaterialDensity: false
      } );

    // This DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const airLitersProperty = new DerivedProperty( [ model.bottle.materialInsideVolumeProperty ], volume => toLiters( 0.01 - volume ) );

    const customDensityControlVisibleProperty = new DerivedProperty( [ model.bottle.materialInsideProperty ],
      material => material.custom );

    const customBottleDensityControlTandem = materialInsideControlsTandem.createTandem( 'customBottleDensityNumberControl' );

    const correctUnitsCustomMaterialDensityProperty = new UnitConversionProperty( model.bottle.materialInsideProperty.customMaterial.densityProperty, {
      factor: 1 / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
    } );

    const bottleCustomInsideMaterialDensityControl = new NumberControl(
      DensityBuoyancyCommonStrings.densityStringProperty,
      correctUnitsCustomMaterialDensityProperty,
      correctUnitsCustomMaterialDensityProperty.range,
      combineOptions<NumberControlOptions>( {
        visibleProperty: new GatedVisibleProperty( customDensityControlVisibleProperty, customBottleDensityControlTandem ),
        sliderOptions: {
          accessibleName: DensityBuoyancyCommonStrings.densityStringProperty,
          phetioLinkedProperty: model.bottle.materialInsideProperty.customMaterial.densityProperty,
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
        bottleCustomInsideMaterialDensityControl,
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

    // TODO: Move this panel + bottleBox to a new file like BottlePanel.ts, see https://github.com/phetsims/density-buoyancy-common/issues/317
    const rightBottleContent = new Panel( bottleBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    const blockControls = new MaterialMassVolumeControlNode( model.block.materialProperty, model.block.massProperty, model.block.volumeProperty,
      model.block.materialProperty.availableValues, cubicMeters => model.block.updateSize( Cube.boundsFromVolume( cubicMeters ) ), this.popupLayer, {
        tandem: tandem.createTandem( 'blockControls' ),
        highDensityMaxMass: 215
      } );

    model.block.materialProperty.link( material => {
      if ( material === Material.MATERIAL_X ) {
        model.block.volumeProperty.value = 0.006;
      }
      else if ( material === Material.MATERIAL_Y ) {
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

    // TODO: Move rightBoatContent and boatBox to a new file like BoatPanel.ts, see https://github.com/phetsims/density-buoyancy-common/issues/317
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

    this.addAlignBox( rightSideVBox, 'right', 'top' );

    this.setRightBarrierViewPoint( rightSideVBox.boundsProperty );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.applicationModeProperty.link( scene => {
      rightBottleContent.visible = scene === 'bottle';
      rightBoatContent.visible = scene === 'boat';
      this.poolScaleHeightControl!.visible = scene === 'bottle';
      if ( this.poolScaleHeightControl && !this.poolScaleHeightControl.visible ) {
        this.poolScaleHeightControl.interruptSubtreeInput();
      }
    } );

    // Determine which mystery materials are displayed and which are invisible (but can be enabled in PhET-iO studio)
    const displayedMysteryMaterials = [ Material.FLUID_E, Material.FLUID_F ];
    const invisibleMaterials = [ ...Material.BUOYANCY_FLUID_MYSTERY_MATERIALS ].filter( material => !displayedMysteryMaterials.includes( material ) );

    model.applicationModeProperty.link( scene => {
      const materials = scene === 'bottle' ? [ model.bottle.materialInsideProperty, model.bottle.materialProperty ] :
                        scene === 'boat' ? [ model.block.materialProperty, model.boat.materialProperty ] : [];
      assert && assert( materials.length > 0, 'unsupported Scene', scene );
      objectDensityAccordionBox.setReadoutItems( materials.map( material => {
        return { readoutItem: material };
      } ) );
      const submergedObjects = [ {
        readoutItem: scene === 'bottle' ? model.bottle : model.boat,
        readoutNameProperty: scene === 'bottle' ? DensityBuoyancyCommonStrings.bottleStringProperty : DensityBuoyancyCommonStrings.boatStringProperty
      } ];
      percentSubmergedAccordionBox.setReadoutItems( submergedObjects );
    } );

    this.addAlignBox( this.displayOptionsPanel, 'left', 'bottom' );

    const applicationModeRadioButtonGroup = new RectangularRadioButtonGroup( model.applicationModeProperty, [ {
      value: 'bottle',
      createNode: () => getBottleIcon(),
      tandemName: 'bottleRadioButton'
    }, {
      value: 'boat',
      createNode: () => getBoatIcon(),
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
      tandem: tandem.createTandem( 'applicationModeRadioButtonGroup' )
    } );


    const fluidDensityPanel = new FluidDensityPanel( model, invisibleMaterials, this.popupLayer, tandem.createTandem( 'fluidDensityPanel' ) );
    this.addAlignBox( fluidDensityPanel, 'center', 'bottom' );

    this.alignNodeWithResetAllButton( applicationModeRadioButtonGroup );
    this.addChild( applicationModeRadioButtonGroup );

    this.addChild( this.popupLayer );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    // TODO: Remove pdomOrder:[] or document why it is necessary, see https://github.com/phetsims/density-buoyancy-common/issues/317
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

      resetBoatButton,
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
      this.displayOptionsPanel,
      objectDensityAccordionBox,
      percentSubmergedAccordionBox,
      applicationModeRadioButtonGroup,
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
    if ( mass instanceof Bottle ) {
      return new BottleView( mass, this, this.displayProperties );
    }
    else if ( mass instanceof Boat ) {
      return new BoatView( mass, this, this.model.pool.fluidYInterpolatedProperty, this.displayProperties );
    }
    else {
      return super.getMassViewFromMass( mass );
    }
  }

  public override step( dt: number ): void {
    super.step( dt );

    this.positionResetSceneButton();
  }

  protected override createDebugView(): DebugView {
    return new ApplicationsDebugView( this.model, this.layoutBounds );
  }

  /**
   * If there is a block inside the boat, the picking logic should pick through the boat hull to the block, otherwise
   * you would not be able to take a block out of the boat.
   */
  protected override getMinClosestEntry( entries: PointedAtMassView[] ): PointedAtMassView | undefined {
    return _.minBy( entries, entry => {
      return entry.massView.mass instanceof Boat ? Number.POSITIVE_INFINITY : entry.t;
    } );
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
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );