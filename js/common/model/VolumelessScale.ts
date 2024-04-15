// Copyright 2019-2024, University of Colorado Boulder

/**
 * A special case scale which tricks the model into not displacing any volume, so that the water level doesn't change.
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import PhysicsEngine from './PhysicsEngine.js';
import Gravity from './Gravity.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Scale, { ScaleOptions } from './Scale.js';

export default class VolumelessScale extends Scale {

  public constructor( engine: PhysicsEngine, gravityProperty: TProperty<Gravity>, providedOptions: ScaleOptions ) {
    super( engine, gravityProperty, providedOptions );
  }

  /**
   * Assumes the displaced volume is 0 to avoid changing the water level on the Lab screen.
   */
  public override getDisplacedVolume( liquidLevel: number ): number {
    return 0;
  }
}

densityBuoyancyCommon.register( 'VolumelessScale', VolumelessScale );