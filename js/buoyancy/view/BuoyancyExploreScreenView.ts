// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { AlignBox, ManualConstraint, Node, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import FluidDensityControlNode from '../../common/view/FluidDensityControlNode.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyExploreModel from '../model/BuoyancyExploreModel.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import BuoyancyDisplayOptionsPanel from '../../common/view/BuoyancyDisplayOptionsPanel.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import BlocksRadioButtonGroup from '../../common/view/BlocksRadioButtonGroup.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import DensityMaterials from '../../common/view/DensityMaterials.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import ForceDiagramNode from '../../common/view/ForceDiagramNode.js';
import buoyancy_explore_screen_block_png from '../../../images/buoyancy_explore_screen_block_png.js';
import CuboidView from '../../common/view/CuboidView.js';
import ScaleView from '../../common/view/ScaleView.js';
import MassView from '../../common/view/MassView.js';
import fluidDensityRangePerM3 from '../../common/fluidDensityRangePerM3.js';

export default class BuoyancyExploreScreenView extends DensityBuoyancyScreenView<BuoyancyExploreModel> {

  private rightBox: PrimarySecondaryControlsNode;

  public constructor( model: BuoyancyExploreModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const buoyancyDisplayOptionsPanel = new BuoyancyDisplayOptionsPanel( model, {
      tandem: tandem.createTandem( 'buoyancyDisplayOptionsPanel' ),
      contentWidth: this.modelToViewPoint( new Vector3(
        this.model.poolBounds.left,
        this.model.poolBounds.top,
        this.model.poolBounds.front
      ) ).x - 2 * DensityBuoyancyCommonConstants.MARGIN
    } );

    this.addChild( new AlignBox( buoyancyDisplayOptionsPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: DensityBuoyancyCommonConstants.MARGIN
    } ) );

    const displayedMysteryMaterials = [
      Material.DENSITY_A,
      Material.DENSITY_B
    ];

    const invisibleMaterials = [ ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      {
        tandem: tandem,
        minCustomMass: 0.1,
        supportHiddenMaterial: true,
        mysteryMaterials: [ Material.MATERIAL_X, Material.MATERIAL_Y ]
      }
    );

    const customMaterial = Material.createCustomLiquidMaterial( {
      density: 1000, // Same as water, in SI (kg/m^3)
      densityRange: fluidDensityRangePerM3
    } );

    const fluidDensityControlPanel = new Panel( new FluidDensityControlNode( model.pool.liquidMaterialProperty, [
        ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS,
        customMaterial,
        ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS
      ], customMaterial,
      this.popupLayer, {
        invisibleMaterials: invisibleMaterials,
        tandem: tandem.createTandem( 'densityControlNode' )
      } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( fluidDensityControlPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: DensityBuoyancyCommonConstants.MARGIN
    } ) );

    [ model.primaryMass, model.secondaryMass ].forEach( mass => {
      mass.materialProperty.link( material => {
        if ( material === Material.MATERIAL_X ) {
          mass.volumeProperty.value = 0.003;
        }
        else if ( material === Material.MATERIAL_Y ) {
          mass.volumeProperty.value = 0.001;
        }
      } );
    } );

    // Materials are set in densityBox.setMaterials() below
    const densityAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.objectDensityStringProperty, {
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'densityAccordionBox' )
    } );

    const submergedAccordionBox = new SubmergedAccordionBox( {
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'submergedAccordionBox' )
    } );

    const customExploreScreenFormatting = [ model.primaryMass, model.secondaryMass ].map( mass => {
      return {
        readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.blockPatternStringProperty, { tag: mass.nameProperty } ),
        readoutFormat: { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: mass.tag.colorProperty }
      };
    } );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.secondaryMass.visibleProperty.link( visible => {
      const masses = visible ? [ model.primaryMass, model.secondaryMass ] : [ model.primaryMass ];
      densityAccordionBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass.materialProperty,
          readoutNameProperty: customExploreScreenFormatting[ index ].readoutNameProperty,
          readoutFormat: customExploreScreenFormatting[ index ].readoutFormat
        };
      } ) );
      submergedAccordionBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass,
          readoutNameProperty: customExploreScreenFormatting[ index ].readoutNameProperty,
          readoutFormat: customExploreScreenFormatting[ index ].readoutFormat
        };
      } ) );
    } );

    const rightSideVBox = new VBox( {
      spacing: 10,
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
      margin: DensityBuoyancyCommonConstants.MARGIN
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

    const cuboidViews = this.massViews.filter( massView => massView instanceof CuboidView );
    const scaleViews = this.massViews.filter( massView => massView instanceof ScaleView );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cuboidViews[ 0 ].focusablePath,
      this.rightBox.primaryControlNode,

      cuboidPDOMLayer,
      this.rightBox.secondaryControlNode,

      fluidDensityControlPanel,

      // The blocks are added (a) pool then (b) outside, but the focus order is (a) outside then (b) pool
      ..._.reverse( scaleViews.map( scaleView => scaleView.focusablePath ) )
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView instanceof CuboidView && massView.mass === model.secondaryMass ) {
        cuboidPDOMLayer.pdomOrder = [ ...cuboidPDOMLayer.pdomOrder!, massView.focusablePath ];

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
      this.resetAllButton
    ];
  }

  public static getBuoyancyExploreIcon(): Node {
    const boxScene = DensityBuoyancyScreenView.getThreeIcon( buoyancy_explore_screen_block_png, () => {
      return DensityBuoyancyScreenView.getAngledIcon( 5.5, new Vector3( 0, 0, 0 ), scene => {

        const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

        const box = new THREE.Mesh( boxGeometry, new THREE.MeshStandardMaterial( {
          map: DensityMaterials.woodColorTexture,
          normalMap: DensityMaterials.woodNormalTexture,
          normalScale: new THREE.Vector2( 1, -1 ),
          roughnessMap: DensityMaterials.woodRoughnessTexture,
          metalness: 0

          // NOTE: Removed the environment map for now
        } ) );
        box.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0, 0 ) ) );

        scene.add( box );

        const waterMaterial = new THREE.MeshLambertMaterial( {
          transparent: true
        } );
        const waterColor = DensityBuoyancyCommonColors.materialWaterColorProperty.value;
        waterMaterial.color = ThreeUtils.colorToThree( waterColor );
        waterMaterial.opacity = waterColor.alpha;

        // Fake it!
        const waterGeometry = new THREE.BoxGeometry( 1, 1, 0.2 );

        const water = new THREE.Mesh( waterGeometry, waterMaterial );
        water.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.5, 0.12 ) ) );
        scene.add( water );
      } );
    } );


    return new Node( {
      children: [
        boxScene,
        ForceDiagramNode.getExploreIcon().mutate( {
          center: boxScene.center.plusXY( 0, boxScene.height * 0.09 )
        } )
      ]
    } );
  }
}

densityBuoyancyCommon.register( 'BuoyancyExploreScreenView', BuoyancyExploreScreenView );