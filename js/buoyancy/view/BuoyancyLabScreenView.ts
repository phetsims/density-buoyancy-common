// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Lab screen of the Buoyancy simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { AlignBox, HBox, LayoutProxy, ManualConstraint, Node, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import FluidDensityControlNode from '../../common/view/FluidDensityControlNode.js';
import GravityControlNode from '../../common/view/GravityControlNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BuoyancyLabModel from '../model/BuoyancyLabModel.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import BuoyancyDisplayOptionsPanel from '../../common/view/BuoyancyDisplayOptionsPanel.js';
import BlockControlNode from '../../common/view/BlockControlNode.js';
import MultiSectionPanelsNode from '../../common/view/MultiSectionPanelsNode.js';
import FluidDisplacedAccordionBox from './FluidDisplacedAccordionBox.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ScaleView from '../../common/view/ScaleView.js';
import fluid_displaced_scale_icon_png from '../../../images/fluid_displaced_scale_icon_png.js';
import CuboidView from '../../common/view/CuboidView.js';
import fluidDensityRangePerM3 from '../../common/fluidDensityRangePerM3.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

export default class BuoyancyLabScreenView extends DensityBuoyancyScreenView<BuoyancyLabModel> {

  private readonly rightBox: MultiSectionPanelsNode;

  public constructor( model: BuoyancyLabModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    // In liters
    const maxBlockVolume = 10;

    const fluidDisplacedAccordionBox = new FluidDisplacedAccordionBox( this.waterLevelVolumeProperty,
      maxBlockVolume,
      model.pool.liquidMaterialProperty,
      model.gravityProperty, {
        tandem: tandem.createTandem( 'fluidDisplacedAccordionBox' )
      } );

    const leftSideVBox = new VBox( {
      align: 'left',
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      children: [
        fluidDisplacedAccordionBox,
        new BuoyancyDisplayOptionsPanel( model, {
          tandem: tandem.createTandem( 'buoyancyDisplayOptionsPanel' ),
          contentWidth: this.modelToViewPoint( new Vector3(
            this.model.poolBounds.left,
            this.model.poolBounds.top,
            this.model.poolBounds.front
          ) ).x - 2 * MARGIN
        } )
      ]
    } );

    const leftSideContent = new Node( {
      children: [ leftSideVBox ]
    } );
    this.addChild( leftSideContent );

    const positionLeftSideContent = ( nodelike: LayoutProxy | Node ) => {
      nodelike.bottom = this.visibleBoundsProperty.value.bottom - MARGIN;
      nodelike.left = this.visibleBoundsProperty.value.left + MARGIN;
    };

    // Reflow when the entire accordion box is hidden in phet-io studio.
    ManualConstraint.create( this, [ leftSideContent ], positionLeftSideContent );

    this.visibleBoundsProperty.link( () => {
      positionLeftSideContent( leftSideContent );
    } );

    const displayedMysteryMaterials = [
      Material.DENSITY_A,
      Material.DENSITY_B
    ];

    const invisibleMaterials = [ ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );

    const customMaterial = Material.createCustomLiquidMaterial( {
      density: 1000, // Same as water, in SI (kg/m^3)
      densityRange: fluidDensityRangePerM3
    } );

    const bottomNode = new HBox( {
      spacing: 2 * DensityBuoyancyCommonConstants.SPACING,
      children: [
        new Panel( new FluidDensityControlNode( model.pool.liquidMaterialProperty, [
            ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS,
            customMaterial,
            ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS
          ], customMaterial,
          this.popupLayer, {
            invisibleMaterials: invisibleMaterials,
            tandem: tandem.createTandem( 'densityControlNode' )
          } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS ),
        new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer, tandem.createTandem( 'gravityControlNode' ) ), DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ]
    } );

    this.addChild( new AlignBox( bottomNode, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    this.rightBox = new MultiSectionPanelsNode( [ new BlockControlNode(
      model.block,
      this.popupLayer,
      true,
      {
        tandem: tandem.createTandem( 'blockControlPanel' ),
        minCustomMass: 0.1,
        supportHiddenMaterial: true,
        maxVolumeLiters: maxBlockVolume,
        mysteryMaterials: [ Material.MATERIAL_O, Material.MATERIAL_P ]
      }
    ) ] );

    model.block.materialProperty.link( material => {
      if ( material === Material.MATERIAL_O ) {
        model.block.volumeProperty.value = 0.005;
      }
      else if ( material === Material.MATERIAL_P ) {
        model.block.volumeProperty.value = 0.005;
      }
    } );

    const densityAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.objectDensityStringProperty, {
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ { readoutItem: model.block.materialProperty } ],
      tandem: tandem.createTandem( 'densityAccordionBox' )
    } );

    const submergedAccordionBox = new SubmergedAccordionBox( {
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ {
        readoutItem: model.block,
        readoutNameProperty: DensityBuoyancyCommonStrings.shape.blockStringProperty
      } ],
      tandem: tandem.createTandem( 'submergedAccordionBox' )
    } );

    const rightSideVBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
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

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ rightSideVBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {

      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    }, {
      strictAxonDependencies: false // This workaround is deemed acceptable for visibleBoundsProperty listening, https://github.com/phetsims/faradays-electromagnetic-lab/issues/65
    } );

    // Popup last
    this.addChild( this.popupLayer );

    this.resetEmitter.addListener( () => {
      fluidDisplacedAccordionBox.reset();
      submergedAccordionBox.reset();
      densityAccordionBox.reset();
    } );

    const cuboidViews = this.massViews.filter( massView => massView instanceof CuboidView );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [
      cuboidViews[ 0 ].focusablePath,
      this.rightBox,
      bottomNode
    ];

    this.pdomControlAreaNode.pdomOrder = [
      leftSideContent,
      densityAccordionBox,
      submergedAccordionBox,
      this.resetAllButton
    ];
  }

  public static getFluidDisplacedAccordionBoxScaleIcon(): Node {

    // Hard coded zoom and view-port vector help to center the icon.
    const image = DensityBuoyancyScreenView.getThreeIcon( fluid_displaced_scale_icon_png, () => {
      return DensityBuoyancyScreenView.getAngledIcon( 8, new Vector3( 0, 0.25, 0 ), scene => {
        const scaleGeometry = ScaleView.getScaleGeometry();

        const scale = new THREE.Mesh( scaleGeometry, new THREE.MeshStandardMaterial( {
          color: 0xffffff,
          roughness: 0.2,
          metalness: 0.7,
          emissive: 0x666666
        } ) );

        scale.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0.25, 0 ) ) );
        scene.add( scale );
      }, null );
    } );
    image.setScaleMagnitude( 0.12 );
    return image;
  }
}

densityBuoyancyCommon.register( 'BuoyancyLabScreenView', BuoyancyLabScreenView );