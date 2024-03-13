// Copyright 2023-2024, University of Colorado Boulder

/**
 * DensityBuoyancyCommonPreferencesNode is the user interface for sim-specific preferences, accessed via the Preferences dialog.
 * These preferences are global, and affect all screens.
 *
 * The Preferences dialog is created on demand by joist, using a PhetioCapsule. So DensityBuoyancyCommonPreferencesNode and its
 * subcomponents must implement dispose.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { RichText, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonPreferences from '../model/DensityBuoyancyCommonPreferences.js';
import VolumeUnitsControl from './VolumeUnitsControl.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import ToggleSwitch from '../../../../sun/js/ToggleSwitch.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';

type SelfOptions = EmptySelfOptions;

export type DensityBuoyancyCommonPreferencesNodeOptions = SelfOptions & PickRequired<VBoxOptions, 'tandem'>;

export default class DensityBuoyancyCommonPreferencesNode extends VBox {

  public constructor( providedOptions: DensityBuoyancyCommonPreferencesNodeOptions ) {

    const options = optionize<DensityBuoyancyCommonPreferencesNodeOptions, SelfOptions, VBoxOptions>()( {
      align: 'left',
      spacing: 20,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    const volumeUnitsControl = new VolumeUnitsControl( DensityBuoyancyCommonPreferences.volumeUnitsProperty, {
      tandem: options.tandem.createTandem( 'volumeUnitsControl' )
    } );

    const percentageSubmergedVisibleControl = new PercentageSubmergedVisibleControl( options.tandem.createTandem( 'percentageSubmergedVisibleControl' ) );

    options.children = [
      volumeUnitsControl,
      percentageSubmergedVisibleControl
    ];

    super( options );
  }
}

class PercentageSubmergedVisibleControl extends PreferencesControl {
  public constructor( tandem: Tandem ) {
    super( {
      isDisposable: false,
      labelNode: new Text( DensityBuoyancyCommonStrings.preferences.percentageSubmerged.titleStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
      descriptionNode: new RichText( DensityBuoyancyCommonStrings.preferences.percentageSubmerged.descriptionStringProperty,
        PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS ),
      controlNode: new ToggleSwitch( DensityBuoyancyCommonPreferences.percentageSubmergedVisibleProperty, false, true, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ),
      tandem: tandem
    } );
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyCommonPreferencesNode', DensityBuoyancyCommonPreferencesNode );