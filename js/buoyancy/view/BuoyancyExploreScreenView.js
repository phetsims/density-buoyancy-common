// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColorProfile from '../../common/view/DensityBuoyancyCommonColorProfile.js';
import DensityControlNode from '../../common/view/DensityControlNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import GravityControlNode from '../../common/view/GravityControlNode.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class BuoyancyExploreScreenView extends SecondaryMassScreenView {

  /**
   * @param {BuoyancyExploreModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem, {
      cameraLookAt: new Vector3( 0, -0.18, 0 )
    } );

    if ( !this.enabled ) {
      return this;
    }

    const displayOptionsNode = new DisplayOptionsNode( model );

    const densityAText = new Text( '', {
      maxWidth: 120,
      font: new PhetFont( { size: 14, weight: 'bold' } ),
      fill: DensityBuoyancyCommonColorProfile.labelAProperty
    } );
    const densityBText = new Text( '', {
      maxWidth: 120,
      font: new PhetFont( { size: 14, weight: 'bold' } ),
      fill: DensityBuoyancyCommonColorProfile.labelBProperty
    } );

    model.primaryMass.materialProperty.link( material => {
      // TODO: that string utils fill-in or to-fixed density conversion
      densityAText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPerLiterPattern, {
        value: Utils.toFixed( material.density / 1000, 2 )
      } );
    } );
    model.secondaryMass.materialProperty.link( material => {
      densityBText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPerLiterPattern, {
        value: Utils.toFixed( material.density / 1000, 2 )
      } );
    } );

    // TODO: handle maxWidths here nicely
    const labelAText = new Text( densityBuoyancyCommonStrings.blockA, { font: new PhetFont( 14 ), maxWidth: 200 } );
    const labelBText = new Text( densityBuoyancyCommonStrings.blockB, { font: new PhetFont( 14 ), maxWidth: 200 } );

    // vertical alignment
    densityBText.top = densityAText.bottom + 3;
    labelAText.centerY = densityAText.centerY;
    labelBText.centerY = densityBText.centerY;

    // horizontal alignment
    densityAText.x = densityBText.x = Math.max( labelAText.width, labelBText.width ) + 5;

    const densityContainer = new Node( {
      children: [
        labelAText, labelBText,
        densityAText, densityBText,
        new HStrut( displayOptionsNode.width - 10 ) // Same internal size as displayOptionsNode
      ]
    } );

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

    this.addChild( new Panel( new DensityControlNode( model.liquidMaterialProperty, [
      Material.AIR,
      Material.GASOLINE,
      Material.WATER,
      Material.SEAWATER,
      Material.HONEY,
      Material.MERCURY,
      Material.DENSITY_X,
      Material.DENSITY_Y
    ], this.popupLayer ), merge( {
      right: this.layoutBounds.centerX - MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) ) );

    this.addChild( new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer ), merge( {
      left: this.layoutBounds.centerX + MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) ) );

    // @private {Node}
    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      model.secondaryMassVisibleProperty,
      this.popupLayer
    );

    this.addChild( new AlignBox( this.rightBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      xMargin: 10,
      yMargin: 10
    } ) );

    this.addSecondMassControl();

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyExploreScreenView', BuoyancyExploreScreenView );
export default BuoyancyExploreScreenView;