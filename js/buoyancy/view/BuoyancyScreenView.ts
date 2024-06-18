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

export default abstract class BuoyancyScreenView<T extends DensityBuoyancyModel> extends DensityBuoyancyScreenView<T> {

  protected constructor( model: T,
                         supportsDepthLines: boolean,
                         forcesInitiallyDisplayed: boolean,
                         massValuesInitiallyDisplayed: boolean,
                         initialForceScale: number,
                         options: DensityBuoyancyScreenViewOptions ) {
    super( model, true, supportsDepthLines, forcesInitiallyDisplayed, massValuesInitiallyDisplayed, initialForceScale, options );
  }
}

densityBuoyancyCommon.register( 'BuoyancyScreenView', BuoyancyScreenView );