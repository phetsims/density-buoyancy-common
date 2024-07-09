// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { AlignBox, ManualConstraint, Node, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import ABControlsNode from '../../common/view/ABControlsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyExploreModel from '../model/BuoyancyExploreModel.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import BuoyancyDisplayOptionsPanel from './BuoyancyDisplayOptionsPanel.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import BlocksModeRadioButtonGroup from '../../common/view/BlocksModeRadioButtonGroup.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { DensityMaterials } from '../../common/view/MaterialView.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import ForceDiagramNode from '../../common/view/ForceDiagramNode.js';
import buoyancy_explore_screen_block_png from '../../../images/buoyancy_explore_screen_block_png.js';
import CuboidView from '../../common/view/CuboidView.js';
import ScaleView from '../../common/view/ScaleView.js';
import MassView from '../../common/view/MassView.js';
import FluidDensityPanel from './FluidDensityPanel.js';
import BuoyancyScreenView from './BuoyancyScreenView.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import FluidIconMesh from '../../common/view/FluidIconMesh.js';

const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

type BuoyancyExploreScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class BuoyancyExploreScreenView extends BuoyancyScreenView<BuoyancyExploreModel> {

  private rightBox: ABControlsNode;

  public constructor( model: BuoyancyExploreModel, options: BuoyancyExploreScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      supportsDepthLines: true,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: true,
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

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

    const displayedMysteryMaterials = [
      Material.FLUID_A,
      Material.FLUID_B
    ];

    const invisibleMaterials = [ ...Material.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );

    this.rightBox = new ABControlsNode(
      model.massA,
      model.massB,
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
      densityRange: DensityBuoyancyCommonConstants.FLUID_DENSITY_RANGE_PER_M3
    } );

    const fluidDensityPanel = new FluidDensityPanel( model, customMaterial, invisibleMaterials, this.popupLayer, tandem.createTandem( 'fluidDensityControlPanel' ) );

    this.addChild( new AlignBox( fluidDensityPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    [ model.massA, model.massB ].forEach( mass => {
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
    const objectDensityAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.objectDensityStringProperty, {
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'objectDensityAccordionBox' )
    } );

    const percentSubmergedAccordionBox = new SubmergedAccordionBox( {
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'percentSubmergedAccordionBox' )
    } );

    const customExploreScreenFormatting = [ model.massA, model.massB ].map( mass => {
      return {
        readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.blockPatternStringProperty, { tag: mass.nameProperty } ),
        readoutFormat: { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: mass.tag.colorProperty }
      };
    } );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.massB.visibleProperty.link( visible => {
      const masses = visible ? [ model.massA, model.massB ] : [ model.massA ];
      objectDensityAccordionBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass.materialProperty,
          readoutNameProperty: customExploreScreenFormatting[ index ].readoutNameProperty,
          readoutFormat: customExploreScreenFormatting[ index ].readoutFormat
        };
      } ) );
      percentSubmergedAccordionBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass,
          readoutNameProperty: customExploreScreenFormatting[ index ].readoutNameProperty,
          readoutFormat: customExploreScreenFormatting[ index ].readoutFormat
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

    const blocksModeRadioButtonGroup = new BlocksModeRadioButtonGroup( model.modeProperty, {
      tandem: this.tandem.createTandem( 'blocksModeRadioButtonGroup' )
    } );

    ManualConstraint.create( this, [ this.resetAllButton, blocksModeRadioButtonGroup ],
      ( resetAllButtonWrapper, blocksModeRadioButtonGroupWrapper ) => {
        blocksModeRadioButtonGroupWrapper.right = resetAllButtonWrapper.left - DensityBuoyancyCommonConstants.MARGIN;
        blocksModeRadioButtonGroupWrapper.bottom = resetAllButtonWrapper.bottom;
      } );

    this.visibleBoundsProperty.link( visibleBounds => {
      blocksModeRadioButtonGroup.bottom = this.visibleBoundsProperty.value.bottom - MARGIN;
    } );

    this.addChild( blocksModeRadioButtonGroup );

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

    const cuboidViews = this.massViews.filter( massView => massView instanceof CuboidView );
    const scaleViews = this.massViews.filter( massView => massView instanceof ScaleView );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cuboidViews[ 0 ].focusablePath,
      this.rightBox.controlANode,

      cuboidPDOMLayer,
      this.rightBox.controlBNode,

      fluidDensityPanel,

      // The blocks are added (a) pool then (b) outside, but the focus order is (a) outside then (b) pool
      ..._.reverse( scaleViews.map( scaleView => scaleView.focusablePath ) ),
      this.poolScaleHeightControl
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView instanceof CuboidView && massView.mass === model.massB ) {
        cuboidPDOMLayer.pdomOrder = [ ...cuboidPDOMLayer.pdomOrder!, massView.focusablePath ];

        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
    };
    this.massViews.addItemAddedListener( massViewAdded );
    this.massViews.forEach( massViewAdded );

    this.pdomControlAreaNode.pdomOrder = [
      blocksModeRadioButtonGroup,
      displayOptionsPanel,
      objectDensityAccordionBox,
      percentSubmergedAccordionBox,
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

        scene.add( new FluidIconMesh( new Vector3( 0, -0.5, 0.12 ) ) );
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