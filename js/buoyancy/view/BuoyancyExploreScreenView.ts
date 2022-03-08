// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignPropertyBox } from '../../../../scenery/js/imports.js';
import { GridBox } from '../../../../scenery/js/imports.js';
import { AlignBox } from '../../../../scenery/js/imports.js';
import { HBox } from '../../../../scenery/js/imports.js';
import { HStrut } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import { VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import DensityControlNode from '../../common/view/DensityControlNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import GravityControlNode from '../../common/view/GravityControlNode.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import BuoyancyExploreModel from '../model/BuoyancyExploreModel.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class BuoyancyExploreScreenView extends SecondaryMassScreenView<BuoyancyExploreModel> {

  protected rightBox: Node;

  constructor( model: BuoyancyExploreModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, merge( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const displayOptionsNode = new DisplayOptionsNode( model );

    const densityAText = new Text( '', {
      maxWidth: 120,
      font: new PhetFont( { size: 14, weight: 'bold' } ),
      fill: DensityBuoyancyCommonColors.labelAProperty,
      layoutOptions: { x: 1, y: 0 }
    } );
    const densityBText = new Text( '', {
      maxWidth: 120,
      font: new PhetFont( { size: 14, weight: 'bold' } ),
      fill: DensityBuoyancyCommonColors.labelBProperty,
      layoutOptions: { x: 1, y: 1 }
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.primaryMass.materialProperty.link( material => {
      densityAText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPerLiterPattern, {
        value: Utils.toFixed( material.density / 1000, 2 )
      } );
    } );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.secondaryMass.materialProperty.link( material => {
      densityBText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPerLiterPattern, {
        value: Utils.toFixed( material.density / 1000, 2 )
      } );
    } );

    const labelAText = new Text( densityBuoyancyCommonStrings.blockA, { font: new PhetFont( 14 ), maxWidth: 200, layoutOptions: { x: 0, y: 0 } } );
    const labelBText = new Text( densityBuoyancyCommonStrings.blockB, { font: new PhetFont( 14 ), maxWidth: 200, layoutOptions: { x: 0, y: 1 } } );

    const densityReadoutBox = new GridBox( {
      children: [ densityAText, densityBText, labelAText, labelBText ],
      xMargin: 5,
      yMargin: 3,
      xAlign: 'left',
      yAlign: 'center'
    } );

    const densityContainer = new Node( {
      children: [
        densityReadoutBox,
        new HStrut( displayOptionsNode.width - 10 ) // Same internal size as displayOptionsNode
      ]
    } );

    const densityBox = new AccordionBox( densityContainer, merge( {
      titleNode: new Text( densityBuoyancyCommonStrings.density, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 160
      } ),
      expandedProperty: model.densityExpandedProperty,
      resize: true
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignPropertyBox( new VBox( {
      spacing: 10,
      children: [
        // Keep the density box at the top of its possible location, even if it reduces in size due to the second mass
        // not being visible.
        new AlignBox( densityBox, {
          alignBounds: densityBox.bounds.copy(),
          localBounds: densityBox.bounds.copy(),
          yAlign: 'top'
        } ),
        new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ]
    } ), this.visibleBoundsProperty, {
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.secondaryMass.visibleProperty.link( visible => {
      labelBText.visible = visible;
      densityBText.visible = visible;
    } );

    const bottomNode = new HBox( {
      spacing: 2 * MARGIN,
      children: [
        new Panel( new DensityControlNode( model.liquidMaterialProperty, [
          Material.GASOLINE,
          Material.WATER,
          Material.SEAWATER,
          Material.HONEY,
          Material.MERCURY,
          Material.DENSITY_X,
          Material.DENSITY_Y
        ], this.popupLayer ), DensityBuoyancyCommonConstants.PANEL_OPTIONS ),
        new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer ), DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ]
    } );

    this.addChild( new AlignPropertyBox( bottomNode, this.visibleBoundsProperty, {
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      {
        tandem: tandem,
        minCustomMass: 0.1,
        maxCustomMass: 27
      }
    );

    this.addChild( new AlignPropertyBox( this.rightBox, this.visibleBoundsProperty, {
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    } );

    this.addSecondMassControl( model.modeProperty );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyExploreScreenView', BuoyancyExploreScreenView );
export default BuoyancyExploreScreenView;