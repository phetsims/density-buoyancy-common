// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../../axon/js/DynamicProperty.js';
import Property from '../../../../../axon/js/Property.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { AlignBox, createGatedVisibleProperty, ManualConstraint, Node, VBox } from '../../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../../common/model/Material.js';
import BuoyancyDisplayOptionsPanel from '../BuoyancyDisplayOptionsPanel.js';
import PrimarySecondaryPanelsNode from '../../../common/view/PrimarySecondaryPanelsNode.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import DensityAccordionBox from '../DensityAccordionBox.js';
import ShapeSizeControlNode from './ShapeSizeControlNode.js';
import BuoyancyShapesModel from '../../model/shapes/BuoyancyShapesModel.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../../common/view/DensityBuoyancyScreenView.js';
import { combineOptions } from '../../../../../phet-core/js/optionize.js';
import MaterialControlNode from '../../../common/view/MaterialControlNode.js';
import MultiSectionPanelsNode from '../../../common/view/MultiSectionPanelsNode.js';
import arrayRemove from '../../../../../phet-core/js/arrayRemove.js';
import InfoButton from '../../../../../scenery-phet/js/buttons/InfoButton.js';
import ShapesInfoDialog from './ShapesInfoDialog.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import Bounds2 from '../../../../../dot/js/Bounds2.js';
import BlocksRadioButtonGroup from '../../../common/view/BlocksRadioButtonGroup.js';
import SubmergedAccordionBox from '../SubmergedAccordionBox.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import TwoBlockMode from '../../../common/model/TwoBlockMode.js';
import PatternStringProperty from '../../../../../axon/js/PatternStringProperty.js';
import DensityBuoyancyCommonStrings from '../../../DensityBuoyancyCommonStrings.js';
import { DensityMaterials } from '../../../common/view/MaterialView.js';
import ThreeUtils from '../../../../../mobius/js/ThreeUtils.js';
import DensityBuoyancyCommonColors from '../../../common/view/DensityBuoyancyCommonColors.js';
import Cone from '../../../common/model/Cone.js';
import ConeView from '../../../common/view/ConeView.js';
import ScaleView from '../../../common/view/ScaleView.js';
import MassView from '../../../common/view/MassView.js';
import FluidDensityPanel from '../FluidDensityPanel.js';
import BuoyancyScreenView from '../BuoyancyScreenView.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

type BuoyancyShapesScreenViewOptions = DensityBuoyancyScreenViewOptions;

export default class BuoyancyShapesScreenView extends BuoyancyScreenView<BuoyancyShapesModel> {

  private rightBox: MultiSectionPanelsNode;

  private readonly positionInfoButton: () => void;

  public constructor( model: BuoyancyShapesModel, options: BuoyancyShapesScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, false, false, true,

      // Show the forces as larger in this case, because the masses are significantly smaller, see https://github.com/phetsims/density-buoyancy-common/issues/186
      1 / 4,

      combineOptions<DensityBuoyancyScreenViewOptions>( {
        cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
      }, options ) );

    const displayedMysteryMaterials = [
      Material.DENSITY_C,
      Material.DENSITY_D
    ];
    const invisibleMaterials = [ ...Material.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );

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

    // Info button and associated dialog
    const infoButtonTandem = tandem.createTandem( 'infoButton' );
    const infoDialog = new ShapesInfoDialog( infoButtonTandem.createTandem( 'infoDialog' ) );
    const infoButton = new InfoButton( {
      accessibleName: 'infoButton',
      scale: 0.5,
      iconFill: 'rgb( 41, 106, 163 )',
      touchAreaDilation: 20,
      listener: () => infoDialog.show(),
      tandem: infoButtonTandem
    } );
    this.addChild( infoButton );

    this.positionInfoButton = () => {
      const bottomLeftPoolPoint = this.modelToViewPoint( new Vector3(
        this.model.poolBounds.minX,
        this.model.poolBounds.minY,
        this.model.poolBounds.maxZ
      ) );
      infoButton.top = bottomLeftPoolPoint.y + 10;
      infoButton.left = bottomLeftPoolPoint.x;
    };

    const materialControlNode = new MaterialControlNode( this.model.materialProperty, new Property( 1 ),
      Material.SIMPLE_MASS_MATERIALS, this.popupLayer, {
        supportCustomMaterial: false,
        tandem: options.tandem.createTandem( 'materialControlNode' )
      } );
    const primaryShapeSizeControlNode = new ShapeSizeControlNode(
      model.primaryShapeProperty,
      model.primaryWidthRatioProperty,
      model.primaryHeightRatioProperty,
      new DynamicProperty( model.primaryMassProperty, {
        derive: 'volumeProperty'
      } ),
      this.popupLayer, {
        labelNode: PrimarySecondaryPanelsNode.getPrimaryTagLabelNode(),
        tandem: tandem.createTandem( 'primaryShapeSizeControlNode' )
      }
    );
    const secondaryShapeSizeControlNodeTandem = tandem.createTandem( 'secondaryShapeSizeControlNode' );
    const secondaryShapeSizeControlNode = new ShapeSizeControlNode(
      model.secondaryShapeProperty,
      model.secondaryWidthRatioProperty,
      model.secondaryHeightRatioProperty,
      new DynamicProperty( model.secondaryMassProperty, {
        derive: 'volumeProperty'
      } ),
      this.popupLayer, {
        labelNode: PrimarySecondaryPanelsNode.getSecondaryTagLabelNode(),
        visibleProperty: createGatedVisibleProperty(
          new DynamicProperty( model.secondaryMassProperty, { derive: 'internalVisibleProperty' } ),
          secondaryShapeSizeControlNodeTandem
        ),
        tandem: secondaryShapeSizeControlNodeTandem
      }
    );
    this.rightBox = new MultiSectionPanelsNode(
      [ materialControlNode,
        primaryShapeSizeControlNode,
        secondaryShapeSizeControlNode ]
    );

    const objectDensityAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.objectDensityStringProperty, {
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ { readoutItem: model.materialProperty } ],
      tandem: tandem.createTandem( 'objectDensityAccordionBox' )
    } );

    const percentSubmergedAccordionBox = new SubmergedAccordionBox( {
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'percentSubmergedAccordionBox' )
    } );

    Multilink.multilink( [
      model.primaryMassProperty,
      model.secondaryMassProperty,
      model.modeProperty
    ], ( primaryMass, secondaryMass, mode ) => {
      const masses = mode === TwoBlockMode.ONE_BLOCK ? [ primaryMass ] : [ primaryMass, secondaryMass ];
      percentSubmergedAccordionBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass,
          readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.shapePatternStringProperty, { tag: mass.nameProperty } ),
          readoutFormat: { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: mass.tag.colorProperty }
        };
      } ) );
    } );

    const rightSideVBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'right',
      children: [
        this.rightBox,
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

    const blocksRadioButtonGroup = new BlocksRadioButtonGroup( model.modeProperty, {
      tandem: this.tandem.createTandem( 'blocksRadioButtonGroup' )
    } );

    ManualConstraint.create( this, [ rightSideVBox, fluidDensityPanel, blocksRadioButtonGroup ],
      ( rightSideVBoxWrapper, fluidDensityControlPanelWrapper, blocksRadioButtonGroupWrapper ) => {
        blocksRadioButtonGroupWrapper.left = rightSideVBoxWrapper.left;
        blocksRadioButtonGroupWrapper.bottom = fluidDensityControlPanelWrapper.bottom;
      } );

    this.addChild( blocksRadioButtonGroup );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ rightSideVBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {

      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    } );

    this.addChild( this.popupLayer );

    this.resetEmitter.addListener( () => {
      percentSubmergedAccordionBox.reset();
      objectDensityAccordionBox.reset();
    } );

    const scaleViews = this.massViews.filter( massView => massView instanceof ScaleView );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const primaryMassLayer = new Node( { pdomOrder: [] } );
    this.addChild( primaryMassLayer );
    const secondaryMassLayer = new Node( { pdomOrder: [] } );
    this.addChild( secondaryMassLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      primaryMassLayer,
      materialControlNode,
      primaryShapeSizeControlNode,

      secondaryMassLayer,
      secondaryShapeSizeControlNode,

      fluidDensityPanel,

      // The blocks are added (a) pool then (b) outside, but the focus order is (a) outside then (b) pool
      ..._.reverse( scaleViews.map( scaleView => scaleView.focusablePath ) ),

      this.poolScaleHeightControl
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView.mass === model.secondaryMassProperty.value ) {
        secondaryMassLayer.pdomOrder = [ ...secondaryMassLayer.pdomOrder!, massView.focusablePath ];
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
      else if ( massView.mass === model.primaryMassProperty.value ) {
        primaryMassLayer.pdomOrder = [ ...primaryMassLayer.pdomOrder!, massView.focusablePath ];
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
    };
    this.massViews.addItemAddedListener( massViewAdded );
    this.massViews.forEach( massViewAdded );

    this.pdomControlAreaNode.pdomOrder = [
      blocksRadioButtonGroup,
      displayOptionsPanel,
      objectDensityAccordionBox,
      percentSubmergedAccordionBox,
      infoButton,
      this.resetAllButton
    ];
  }

  /**
   * Tracks layout changes to position the info button.
   */
  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.positionInfoButton();
  }

  public static getBuoyancyShapesIcon(): Node {

    return DensityBuoyancyScreenView.getAngledIcon( 5.5, new Vector3( 0, 0, 0 ), scene => {

      const coneGeometry = ConeView.getConeGeometry( Cone.getRadiusFromRatio( 0.2 ), Cone.getHeightFromRatio( 0.35 ), true );

      const cone = new THREE.Mesh( coneGeometry, new THREE.MeshStandardMaterial( {
        map: DensityMaterials.woodColorTexture,
        normalMap: DensityMaterials.woodNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: DensityMaterials.woodRoughnessTexture,
        metalness: 0
        // NOTE: Removed the environment map for now
      } ) );
      cone.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.02, 0 ) ) );

      scene.add( cone );

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

densityBuoyancyCommon.register( 'BuoyancyShapesScreenView', BuoyancyShapesScreenView );