// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Buoyancy simulation.
 *
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
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import LiquidDensityControlNode from '../../common/view/LiquidDensityControlNode.js';
import GravityControlNode from '../../common/view/GravityControlNode.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyExploreModel from '../model/BuoyancyExploreModel.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import DensityReadoutListNode from './DensityReadoutListNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyExploreScreenView extends SecondaryMassScreenView<BuoyancyExploreModel> {

  protected rightBox: Node;

  public constructor( model: BuoyancyExploreModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const customExploreScreenFormatting = {
      customNames: [ DensityBuoyancyCommonStrings.blockAStringProperty, DensityBuoyancyCommonStrings.blockBStringProperty ],
      customFormats: [
        { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: DensityBuoyancyCommonColors.labelPrimaryProperty },
        { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: DensityBuoyancyCommonColors.labelSecondaryProperty }
      ]
    };

    const displayOptionsNode = new DisplayOptionsNode( model );

    const densityReadout = new DensityReadoutListNode(
      [ model.primaryMass.materialProperty, model.secondaryMass.materialProperty ],
      displayOptionsNode.width - 10,
      customExploreScreenFormatting );

    const densityBox = new AccordionBox( densityReadout, combineOptions<AccordionBoxOptions>( {
      titleNode: new Text( DensityBuoyancyCommonStrings.densityStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 160
      } ),
      expandedProperty: model.densityExpandedProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( new VBox( {
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
    } ), {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.secondaryMass.visibleProperty.link( visible => {
      const materials = visible ? [ model.primaryMass.materialProperty, model.secondaryMass.materialProperty ] : [ model.primaryMass.materialProperty ];
      densityReadout.setMaterials( materials, customExploreScreenFormatting );
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

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      {
        tandem: tandem,
        minCustomMass: 0.1,
        supportHiddenMaterial: true
      }
    );

    // TODO: Should this be unlinked? https://github.com/phetsims/density-buoyancy-common/issues/95
    [ model.primaryMass, model.secondaryMass ].forEach( mass => {
      mass.materialProperty.link( material => {
        if ( material === Material.MYSTERY_X ) {
          mass.volumeProperty.value = 0.003;
        }
        else if ( material === Material.MYSTERY_Y ) {
          mass.volumeProperty.value = 0.001;
        }
      } );
    } );

    this.addChild( new AlignBox( this.rightBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    }, {
      strictAxonDependencies: false // This workaround is deemed acceptable for visibleBoundsProperty listening, https://github.com/phetsims/faradays-electromagnetic-lab/issues/65
    } );

    this.addSecondMassControl( model.modeProperty );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyExploreScreenView', BuoyancyExploreScreenView );
