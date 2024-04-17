// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { AlignBox, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import FluidDensityControlNode from '../../common/view/FluidDensityControlNode.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyExploreModel from '../model/BuoyancyExploreModel.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import BuoyancyDisplayOptionsNode from '../../common/view/BuoyancyDisplayOptionsNode.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import BlocksRadioButtonGroup from '../../common/view/BlocksRadioButtonGroup.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyExploreScreenView extends DensityBuoyancyScreenView<BuoyancyExploreModel> {

  protected rightBox: PrimarySecondaryControlsNode;

  public constructor( model: BuoyancyExploreModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const buoyancyDisplayOptionsNode = new BuoyancyDisplayOptionsNode( model );

    this.addChild( new AlignBox( new Panel( buoyancyDisplayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS ), {
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

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      {
        tandem: tandem,
        minCustomMass: 0.1,
        supportHiddenMaterial: true,
        mysteryMaterials: [ Material.MATERIAL_X, Material.MATERIAL_Y ]
      }
    );

    const densityControlPanel = new Panel( new FluidDensityControlNode( model.liquidMaterialProperty, [
      ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS,
      ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS
    ], this.popupLayer, {
      invisibleMaterials: invisibleMaterials,
      tandem: tandem.createTandem( 'densityControlNode' )
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( densityControlPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    [ model.primaryMass, model.secondaryMass ].forEach( mass => {
      mass.materialProperty.link( material => {
        if ( material === Material.MATERIAL_X ) {
          mass.volumeProperty.value = 0.003;
        }
        else if ( material === Material.MATERIAL_Y ) {
          mass.volumeProperty.value = 0.001;
        }
      } );
    } );

    // Materials are set in densityBox.setMaterials() below
    const densityBox = new DensityAccordionBox( {
      expandedProperty: model.densityExpandedProperty,
      contentWidthMax: this.rightBox.content.width
    } );

    const submergedBox = new SubmergedAccordionBox( model.gravityProperty, model.liquidMaterialProperty, {
      contentWidthMax: this.rightBox.content.width
    } );

    const customExploreScreenFormatting = [ model.primaryMass, model.secondaryMass ].map( mass => {
      return {
        readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.blockPatternStringProperty, { tag: mass.nameProperty } ),
        readoutFormat: { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: mass.tag.colorProperty }
      };
    } );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.secondaryMass.visibleProperty.link( visible => {
      const masses = visible ? [ model.primaryMass, model.secondaryMass ] : [ model.primaryMass ];
      densityBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass.materialProperty,
          readoutNameProperty: customExploreScreenFormatting[ index ].readoutNameProperty,
          readoutFormat: customExploreScreenFormatting[ index ].readoutFormat
        };
      } ) );
      submergedBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass,
          readoutNameProperty: customExploreScreenFormatting[ index ].readoutNameProperty,
          readoutFormat: customExploreScreenFormatting[ index ].readoutFormat
        };
      } ) );
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

    const blocksRadioButtonGroup = new BlocksRadioButtonGroup( model.modeProperty, {
      tandem: this.tandem.createTandem( 'blocksRadioButtonGroup' )
    } );

    blocksRadioButtonGroup.left = rightSideVBox.left;
    blocksRadioButtonGroup.bottom = densityControlPanel.bottom;

    this.addChild( blocksRadioButtonGroup );

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

densityBuoyancyCommon.register( 'BuoyancyExploreScreenView', BuoyancyExploreScreenView );