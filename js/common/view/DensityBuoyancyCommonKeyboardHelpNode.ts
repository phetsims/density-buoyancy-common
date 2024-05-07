// Copyright 2023-2024, University of Colorado Boulder

/**
 * DensityBuoyancyCommonKeyboardHelpNode is the keyboard help for all screens. The majority of elements are relevant to all screens.
 * Elements that are not relevant to all screens may be omitted via providedOptions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import MoveDraggableItemsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/MoveDraggableItemsKeyboardHelpSection.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
// import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
// import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
// import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
// import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
// import NumberKeyNode from '../../../../scenery-phet/js/keyboard/NumberKeyNode.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import ComboBoxKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/ComboBoxKeyboardHelpSection.js';

// type SelfOptions = {
//
//   // Whether to include the keyboard shortcut labeled 'Select a field', which is not relevant in the 'Sampling' screen.
//   hasShowField1Through6Shortcut?: boolean;
// };

// type PDLKeyboardHelpNodeOptions = SelfOptions;

export default class DensityBuoyancyCommonKeyboardHelpNode extends TwoColumnKeyboardHelpContent {

  public constructor( showSliderHelp: boolean, showChangeChoiceHelp: boolean ) {

    // const showSliderHelp = true;
    // const showDraggableItemHelp = true;
    const additionalLeftColumnContent: KeyboardHelpSection[] = [];
    // providedOptions?: PDLKeyboardHelpNodeOptions

    // const options = optionize<PDLKeyboardHelpNodeOptions, SelfOptions, TwoColumnKeyboardHelpContentOptions>()( {
    //
    //   // SelfOptions
    //   hasShowField1Through6Shortcut: true
    // }, providedOptions );

    const leftColumn = [
      new MoveDraggableItemsKeyboardHelpSection(),
      ...( showSliderHelp ? [ new SliderControlsKeyboardHelpSection() ] : [] ),
      // new FromAnywhereInSimHelpSection( options.hasShowField1Through6Shortcut ),
      // ...( showDraggableItemHelp ? [ new MoveDraggableItemsKeyboardHelpSection() ] : [] ),
      ...additionalLeftColumnContent
    ];

    const rightColumn = [
      ...( showChangeChoiceHelp ? [ new ComboBoxKeyboardHelpSection( {
        // headingString: KeplersLawsStrings.keyboardHelpDialog.chooseATargetOribitStringProperty,
        // thingAsLowerCaseSingular: KeplersLawsStrings.keyboardHelpDialog.targetOrbitStringProperty,
        // thingAsLowerCasePlural: KeplersLawsStrings.keyboardHelpDialog.targetOrbitsStringProperty
      } ) ] : [] ),
      new BasicActionsKeyboardHelpSection( { withCheckboxContent: true } )
    ];

    super( leftColumn, rightColumn );
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyCommonKeyboardHelpNode', DensityBuoyancyCommonKeyboardHelpNode );