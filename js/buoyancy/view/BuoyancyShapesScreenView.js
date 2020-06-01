// Copyright 2019-2020, University of Colorado Boulder

/**
 * The main view for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityControlNode from '../../common/view/DensityControlNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import PrimarySecondaryPanelsNode from '../../common/view/PrimarySecondaryPanelsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityReadoutListNode form './DensityReadoutListNode.js';
import ShapeSizeControlNode from './ShapeSizeControlNode.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class BuoyancyShapesScreenView extends SecondaryMassScreenView {

  /**
   * @param {BuoyancyIntroModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem, {
      cameraLookAt: new Vector3( 0, -0.18, 0 )
    } );

    if ( !this.enabled ) {
      return this;
    }

    const densityControlPanel = new Panel( new DensityControlNode( model.liquidMaterialProperty, [
      Material.AIR,
      Material.GASOLINE,
      Material.WATER,
      Material.SEAWATER,
      Material.HONEY,
      Material.MERCURY,
      Material.DENSITY_R,
      Material.DENSITY_S
    ], this.popupLayer ), merge( {
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - MARGIN
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );
    this.addChild( densityControlPanel );

    const displayOptionsNode = new DisplayOptionsNode( model );

    const densityContainer = new VBox( {
      spacing: 0,
      children: [
        new HStrut( displayOptionsNode.width - 10 ), // Same internal size as displayOptionsNode
        new DensityReadoutListNode( [ new Property( Material.WOOD ) ] )
      ]
    } );

    // TODO: check common accordion box styles
    const densityBox = new AccordionBox( densityContainer, merge( {
      titleNode: new Text( densityBuoyancyCommonStrings.density, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 160
      } ),
      expandedProperty: model.densityReadoutExpandedProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new VBox( {
      spacing: 10,
      children: [
        densityBox,
        new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ],
      left: this.layoutBounds.left + MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    } ) );

    // @private {Node}
    this.rightBox = new PrimarySecondaryPanelsNode(
      new ShapeSizeControlNode(
        model.primaryShapeProperty,
        model.primaryWidthRatioProperty,
        model.primaryHeightRatioProperty,
        new DynamicProperty( model.primaryMassProperty, {
          derive: 'volumeProperty'
        } ),
        this.popupLayer,
        { labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode() }
      ),
      new ShapeSizeControlNode(
        model.secondaryShapeProperty,
        model.secondaryWidthRatioProperty,
        model.secondaryHeightRatioProperty,
        new DynamicProperty( model.secondaryMassProperty, {
          derive: 'volumeProperty'
        } ),
        this.popupLayer,
        { labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode() }
      ),
      model.secondaryMassVisibleProperty
    );

    this.addChild( new AlignBox( this.rightBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addSecondMassControl();

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyShapesScreenView', BuoyancyShapesScreenView );
export default BuoyancyShapesScreenView;