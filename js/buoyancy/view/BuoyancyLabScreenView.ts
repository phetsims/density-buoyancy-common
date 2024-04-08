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
import { AlignBox, HBox, Node, VBox } from '../../../../scenery/js/imports.js';
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

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

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

    const leftSideVBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.MARGIN / 2,
      align: 'left',
      children: [
        new FluidDisplacedPanel( this.waterLevelVolumeProperty,
          maxBlockVolume,
          BuoyancyLabScreenView.getFluidDisplacedPanelScaleIcon(),
          model.liquidMaterialProperty,
          model.gravityProperty, {
            visibleProperty: model.showFluidDisplacedProperty
          } ),
        new MultiSectionPanelsNode( [ new BuoyancyDisplayOptionsNode( model, {
          showFluidDisplacedProperty: model.showFluidDisplacedProperty
        } ) ] )
      ]
    } );

    this.addChild( new AlignBox(
      leftSideVBox, {
        alignBoundsProperty: this.visibleBoundsProperty,
        xAlign: 'left',
        yAlign: 'bottom',
        margin: MARGIN
      } ) );

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
      spacing: 10,
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
    const waterLevelSlider = new ScaleHeightSlider( model.poolScale, model.poolScaleHeightProperty,
      model.poolBounds, model.pool.liquidYInterpolatedProperty, {
        tandem: tandem.createTandem( 'waterLevelSlider' )
      } );
    this.addChild( waterLevelSlider );

    this.positionWaterLevelSlider = () => {
      const bottomRightPoolPoint = this.modelToViewPoint( new Vector3(
        this.model.poolBounds.maxX,
        this.model.poolBounds.minY,
        this.model.poolBounds.maxZ
      ) );
      waterLevelSlider.bottom = bottomRightPoolPoint.y;
      waterLevelSlider.left = bottomRightPoolPoint.x + DensityBuoyancyCommonConstants.MARGIN / 2;
    };
  }

  private static getFluidDisplacedPanelScaleIcon(): Node {

    // let image: Node;

    // TODO: save image again once scale icon design is settled, https://github.com/phetsims/density-buoyancy-common/issues/95
    // if ( DensityBuoyancyCommonQueryParameters.generateIconImages ) {
    if ( !ThreeUtils.isWebGLEnabled() ) {
      return DensityBuoyancyScreenView.getFallbackIcon();
    }

    // Hard coded zoom and view-port vector help to center the icon.
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
    // }
    // else {
    //   image = new Image( fluid_displaced_scale_icon_png );
    // }
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

    this.positionWaterLevelSlider();
  }
}

densityBuoyancyCommon.register( 'BuoyancyLabScreenView', BuoyancyLabScreenView );