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
import { AlignBox, HBox, LayoutProxy, ManualConstraint, Node, RichText, VBox } from '../../../../scenery/js/imports.js';
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
import BuoyancyDisplayOptionsNode from '../../common/view/BuoyancyDisplayOptionsNode.js';
import BlockControlNode from '../../common/view/BlockControlNode.js';
import MultiSectionPanelsNode from '../../common/view/MultiSectionPanelsNode.js';
import FluidDisplacedPanel from './FluidDisplacedPanel.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ScaleView from '../../common/view/ScaleView.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScaleHeightControl from '../../common/view/ScaleHeightControl.js';
import fluid_displaced_scale_icon_png from '../../../images/fluid_displaced_scale_icon_png.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import CuboidView from '../../common/view/CuboidView.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;
const DESIRED_LEFT_SIDE_MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyLabScreenView extends DensityBuoyancyScreenView<BuoyancyLabModel> {

  private readonly rightBox: MultiSectionPanelsNode;
  private readonly scaleHeightControl: ScaleHeightControl;

  public constructor( model: BuoyancyLabModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    // In liters
    const maxBlockVolume = 10;

    const fluidDisplacedAccordionBoxTandem = tandem.createTandem( 'fluidDisplacedAccordionBox' );

    const fluidDisplacedAccordionBox = new AccordionBox( new FluidDisplacedPanel( this.waterLevelVolumeProperty,
      maxBlockVolume,
      model.liquidMaterialProperty,
      model.gravityProperty ), {
      titleNode: new RichText( DensityBuoyancyCommonStrings.fluidDisplacedStringProperty, {
        font: new PhetFont( 14 ), // Matches the checkbox label font size
        maxWidth: 100,
        lineWrap: 90,
        maxHeight: 40
      } ),
      expandedDefaultValue: false,

      titleAlignX: 'left',
      titleAlignY: 'center',
      titleXMargin: 5,
      titleXSpacing: 10,

      contentXMargin: 2,
      contentYMargin: 2,
      contentXSpacing: 2,
      contentYSpacing: 2,
      tandem: fluidDisplacedAccordionBoxTandem
    } );

    this.resetEmitter.addListener( () => fluidDisplacedAccordionBox.expandedProperty.reset() );

    const leftSideVBox = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        fluidDisplacedAccordionBox,
        new BuoyancyDisplayOptionsNode( model, {
          tandem: tandem.createTandem( 'buoyancyDisplayOptionsPanel' ),
          contentWidth: this.modelToViewPoint( new Vector3(
            this.model.poolBounds.left,
            this.model.poolBounds.top,
            this.model.poolBounds.front
          ) ).x - 2 * DESIRED_LEFT_SIDE_MARGIN
        } )
      ]
    } );

    const leftSideContent = new Node( {
      children: [ leftSideVBox ]
    } );
    this.addChild( leftSideContent );

    const positionLeftSideContent = ( nodelLike: LayoutProxy | Node ) => {
      nodelLike.bottom = this.visibleBoundsProperty.value.bottom - DESIRED_LEFT_SIDE_MARGIN;
      nodelLike.left = this.visibleBoundsProperty.value.left + DESIRED_LEFT_SIDE_MARGIN;
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

    const bottomNode = new HBox( {
      spacing: 2 * MARGIN,
      children: [
        new Panel( new FluidDensityControlNode( model.liquidMaterialProperty, [
          ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS,
          ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS
        ], this.popupLayer, {
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
      model.primaryMass,
      this.popupLayer,
      {
        tandem: tandem.createTandem( 'blockControlPanel' ),
        minCustomMass: 0.1,
        supportHiddenMaterial: true,
        maxVolumeLiters: maxBlockVolume,
        mysteryMaterials: [ Material.MATERIAL_O, Material.MATERIAL_P ]
      }
    ) ] );

    model.primaryMass.materialProperty.link( material => {
      if ( material === Material.MATERIAL_O ) {
        model.primaryMass.volumeProperty.value = 0.005;
      }
      else if ( material === Material.MATERIAL_P ) {
        model.primaryMass.volumeProperty.value = 0.005;
      }
    } );

    const densityAccordionBox = new DensityAccordionBox( {
      expandedProperty: model.densityExpandedProperty,
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ { readoutItem: model.primaryMass.materialProperty } ],
      tandem: tandem.createTandem( 'densityAccordionBox' )
    } );

    const submergedAccordionBox = new SubmergedAccordionBox( {
        contentWidthMax: this.rightBox.content.width,
        readoutItems: [ {
          readoutItem: model.primaryMass,
          readoutNameProperty: DensityBuoyancyCommonStrings.shape.blockStringProperty
        } ],
        tandem: tandem.createTandem( 'submergedAccordionBox' )
      } );

    const rightSideVBox = new VBox( {
      spacing: MARGIN / 2, // Reducing margin here for the panels not to overlap with the Scale Height Slider
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
      margin: MARGIN / 2
    } ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ rightSideVBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    }, {
      strictAxonDependencies: false // This workaround is deemed acceptable for visibleBoundsProperty listening, https://github.com/phetsims/faradays-electromagnetic-lab/issues/65
    } );

    this.scaleHeightControl = new ScaleHeightControl( model.poolScale, model.poolScaleHeightProperty,
      model.poolBounds, model.pool.liquidYInterpolatedProperty, this, {
        tandem: tandem.createTandem( 'scaleHeightControl' )
      } );
    this.addChild( this.scaleHeightControl );

    // Popup last
    this.addChild( this.popupLayer );

    const cuboidViews = this.massViews.filter( massView => massView instanceof CuboidView );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [
      cuboidViews[ 0 ].focusablePath,
      this.scaleHeightControl,
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

  public static getFluidDisplacedPanelScaleIcon(): Node {

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

  /**
   * Tracks layout changes to position the scale height slider
   */
  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    // X margin should be based on the front of the pool
    this.scaleHeightControl.x = this.modelToViewPoint( new Vector3(
      this.model.poolBounds.maxX,
      this.model.poolBounds.minY,
      this.model.poolBounds.maxZ
    ) ).plusXY( DensityBuoyancyCommonConstants.MARGIN / 2, 0 ).x;

    // Y should be based on the bottom of the front of the scale (in the middle of the pool)
    this.scaleHeightControl.y = this.modelToViewPoint( new Vector3(
      this.model.poolBounds.maxX,
      this.model.poolBounds.minY,
      this.model.poolScale.getBounds().maxZ
    ) ).y;
  }
}

densityBuoyancyCommon.register( 'BuoyancyLabScreenView', BuoyancyLabScreenView );