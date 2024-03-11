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
import { AlignBox, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import LiquidDensityControlNode from '../../common/view/LiquidDensityControlNode.js';
import GravityControlNode from '../../common/view/GravityControlNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyLabModel from '../model/BuoyancyLabModel.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import DensityReadoutListNode from './DensityReadoutListNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import BlockControlNode from '../../common/view/BlockControlNode.js';
import MultiSectionPanelsNode from '../../common/view/MultiSectionPanelsNode.js';
import DisplayedFluidPanel from './DisplayedFluidPanel.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyLabScreenView extends DensityBuoyancyScreenView<BuoyancyLabModel> {

  private rightBox: Node;

  public constructor( model: BuoyancyLabModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const leftSideVBox = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new DisplayedFluidPanel( model.pool.liquidVolumeProperty, {
          visibleProperty: model.showDisplacedFluidProperty
        } ),
        new MultiSectionPanelsNode( [ new DisplayOptionsNode( model ) ] )
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
        new Panel( new LiquidDensityControlNode( model.liquidMaterialProperty, [
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
        supportHiddenMaterial: true
      }
    ) ] );

    model.primaryMass.materialProperty.link( material => {
      if ( material === Material.MYSTERY_X ) {
        model.primaryMass.volumeProperty.value = 0.003;
      }
      else if ( material === Material.MYSTERY_Y ) {
        model.primaryMass.volumeProperty.value = 0.001;
      }
    } );

    const densityReadout = new DensityReadoutListNode( [ model.primaryMass.materialProperty ], 1 );

    const densityBox = new AccordionBox( densityReadout, combineOptions<AccordionBoxOptions>( {
      titleNode: new Text( DensityBuoyancyCommonStrings.densityStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 160
      } ),
      expandedProperty: model.densityExpandedProperty
    }, combineOptions<AccordionBoxOptions>( { layoutOptions: { stretch: true } },
      DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS
    ) ) );
    const rightSideVBox = new VBox( {
      spacing: 10,
      align: 'right',
      children: [
        this.rightBox,
        densityBox
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
}

densityBuoyancyCommon.register( 'BuoyancyLabScreenView', BuoyancyLabScreenView );
