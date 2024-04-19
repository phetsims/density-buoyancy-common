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
import { AlignBox, HBox, Image, Node, VBox } from '../../../../scenery/js/imports.js';
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
import ScaleHeightSlider from '../../common/view/ScaleHeightSlider.js';
import DensityBuoyancyCommonQueryParameters from '../../common/DensityBuoyancyCommonQueryParameters.js';
import fluid_displaced_scale_icon_png from '../../../images/fluid_displaced_scale_icon_png.js';
import Multilink from '../../../../axon/js/Multilink.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;
const DESIRED_LEFT_SIDE_MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyLabScreenView extends DensityBuoyancyScreenView<BuoyancyLabModel> {

  private rightBox: MultiSectionPanelsNode;
  private positionWaterLevelSlider: () => void;

  public constructor( model: BuoyancyLabModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    // In liters
    const maxBlockVolume = 10;

    const fluidDisplacedPanel = new FluidDisplacedPanel( this.waterLevelVolumeProperty,
      maxBlockVolume,
      model.liquidMaterialProperty,
      model.gravityProperty, {
        visibleProperty: model.showFluidDisplacedProperty
      } );

    const leftSideVBox = new VBox( {
      align: 'left',
      children: [
        fluidDisplacedPanel,
        new MultiSectionPanelsNode( [ new BuoyancyDisplayOptionsNode( model, {
          showFluidDisplacedProperty: model.showFluidDisplacedProperty
        } ) ] )
      ]
    } );

    const leftSideContent = new Node( {
      children: [ leftSideVBox ]
    } );
    this.addChild( leftSideContent );

    const applyDefaultMargins = () => {
      leftSideContent.bottom = this.visibleBoundsProperty.value.bottom - DESIRED_LEFT_SIDE_MARGIN;
      leftSideContent.left = this.visibleBoundsProperty.value.left + DESIRED_LEFT_SIDE_MARGIN;
      leftSideVBox.spacing = DESIRED_LEFT_SIDE_MARGIN;
    };

    // Custom layout code to even out margins when we are close to overlapping with the ground because the
    // fluidDisplacedPanel is showing
    Multilink.multilink( [ this.visibleBoundsProperty, fluidDisplacedPanel.visibleProperty ], ( visibleBounds, fluidDisplacedPanelVisible ) => {
      applyDefaultMargins();

      // No worry of layout going above ground unless the fluid displaced panel is showing
      if ( fluidDisplacedPanelVisible ) {

        // In screen view coordinates (0,0 is at the top left of layout bounds)
        const poolTopFrontHeight = this.modelToViewPoint( new Vector3( this.model.poolBounds.left, this.model.poolBounds.maxY, this.model.poolBounds.front ) );

        // Space under the ground that we have for the two panels
        const availableHeight = visibleBounds.bottom - poolTopFrontHeight.y;

        // The height of just content, no margins counted (top/middle/bottom)
        const contentHeightNotMargins = leftSideVBox.height - DESIRED_LEFT_SIDE_MARGIN;

        const availableMarginSpace = availableHeight - contentHeightNotMargins;
        assert && assert( availableMarginSpace > 0, 'left control panels on lab screen are too big to fit under the ground' );
        if ( availableMarginSpace < 3 * DESIRED_LEFT_SIDE_MARGIN ) {
          const calculatedMargin = availableMarginSpace > 0 ? availableMarginSpace / 3 : 1;
          leftSideVBox.spacing = calculatedMargin;
          leftSideContent.bottom = visibleBounds.bottom - calculatedMargin;
        }
      }
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

    const densityBox = new DensityAccordionBox( {
      expandedProperty: model.densityExpandedProperty,
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ { readoutItem: model.primaryMass.materialProperty } ]
    } );

    const submergedBox = new SubmergedAccordionBox(
      model.gravityProperty, model.liquidMaterialProperty, {
        contentWidthMax: this.rightBox.content.width,
        readoutItems: [ {
          readoutItem: model.primaryMass,
          readoutNameProperty: DensityBuoyancyCommonStrings.shape.blockStringProperty
        } ]
      } );

    const rightSideVBox = new VBox( {
      spacing: MARGIN / 2, // Reducing margin here for the panels not to overlap with the Scale Height Slider
      align: 'right',
      children: [
        this.rightBox,
        densityBox,
        submergedBox
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

    this.addChild( this.popupLayer );

    // Info button and associated dialog
    const scaleHeightSlider = new ScaleHeightSlider( model.poolScale, model.poolScaleHeightProperty,
      model.poolBounds, model.pool.liquidYInterpolatedProperty, this, {
        tandem: tandem.createTandem( 'scaleHeightSlider' )
      } );
    this.addChild( scaleHeightSlider );

    this.positionWaterLevelSlider = () => {
      const bottomRightPoolPoint = this.modelToViewPoint( new Vector3(
        this.model.poolBounds.maxX,
        this.model.poolBounds.minY,
        this.model.poolBounds.maxZ
      ) );
      scaleHeightSlider.bottom = bottomRightPoolPoint.y;
      scaleHeightSlider.left = bottomRightPoolPoint.x + DensityBuoyancyCommonConstants.MARGIN / 2;
    };
  }

  public static getFluidDisplacedPanelScaleIcon(): Node {

    if ( DensityBuoyancyCommonQueryParameters.generateIconImages && ThreeUtils.isWebGLEnabled() ) {

      // Hard coded zoom and view-port vector help to center the icon.
      // TODO: save image again once scale icon design is settled, https://github.com/phetsims/density-buoyancy-common/issues/95 and https://github.com/phetsims/buoyancy/issues/141
      const image = DensityBuoyancyScreenView.getAngledIcon( 8, new Vector3( 0, 0.25, 0 ), scene => {
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
      image.setScaleMagnitude( 0.12 );
      return image;
    }
    else {
      const image = new Image( fluid_displaced_scale_icon_png );
      image.setScaleMagnitude( 0.12 );
      return image;
    }
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

    this.positionWaterLevelSlider();
  }
}

densityBuoyancyCommon.register( 'BuoyancyLabScreenView', BuoyancyLabScreenView );