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
import { AlignBox, HStrut, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityControlNode from '../../common/view/DensityControlNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import PrimarySecondaryPanelsNode from '../../common/view/PrimarySecondaryPanelsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityReadoutListNode from './DensityReadoutListNode.js';
import ShapeSizeControlNode from './ShapeSizeControlNode.js';
import BuoyancyShapesModel from '../model/BuoyancyShapesModel.js';
import { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import MaterialControlNode from '../../common/view/MaterialControlNode.js';
import MultiSectionPanelsNode from '../../common/view/MultiSectionPanelsNode.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyShapesScreenView extends SecondaryMassScreenView<BuoyancyShapesModel> {

  protected rightBox: Node;

  public constructor( model: BuoyancyShapesModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const densityControlPanel = new Panel( new DensityControlNode( model.liquidMaterialProperty, [
      Material.GASOLINE,
      Material.OIL,
      Material.WATER,
      Material.SEAWATER,
      Material.HONEY,
      Material.MERCURY,
      Material.DENSITY_C,
      Material.DENSITY_D
    ], this.popupLayer, tandem.createTandem( 'densityControlNode' ) ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( densityControlPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const displayOptionsNode = new DisplayOptionsNode( model );

    const densityContainer = new VBox( {
      spacing: 0,
      children: [
        new HStrut( displayOptionsNode.width - 10 ), // Same internal size as displayOptionsNode
        new DensityReadoutListNode( [ model.materialProperty ] )
      ]
    } );

    const densityBox = new AccordionBox( densityContainer, combineOptions<AccordionBoxOptions>( {
      titleNode: new Text( DensityBuoyancyCommonStrings.densityStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 160
      } ),
      expandedProperty: model.densityExpandedProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( new VBox( {
      spacing: 10,
      children: [
        densityBox,
        new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ]
    } ), {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    this.rightBox = new MultiSectionPanelsNode(
      [ new MaterialControlNode( this.model.materialProperty, new Property( 1 ), [
        // TODO: Factor out materials somewhere? https://github.com/phetsims/buoyancy/issues/43
        Material.STYROFOAM,
        Material.WOOD,
        Material.ICE,
        Material.BRICK,
        Material.ALUMINUM
      ], this.popupLayer, {
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

    this.addChild( new AlignBox( this.rightBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    }, {
      strictAxonDependencies: false // This workaround is deemed acceptable for visibleBoundsProperty listening, https://github.com/phetsims/faradays-electromagnetic-lab/issues/65
    } );

    this.addSecondMassControl( model.modeProperty );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyShapesScreenView', BuoyancyShapesScreenView );
