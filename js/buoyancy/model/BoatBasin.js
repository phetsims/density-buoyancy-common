// Copyright 2020, University of Colorado Boulder

/**
 * Represents basin of the interior of the boat (that a liquid can reside in at a specific level).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import Basin from '../../common/model/Basin.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Boat from './Boat.js';

class BoatBasin extends Basin {
  /**
   * @param {Boat} boat
   */
  constructor( boat ) {
    super( {
      initialVolume: 0,
      initialY: 0
    } );

    // @private {Boat}
    this.boat = boat;

    // @private {Shape} - Used for intersection
    this.oneLiterShape = Shape.polygon( Boat.getBasinOneLiterVertices() );
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
    if ( mass === this.boat || mass.stepBottom >= this.stepTop || mass.stepTop <= this.stepBottom - 1e-5 ) {
      return false;
    }
    const oneLiterBottomPoint = new Vector2( mass.stepX, mass.stepBottom ).minus( this.boat.matrix.translation ).timesScalar( 1 / this.stepMultiplier );

    if ( this.oneLiterShape.bounds.containsPoint( oneLiterBottomPoint ) && this.oneLiterShape.containsPoint( oneLiterBottomPoint ) ) {
      return true;
    }
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