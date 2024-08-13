// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import resetArrow_png from '../../../../../scenery-phet/images/resetArrow_png.js';
import { Color, GatedVisibleProperty, Image, Node, VBox } from '../../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import RectangularRadioButtonGroup from '../../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../../common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyScreenView, { PointedAtMassView } from '../../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../../DensityBuoyancyCommonStrings.js';
import BuoyancyApplicationsModel from '../../model/applications/BuoyancyApplicationsModel.js';
import DensityAccordionBox from '../DensityAccordionBox.js';
import BottleView from './BottleView.js';
import BoatView from './BoatView.js';
import SubmergedAccordionBox from '../SubmergedAccordionBox.js';
import Bottle from '../../model/applications/Bottle.js';
import MassView from '../../../common/view/MassView.js';
import FluidDensityPanel from '../FluidDensityPanel.js';
import BuoyancyScreenView, { BuoyancyScreenViewOptions } from '../BuoyancyScreenView.js';
import StrictOmit from '../../../../../phet-core/js/types/StrictOmit.js';
import BoatDesign from '../../model/applications/BoatDesign.js';
import Mass from '../../../common/model/Mass.js';
import Boat from '../../model/applications/Boat.js';
import DebugView from '../../../common/view/DebugView.js';
import ApplicationsDebugView from './ApplicationsDebugView.js';
import getBoatIcon from './getBoatIcon.js';
import getBottleIcon from './getBottleIcon.js';
import BoatPanel from './BoatPanel.js';
import BottlePanel from './BottlePanel.js';

type BuoyancyApplicationsScreenViewOptions = StrictOmit<BuoyancyScreenViewOptions, 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class BuoyancyApplicationsScreenView extends BuoyancyScreenView<BuoyancyApplicationsModel> {

  private readonly positionResetSceneButton: () => void;

  public constructor( model: BuoyancyApplicationsModel, providedOptions: BuoyancyApplicationsScreenViewOptions ) {

    const options = optionize<BuoyancyApplicationsScreenViewOptions, EmptySelfOptions, BuoyancyScreenViewOptions>()( {
      supportsDepthLines: false,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: true,
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, providedOptions );

    super( model, options );

    const tandem = options.tandem;

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
        model.restartBoatScene();
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

    model.block.materialProperty.link( material => {
      if ( material === Material.MATERIAL_X ) {
        model.block.volumeProperty.value = 0.006;
      }
      else if ( material === Material.MATERIAL_Y ) {
        model.block.volumeProperty.value = 0.003;
      }
    } );

    const bottlePanel = new BottlePanel( model.bottle, this.popupLayer, tandem );
    const boatPanel = new BoatPanel( model.block, model.boat, this.popupLayer, tandem );

    const objectDensityAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.objectDensityStringProperty, {
      contentWidthMax: boatPanel.contentWidth,
      tandem: tandem.createTandem( 'objectDensityAccordionBox' )
    } );

    const percentSubmergedAccordionBox = new SubmergedAccordionBox( {
      readoutItems: [ {
        readoutItem: model.block
      } ],
      contentWidthMax: boatPanel.contentWidth,
      tandem: tandem.createTandem( 'percentSubmergedAccordionBox' )
    } );

    const rightSideVBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'right',
      excludeInvisibleChildrenFromBounds: true,
      children: [
        bottlePanel,
        boatPanel,
        objectDensityAccordionBox,
        percentSubmergedAccordionBox
      ]
    } );

    this.addAlignBox( rightSideVBox, 'right', 'top' );

    this.setRightBarrierViewPoint( rightSideVBox.boundsProperty );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.applicationModeProperty.link( scene => {
      bottlePanel.visible = scene === 'bottle';
      boatPanel.visible = scene === 'boat';
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

      boatPanel,
      bottlePanel,

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