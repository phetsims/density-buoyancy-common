// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Lab screen of the Buoyancy simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { AlignBox, HBox, LayoutProxy, ManualConstraint, Node, VBox } from '../../../../scenery/js/imports.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import GravityControlNode from '../../common/view/GravityControlNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BuoyancyLabModel from '../model/BuoyancyLabModel.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import BuoyancyDisplayOptionsPanel from './BuoyancyDisplayOptionsPanel.js';
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
import FluidDensityPanel from './FluidDensityPanel.js';
import BuoyancyScreenView from './BuoyancyScreenView.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

type BuoyancyLabScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class BuoyancyLabScreenView extends BuoyancyScreenView<BuoyancyLabModel> {

  private readonly rightBox: MultiSectionPanelsNode;

  public constructor( model: BuoyancyLabModel, options: BuoyancyLabScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      supportsDepthLines: true,
      forcesInitiallyDisplayed: true,
      massValuesInitiallyDisplayed: false,
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    // In liters
    const maxBlockVolume = 10;

    const fluidDisplacedAccordionBox = new FluidDisplacedAccordionBox(
      model.fluidDisplacedVolumeProperty,
      maxBlockVolume,
      model.pool.fluidMaterialProperty,
      model.gravityProperty, {
        tandem: tandem.createTandem( 'fluidDisplacedAccordionBox' )
      } );

    const leftSideVBox = new VBox( {
      align: 'left',
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      children: [
        fluidDisplacedAccordionBox,
        new BuoyancyDisplayOptionsPanel( this.displayProperties, {
          tandem: tandem.createTandem( 'displayOptionsPanel' ),
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
      Material.FLUID_A,
      Material.FLUID_B
    ];

    const invisibleMaterials = [ ...Material.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );

    const gravityPanelTandem = tandem.createTandem( 'gravityPanel' );

    const bottomNode = new HBox( {
      spacing: 2 * DensityBuoyancyCommonConstants.SPACING,
      children: [
        new FluidDensityPanel( model, invisibleMaterials, this.popupLayer, tandem.createTandem( 'fluidDensityPanel' ) ),
        new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer, gravityPanelTandem ), combineOptions<PanelOptions>( {
          tandem: gravityPanelTandem
        }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) )
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
        tandem: tandem.createTandem( 'blockPanel' ),
        minCustomMass: 0.1,
        maxVolumeLiters: maxBlockVolume
      }
    ) ] );

    model.block.materialProperty.link( material => {
      if ( material === Material.MATERIAL_T ) {
        model.block.volumeProperty.value = 0.005;
      }
      else if ( material === Material.MATERIAL_U ) {
        model.block.volumeProperty.value = 0.005;
      }
    } );

    const objectDensityAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.objectDensityStringProperty, {
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ { readoutItem: model.block.materialProperty } ],
      tandem: tandem.createTandem( 'objectDensityAccordionBox' )
    } );

    const percentSubmergedAccordionBox = new SubmergedAccordionBox( {
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ {
        readoutItem: model.block,
        readoutNameProperty: DensityBuoyancyCommonStrings.shape.blockStringProperty
      } ],
      tandem: tandem.createTandem( 'percentSubmergedAccordionBox' )
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

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ rightSideVBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {

      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    } );

    // Popup last
    this.addChild( this.popupLayer );

    this.resetEmitter.addListener( () => {
      fluidDisplacedAccordionBox.reset();
      percentSubmergedAccordionBox.reset();
      objectDensityAccordionBox.reset();
    } );

    const cuboidViews = this.massViews.filter( massView => massView instanceof CuboidView );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [
      cuboidViews[ 0 ].focusablePath,
      this.poolScaleHeightControl,
      this.rightBox,
      bottomNode
    ];

    this.pdomControlAreaNode.pdomOrder = [
      leftSideContent,
      objectDensityAccordionBox,
      percentSubmergedAccordionBox,
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