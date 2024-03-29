// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { AlignBox, HBox, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import LiquidDensityControlNode from '../../common/view/LiquidDensityControlNode.js';
import BuoyancyDisplayOptionsNode from '../../common/view/BuoyancyDisplayOptionsNode.js';
import PrimarySecondaryPanelsNode from '../../common/view/PrimarySecondaryPanelsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import ShapeSizeControlNode from './ShapeSizeControlNode.js';
import BuoyancyShapesModel from '../model/BuoyancyShapesModel.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import MaterialControlNode from '../../common/view/MaterialControlNode.js';
import MultiSectionPanelsNode from '../../common/view/MultiSectionPanelsNode.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import ShapesInfoDialog from './ShapesInfoDialog.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import BlocksRadioButtonGroup from '../../common/view/BlocksRadioButtonGroup.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TwoBlockMode from '../../common/model/TwoBlockMode.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyShapesScreenView extends DensityBuoyancyScreenView<BuoyancyShapesModel> {

  protected rightBox: MultiSectionPanelsNode;

  private positionInfoButton: () => void;

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

    const densityControlPanel = new Panel( new LiquidDensityControlNode( model.liquidMaterialProperty, [
      ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS,
      ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS
    ], this.popupLayer, {
      invisibleMaterials: invisibleMaterials,
      tandem: tandem.createTandem( 'densityControlNode' )
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( new HBox( {
      spacing: 2 * MARGIN,
      align: 'bottom',
      children: [
        densityControlPanel,
        new BlocksRadioButtonGroup( model.modeProperty, {
          tandem: this.tandem.createTandem( 'blocksRadioButtonGroup' )
        } )
      ]
    } ), {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const displayOptionsNode = new BuoyancyDisplayOptionsNode( model );

    this.addChild( new AlignBox( new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS ), {
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

    this.rightBox = new MultiSectionPanelsNode(
      [ new MaterialControlNode( this.model.materialProperty, new Property( 1 ),
        DensityBuoyancyCommonConstants.SIMPLE_MASS_MATERIALS, this.popupLayer, {
          supportCustomMaterial: false,
          tandem: options.tandem.createTandem( 'materialComboBox' )
        } ),
        new ShapeSizeControlNode(
          model.primaryShapeProperty,
          model.primaryWidthRatioProperty,
          model.primaryHeightRatioProperty,
          new DynamicProperty( model.primaryMassProperty, {
            derive: 'volumeProperty'
          } ),
          this.popupLayer,
          {
            labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode()
          }
        ),
        new ShapeSizeControlNode(
          model.secondaryShapeProperty,
          model.secondaryWidthRatioProperty,
          model.secondaryHeightRatioProperty,
          new DynamicProperty( model.secondaryMassProperty, {
            derive: 'volumeProperty'
          } ),
          this.popupLayer,
          {
            labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode(),
            visibleProperty: new DynamicProperty( model.secondaryMassProperty, { derive: 'internalVisibleProperty' } )
          }
        ) ]
    );

    const densityBox = new DensityAccordionBox( {
      expandedProperty: model.densityExpandedProperty,
      contentWidthMax: this.rightBox.content.width,
      readoutItems: [ { readoutItem: model.materialProperty } ]
    } );

    const submergedBox = new SubmergedAccordionBox( model.gravityProperty, model.liquidMaterialProperty, {
      contentWidthMax: this.rightBox.content.width
    } );

    Multilink.multilink( [
      model.primaryMassProperty,
      model.secondaryMassProperty,
      model.modeProperty
    ], ( primaryMass, secondaryMass, mode ) => {
      const masses = mode === TwoBlockMode.ONE_BLOCK ? [ primaryMass ] : [ primaryMass, secondaryMass ];
      submergedBox.setReadoutItems( masses.map( ( mass, index ) => {
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
  }

  /**
   * Tracks layout changes to position the info button.
   * @param viewBounds
   */
  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.positionInfoButton();
  }
}

densityBuoyancyCommon.register( 'BuoyancyShapesScreenView', BuoyancyShapesScreenView );