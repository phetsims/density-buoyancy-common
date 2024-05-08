// Copyright 2020-2024, University of Colorado Boulder

/**
 * Represents basin of the interior of the boat (that a liquid can reside in at a specific level).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Basin from '../../common/model/Basin.js';
import Mass from '../../common/model/Mass.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Boat from './Boat.js';
import BoatDesign from './BoatDesign.js';

export default class BoatBasin extends Basin {

  private readonly boat: Boat;

  // Used for intersection
  public readonly oneLiterShape: Shape;

  public constructor( boat: Boat ) {
    super( {
      initialVolume: 0,
      initialY: 0,
      tandem: Tandem.OPT_OUT
    } );

    this.boat = boat;
    this.oneLiterShape = Shape.polygon( BoatDesign.getBasinOneLiterVertices() );
  }

  /**
   * Returns whether a given mass is inside this basin (e.g. if filled with liquid, would it be displacing any
   * liquid).
   */
  public isMassInside( mass: Mass ): boolean {
    const slip = 0.01; // 1 cm of potential overlap due to physics stiffness variables.
    if ( mass === this.boat || mass.stepBottom >= this.stepTop || mass.stepTop <= this.stepBottom - slip ) {
      return false;
    }
    const stepMiddle = ( mass.stepTop + mass.stepBottom ) / 2;
    return this.oneLiterShapeContainsPoint( new Vector2( mass.stepX, mass.stepBottom ) ) || this.oneLiterShapeContainsPoint( new Vector2( mass.stepX, stepMiddle ) );
  }

  /**
   * Factored out way to take a point in absolute model coordinates, and determine if it is contained in the boat. This
   * accounts for "slip", which occurs when two objects overlap a bit due to physics stiffness modeling.
   */
  private oneLiterShapeContainsPoint( point: Vector2 ): boolean {
    const slip = 0.01; // 1 cm of potential overlap due to physics stiffness variables.

    const oneLiterPoint = point.minus( this.boat.matrix.translation ).timesScalar( 1 / this.boat.stepMultiplier );

    // Check both a point slightly below AND the actual point.
    const slippedPoint = oneLiterPoint.plusXY( 0, slip );
    return ( this.oneLiterShape.bounds.containsPoint( oneLiterPoint ) || this.oneLiterShape.bounds.containsPoint( slippedPoint ) ) &&
           ( this.oneLiterShape.containsPoint( oneLiterPoint ) || this.oneLiterShape.containsPoint( slippedPoint ) );
  }

  /**
   * Returns the maximum area that could be contained with liquid at a given y value.
   */
  public getMaximumArea( y: number ): number {
    return this.boat.getBasinArea( y );
  }

  /**
   * Returns the maximum volume that could be contained with liquid up to a given y value.
   */
  public getMaximumVolume( y: number ): number {
    return this.boat.getBasinVolume( y );
  }
}

densityBuoyancyCommon.register( 'BoatBasin', BoatBasin );