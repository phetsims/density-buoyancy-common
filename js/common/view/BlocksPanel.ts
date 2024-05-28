// Copyright 2024, University of Colorado Boulder

/**
 * Panel that has a radio button group to choose between:
 *
 * - Same Mass
 * - Same Volume
 * - Same Density
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import BlockSet from '../model/BlockSet.js';
import { Text, VBox, Node } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Property from '../../../../axon/js/Property.js';

export default class BlocksPanel extends Panel {
  public constructor( blockSetProperty: Property<BlockSet>, tandem: Tandem ) {
    const blocksRadioButtonGroupTandem = tandem.createTandem( 'blocksRadioButtonGroup' );
    super( new VBox( {
      children: [
        new Text( DensityBuoyancyCommonStrings.blocksStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160,
          tandem: tandem.createTandem( 'titleText' )
        } ),
        new VerticalAquaRadioButtonGroup( blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
          return {
            createNode: tandem => new Text( blockSet.stringProperty, {
              font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
              maxWidth: 160,
              tandem: tandem.createTandem( 'labelText' )
            } ),
            value: blockSet,
            tandemName: `${blockSet.tandemName}RadioButton`,

            // pdom
            labelContent: blockSet.stringProperty
          };
        } ), {
          align: 'left',
          spacing: 8,
          tandem: blocksRadioButtonGroupTandem
        } )
      ],
      spacing: 10,
      align: 'left'
    } ), combineOptions<PanelOptions>( {
      tandem: tandem,
      phetioType: Node.NodeIO,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );

  }
}

densityBuoyancyCommon.register( 'BlocksPanel', BlocksPanel );