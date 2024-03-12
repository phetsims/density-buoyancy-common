// Copyright 2023, University of Colorado Boulder

/**
 * Model for Density/Buoyancy preferences, accessed via the Preferences dialog. They are global, and affect all screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import DensityBuoyancyCommonQueryParameters, { VolumeUnits, VolumeUnitsValues } from '../DensityBuoyancyCommonQueryParameters.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

const DensityBuoyancyCommonPreferences = {
  volumeUnitsProperty: new StringUnionProperty<VolumeUnits>( DensityBuoyancyCommonQueryParameters.volumeUnits as VolumeUnits, {
    validValues: VolumeUnitsValues,
    tandem: Tandem.PREFERENCES.createTandem( 'volumeUnitsProperty' ),
    phetioFeatured: true
  } ),
  percentageSubmergedVisibleProperty: new BooleanProperty( DensityBuoyancyCommonQueryParameters.percentageSubmergedVisible, {
    tandem: Tandem.PREFERENCES.createTandem( 'percentageSubmergedProperty' ),
    phetioFeatured: true
  } )
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonPreferences', DensityBuoyancyCommonPreferences );
export default DensityBuoyancyCommonPreferences;