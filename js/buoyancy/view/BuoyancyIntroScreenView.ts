// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, HBox, ManualConstraint, Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import BuoyancyDisplayOptionsNode from '../../common/view/BuoyancyDisplayOptionsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyIntroModel, { BlockSet } from '../model/BuoyancyIntroModel.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';

// constants
const blockSetStringMap = {
  [ BlockSet.SAME_MASS.name ]: DensityBuoyancyCommonStrings.blockSet.sameMassStringProperty,
  [ BlockSet.SAME_VOLUME.name ]: DensityBuoyancyCommonStrings.blockSet.sameVolumeStringProperty,
  [ BlockSet.SAME_DENSITY.name ]: DensityBuoyancyCommonStrings.blockSet.sameDensityStringProperty
};
const blockSetTandemNameMap = {
  [ BlockSet.SAME_MASS.name ]: 'sameMassLabel',
  [ BlockSet.SAME_VOLUME.name ]: 'sameVolumeLabel',
  [ BlockSet.SAME_DENSITY.name ]: 'sameDensityLabel'
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

// Any others are invisible in the radio buttons, and are only available through PhET-iO if a client decides
// to show them, https://github.com/phetsims/buoyancy/issues/58
const VISIBLE_FLUIDS = [
  Material.GASOLINE,
  Material.WATER,
  Material.SEAWATER,
  Material.HONEY,
  Material.MERCURY
];

export default class BuoyancyIntroScreenView extends DensityBuoyancyScreenView<BuoyancyIntroModel> {

  public constructor( model: BuoyancyIntroModel, options: DensityBuoyancyScreenViewOptions ) {

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      // Custom just for this screen
      cameraLookAt: new Vector3( 0, -0.1, 0 )
    }, options ) );

    const blocksRadioButtonGroupTandem = options.tandem.createTandem( 'blocksRadioButtonGroup' );

    const blocksRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
      return {
        createNode: tandem => new Text( blockSetStringMap[ blockSet.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 160,
          tandem: tandem.createTandem( 'labelText' )
        } ),
        value: blockSet,
        tandemName: `${blockSetTandemNameMap[ blockSet.name ]}RadioButton`
      };
    } ), {
      align: 'left',
      tandem: blocksRadioButtonGroupTandem
    } );
    const blockSetPanel = new Panel( blocksRadioButtonGroup, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( blockSetPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const displayOptionsPanel = new Panel( new BuoyancyDisplayOptionsNode( model, { includeVectorScaleControl: false } ),
      DensityBuoyancyCommonConstants.PANEL_OPTIONS );
    this.addChild( new AlignBox( displayOptionsPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const radioButtonLabelOptions = {
      font: new PhetFont( 14 ),
      maxWidth: 120
    };
    const radioButtonGroupTandem = options.tandem.createTandem( 'liquidMaterialRadioButtonGroup' );

    model.liquidMaterialProperty instanceof ReadOnlyProperty && this.addLinkedElement( model.liquidMaterialProperty, {
      tandem: radioButtonGroupTandem.createTandem( 'property' )
    } );

    const fluidBox = new HBox( {
      spacing: 20,
      children: DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS.map( material => {
        return new AquaRadioButton( model.liquidMaterialProperty, material,
          new Text( material.nameProperty, radioButtonLabelOptions ), {
            tandem: radioButtonGroupTandem.createTandem( `${material.tandemName}RadioButton` ),
            visible: VISIBLE_FLUIDS.includes( material )
          } );
      } )
    } );
    const fluidTitle = new Text( DensityBuoyancyCommonStrings.fluidStringProperty, {
      font: DensityBuoyancyCommonConstants.TITLE_FONT,
      maxWidth: 160
    } );
    const fluidPanel = new Panel( new VBox( {
      children: [ fluidTitle, fluidBox ],
      spacing: 3,
      align: 'left'
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( fluidPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );


    // Materials are set in densityBox.setMaterials() below
    const densityBox = new DensityAccordionBox( {
      expandedProperty: model.densityExpandedProperty
    } );

    const submergedBox = new SubmergedAccordionBox( model.gravityProperty, model.liquidMaterialProperty );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.blockSetProperty.link( blockSet => {
      // TODO: recreate items each time with no cache? https://github.com/phetsims/buoyancy/issues/96
      const blocks = model.blockSetToMassesMap.get( blockSet )!;
      const readoutItems = blocks.map( mass => {
        return {
          readoutItem: mass,
          readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.blockPatternStringProperty, {
            tag: mass.nameProperty
          } ),
          readoutFormat: {
            font: DensityBuoyancyCommonConstants.ITEM_FONT,
            fill: mass.tag.colorProperty
          }
        };
      } );
      submergedBox.setReadoutItems( _.clone( readoutItems ) );

      // Same options, but different readoutItem
      const densityReadoutItems = readoutItems.map( x => _.assignIn( {}, x, { readoutItem: x.readoutItem.materialProperty } ) );
      densityBox.setReadoutItems( [
        ...densityReadoutItems,
        { readoutItem: model.liquidMaterialProperty }
      ] );
    } );

    const vBox = new VBox( {
      children: [ densityBox, submergedBox ],
      spacing: MARGIN
    } );
    this.addChild( vBox );

    ManualConstraint.create( this, [ vBox, this.resetAllButton ], ( vBoxProxy, resetAllButtonProxy ) => {
      vBoxProxy.right = resetAllButtonProxy.right;
      vBoxProxy.bottom = resetAllButtonProxy.top - MARGIN;
    } );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyIntroScreenView', BuoyancyIntroScreenView );
