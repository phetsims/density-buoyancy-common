// Copyright 2023-2024, University of Colorado Boulder

/**
 * DensityBuoyancyCommonKeyboardHelpNode is the keyboard help for all screens, with parameters that determine whether
 * slider or "change choice" (combo box) help should be shown.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import MoveDraggableItemsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/MoveDraggableItemsKeyboardHelpSection.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import ComboBoxKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/ComboBoxKeyboardHelpSection.js';

export default class DensityBuoyancyCommonKeyboardHelpNode extends TwoColumnKeyboardHelpContent {

  public constructor( showSliderHelp: boolean, showChangeChoiceHelp: boolean ) {

    const leftColumn = [
      new MoveDraggableItemsKeyboardHelpSection(),
      ...( showSliderHelp ? [ new SliderControlsKeyboardHelpSection() ] : [] )
    ];

    const rightColumn = [
      ...( showChangeChoiceHelp ? [ new ComboBoxKeyboardHelpSection( {} ) ] : [] ),
      new BasicActionsKeyboardHelpSection( { withCheckboxContent: true } )
    ];

    super( leftColumn, rightColumn );
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyCommonKeyboardHelpNode', DensityBuoyancyCommonKeyboardHelpNode );