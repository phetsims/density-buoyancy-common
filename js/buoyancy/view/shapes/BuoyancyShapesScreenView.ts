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
import { AlignBox, ManualConstraint, Node, VBox } from '../../../../../scenery/js/imports.js';
import Panel from '../../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../../common/model/Material.js';
import FluidDensityControlNode from '../../../common/view/FluidDensityControlNode.js';
import BuoyancyDisplayOptionsPanel from '../../../common/view/BuoyancyDisplayOptionsPanel.js';
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
import DensityMaterials from '../../../common/view/DensityMaterials.js';
import ThreeUtils from '../../../../../mobius/js/ThreeUtils.js';
import DensityBuoyancyCommonColors from '../../../common/view/DensityBuoyancyCommonColors.js';
import Cone from '../../../common/model/Cone.js';
import ConeView from '../../../common/view/ConeView.js';
import ScaleView from '../../../common/view/ScaleView.js';
import MassView from '../../../common/view/MassView.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyShapesScreenView extends DensityBuoyancyScreenView<BuoyancyShapesModel> {

  protected rightBox: MultiSectionPanelsNode;

  private readonly positionInfoButton: () => void;

  public constructor( model: BuoyancyShapesModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const displayedMysteryMaterials = [
      Material.DENSITY_C,
      Material.DENSITY_D
    ];
    const invisibleMaterials = [ ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );

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

    // Info button and associated dialog
    const infoDialog = new ShapesInfoDialog( tandem.createTandem( 'infoDialog' ) );
    const infoButton = new InfoButton( {
      accessibleName: 'infoButton',
      scale: 0.5,
      iconFill: 'rgb( 41, 106, 163 )',
      touchAreaDilation: 20,
      listener: () => infoDialog.show(),
      tandem: tandem.createTandem( 'infoButton' )
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

    const materialComboBox = new MaterialControlNode( this.model.materialProperty, new Property( 1 ),
      DensityBuoyancyCommonConstants.SIMPLE_MASS_MATERIALS, this.popupLayer, {
        supportCustomMaterial: false,
        tandem: options.tandem.createTandem( 'materialComboBox' )
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
    const secondaryShapeSizeControlNode = new ShapeSizeControlNode(
      model.secondaryShapeProperty,
      model.secondaryWidthRatioProperty,
      model.secondaryHeightRatioProperty,
      new DynamicProperty( model.secondaryMassProperty, {
        derive: 'volumeProperty'
      } ),
      this.popupLayer, {
        labelNode: PrimarySecondaryPanelsNode.getSecondaryTagLabelNode(),
        visibleProperty: new DynamicProperty( model.secondaryMassProperty, { derive: 'internalVisibleProperty' } ),
        tandem: tandem.createTandem( 'secondaryShapeSizeControlNode' )
      }
    );
    this.rightBox = new MultiSectionPanelsNode(
      [ materialComboBox,
        primaryShapeSizeControlNode,
        secondaryShapeSizeControlNode ]
    );

    const densityAccordionBox = new DensityAccordionBox( {
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ { readoutItem: model.materialProperty } ],
      tandem: tandem.createTandem( 'densityAccordionBox' )
    } );

    const submergedAccordionBox = new SubmergedAccordionBox( {
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'submergedAccordionBox' )
    } );

    Multilink.multilink( [
      model.primaryMassProperty,
      model.secondaryMassProperty,
      model.modeProperty
    ], ( primaryMass, secondaryMass, mode ) => {
      const masses = mode === TwoBlockMode.ONE_BLOCK ? [ primaryMass ] : [ primaryMass, secondaryMass ];
      submergedAccordionBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass,
          readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.shapePatternStringProperty, { tag: mass.nameProperty } ),
          readoutFormat: { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: mass.tag.colorProperty }
        };
      } ) );
    } );

    const rightSideVBox = new VBox( {
      spacing: 5,
      align: 'right',
      children: [
        this.rightBox,
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

    const blocksRadioButtonGroup = new BlocksRadioButtonGroup( model.modeProperty, {
      tandem: this.tandem.createTandem( 'blocksRadioButtonGroup' )
    } );

    ManualConstraint.create( this, [ rightSideVBox, fluidDensityControlPanel, blocksRadioButtonGroup ],
      ( rightSideVBoxWrapper, fluidDensityControlPanelWrapper, blocksRadioButtonGroupWrapper ) => {
        blocksRadioButtonGroupWrapper.left = rightSideVBoxWrapper.left;
        blocksRadioButtonGroupWrapper.bottom = fluidDensityControlPanelWrapper.bottom;
      } );

    this.addChild( blocksRadioButtonGroup );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ rightSideVBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {

      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    }, {
      strictAxonDependencies: false // This workaround is deemed acceptable for visibleBoundsProperty listening, https://github.com/phetsims/faradays-electromagnetic-lab/issues/65
    } );

    this.addChild( this.popupLayer );

    this.resetEmitter.addListener( () => {
      submergedAccordionBox.reset();
      densityAccordionBox.reset();
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
      materialComboBox,
      primaryShapeSizeControlNode,

      secondaryMassLayer,
      secondaryShapeSizeControlNode,

      fluidDensityControlPanel,

      // The blocks are added (a) pool then (b) outside, but the focus order is (a) outside then (b) pool
      ..._.reverse( scaleViews.map( scaleView => scaleView.focusablePath ) )
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
      buoyancyDisplayOptionsPanel,
      densityAccordionBox,
      submergedAccordionBox,
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