// Copyright 2024, University of Colorado Boulder
/**
 * NumberProperty that notifies listeners when reset. Its used in the models of the Buoyancy Lab, Buoyaancy Basics Explore and Buoyancy Basics Compare screens.
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';

export default class PoolScaleHeightProperty extends NumberProperty {
  public constructor( value: number, providedOptions?: NumberPropertyOptions ) {
    super( value, providedOptions );
  }

  public override reset(): void {
    super.reset();

    // The model position of the pool is reset before, so even if this Property value doesn't change, we need to reposition via listeners
    this.notifyListenersStatic();
  }
}

densityBuoyancyCommon.register( 'PoolScaleHeightProperty', PoolScaleHeightProperty );