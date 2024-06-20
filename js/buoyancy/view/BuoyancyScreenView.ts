// Copyright 2024, University of Colorado Boulder

/**
 * Abstract type for Buoyancy ScreenView classes. This is mostly a marker/placeholder, but it does capture the default
 * canShowForces: true value which is common among the Buoyancy ScreenView classes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

type BuoyancyScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces'>;

export default abstract class BuoyancyScreenView<T extends DensityBuoyancyModel> extends DensityBuoyancyScreenView<T> {

  protected constructor( model: T,
                         providedOptions: BuoyancyScreenViewOptions ) {

    const options = optionize<BuoyancyScreenViewOptions, EmptySelfOptions, DensityBuoyancyScreenViewOptions>()( {
      canShowForces: true
    }, providedOptions );

    super( model, options );
  }
}

densityBuoyancyCommon.register( 'BuoyancyScreenView', BuoyancyScreenView );