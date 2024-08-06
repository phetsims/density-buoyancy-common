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
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Property from '../../../../axon/js/Property.js';

export default class BlocksPanel extends Panel {
  public constructor( blockSetProperty: Property<BlockSet>, tandem: Tandem ) {
    const blockSetRadioButtonGroup = new VerticalAquaRadioButtonGroup( blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
      return {
        createNode: tandem => new Text( blockSet.stringProperty, {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 160,

          // TODO: This looks like a rare occasion where we instrumented a Text, but normally we don't instrument those. Can this be uninstrumented? See https://github.com/phetsims/density-buoyancy-common/issues/317
          tandem: tandem.createTandem( 'labelText' )
        } ),
        value: blockSet,
        tandemName: `${blockSet.tandemName}RadioButton`,

        // pdom
        labelContent: blockSet.stringProperty
      };
    } ), {
      align: 'left',
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      tandem: tandem.createTandem( 'blockSetRadioButtonGroup' ),
      phetioVisiblePropertyInstrumented: false
    } );
    super( new VBox( {
      align: 'left',
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      children: [
        new Text( DensityBuoyancyCommonStrings.blocksStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        blockSetRadioButtonGroup
      ]
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