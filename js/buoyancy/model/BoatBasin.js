// Copyright 2020-2021, University of Colorado Boulder

/**
 * Represents basin of the interior of the boat (that a liquid can reside in at a specific level).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Basin from '../../common/model/Basin.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BoatDesign from './BoatDesign.js';

class BoatBasin extends Basin {
  /**
   * @param {Boat} boat
   */
  constructor( boat ) {
    super( {
      initialVolume: 0,
      initialY: 0,
      // TODO: tandem here
      tandem: Tandem.OPT_OUT
    } );

    // @private {Boat}
    this.boat = boat;

    // @private {Shape} - Used for intersection
    this.oneLiterShape = Shape.polygon( BoatDesign.getBasinOneLiterVertices() );
  }

  /**
   * Returns whether a given mass is inside this basin (e.g. if filled with liquid, would it be displacing any
   * liquid).
   * @public
   * @override
   *
   * @param {Mass} mass
   * @returns {boolean}
   */
  isMassInside( mass ) {
    const slip = 1e-2;
    if ( mass === this.boat || mass.stepBottom >= this.stepTop || mass.stepTop <= this.stepBottom - slip ) {
      return false;
    }
    const oneLiterBottomPoint = new Vector2( mass.stepX, mass.stepBottom ).minus( this.boat.matrix.translation ).timesScalar( 1 / this.boat.stepMultiplier );

    // Check both a point slightly below AND the actual point.
    const slippedPoint = oneLiterBottomPoint.plusXY( 0, slip );
    return ( this.oneLiterShape.bounds.containsPoint( oneLiterBottomPoint ) || this.oneLiterShape.bounds.containsPoint( slippedPoint ) ) &&
           ( this.oneLiterShape.containsPoint( oneLiterBottomPoint ) || this.oneLiterShape.containsPoint( slippedPoint ) );
  }

  /**
   * Returns the maximum area that could be contained with liquid at a given y value.
   * @public
   * @override
   *
   * @param {number} y
   * @returns {number}
   */
  getMaximumArea( y ) {
    return this.boat.getBasinArea( y );
  }

  /**
   * Returns the maximum volume that could be contained with liquid up to a given y value.
   * @public
   * @override
   *
   * @param {number} y
   * @returns {number}
   */
  getMaximumVolume( y ) {
    return this.boat.getBasinVolume( y );
  }
}

densityBuoyancyCommon.register( 'BoatBasin', BoatBasin );
export default BoatBasin;