// Copyright 2024, University of Colorado Boulder

/**
 * A special case scale which tricks the model into not displacing any volume, so that the water level doesn't change.
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import PhysicsEngine from './PhysicsEngine.js';
import Gravity from './Gravity.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Scale, { SCALE_HEIGHT, SCALE_WIDTH, ScaleOptions } from './Scale.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { InstrumentedMassOptions } from './Mass.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';

// To prevent objects from being dragged beneath the scale, we extend the invisible part of the scale vertically downward.
const SCALE_INVISIBLE_VERTICAL_EXTENSION_FACTOR = 8.26;

export default class VolumelessScale extends Scale {

  public constructor( engine: PhysicsEngine, gravityProperty: TProperty<Gravity>, providedOptions: ScaleOptions ) {

    const vertices = [
      new Vector2( -SCALE_WIDTH / 2, -SCALE_HEIGHT / 2 * SCALE_INVISIBLE_VERTICAL_EXTENSION_FACTOR ),
      new Vector2( SCALE_WIDTH / 2, -SCALE_HEIGHT / 2 * SCALE_INVISIBLE_VERTICAL_EXTENSION_FACTOR ),
      new Vector2( SCALE_WIDTH / 2, SCALE_HEIGHT / 2 ),
      new Vector2( -SCALE_WIDTH / 2, SCALE_HEIGHT / 2 )
    ];
    const options = combineOptions<InstrumentedMassOptions>( {
      body: engine.createFromVertices( vertices, false, 'STATIC' ),
      shape: Shape.polygon( vertices )
    }, providedOptions );

    super( engine, gravityProperty, options );
  }

  /**
   * Assumes the displaced volume is 0 to avoid changing the water level on the Lab screen.
   */
  public override getDisplacedVolume( liquidLevel: number ): number {
    return 0;
  }
}

densityBuoyancyCommon.register( 'VolumelessScale', VolumelessScale );