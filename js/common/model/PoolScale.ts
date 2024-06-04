// Copyright 2024, University of Colorado Boulder

/**
 * A special case scale which height is controlled by a slider. It also extends the invisible part of the scale
 * vertically downward to prevent objects from being dragged beneath it.
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import PhysicsEngine from './PhysicsEngine.js';
import Gravity from './Gravity.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Scale, { DisplayType, SCALE_HEIGHT, SCALE_WIDTH } from './Scale.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// To prevent objects from being dragged beneath the scale, we extend the invisible part of the scale vertically downward.
const SCALE_INVISIBLE_VERTICAL_EXTENSION_FACTOR = 8.26;

export default class PoolScale extends Scale {

  public constructor( engine: PhysicsEngine, gravityProperty: TProperty<Gravity>, tandem: Tandem ) {

    const vertices = [
      new Vector2( -SCALE_WIDTH / 2, -SCALE_HEIGHT / 2 * SCALE_INVISIBLE_VERTICAL_EXTENSION_FACTOR ),
      new Vector2( SCALE_WIDTH / 2, -SCALE_HEIGHT / 2 * SCALE_INVISIBLE_VERTICAL_EXTENSION_FACTOR ),
      new Vector2( SCALE_WIDTH / 2, SCALE_HEIGHT / 2 ),
      new Vector2( -SCALE_WIDTH / 2, SCALE_HEIGHT / 2 )
    ];
    super( engine, gravityProperty, {
      body: engine.createFromVertices( vertices, false, 'STATIC' ),
      shape: Shape.polygon( vertices ),
      displayType: DisplayType.NEWTONS,
      canMove: false, // No input listeners, but the PoolScaleHeightControl can still move it
      inputEnabledPropertyOptions: {
        phetioReadOnly: true
      },
      tandem: tandem
    } );
  }
}

densityBuoyancyCommon.register( 'PoolScale', PoolScale );