// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import AlignPropertyBox from '../../../../scenery/js/layout/AlignPropertyBox.js';
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
import DensityReadoutListNode from './DensityReadoutListNode.js';
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

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    const densityControlPanel = new Panel( new DensityControlNode( model.liquidMaterialProperty, [
      Material.GASOLINE,
      Material.WATER,
      Material.SEAWATER,
      Material.HONEY,
      Material.MERCURY,
      Material.DENSITY_R,
      Material.DENSITY_S
    ], this.popupLayer ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignPropertyBox( densityControlPanel, this.visibleBoundsProperty, {
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

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

    this.addChild( new AlignPropertyBox( new VBox( {
      spacing: 10,
      children: [
        densityBox,
        new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ]
    } ), this.visibleBoundsProperty, {
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
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

    this.addChild( new AlignPropertyBox( this.rightBox, this.visibleBoundsProperty, {
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