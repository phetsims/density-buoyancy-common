// Copyright 2020, University of Colorado Boulder

/**
 * Represents a basin that a liquid can reside in at a specific level.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import InterpolatedProperty from './InterpolatedProperty.js';

class Basin {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {
      initialVolume: 0,
      initialY: 0
    }, options );

    // @public {Property.<number>} - in m^3
    this.liquidVolumeProperty = new NumberProperty( options.initialVolume );

    // @public {Property.<number>} - The y coordinate of the liquid level (absolute in the model, NOT relative to
    // anything)
    this.liquidYInterpolatedProperty = new InterpolatedProperty( options.initialY, {
      interpolate: InterpolatedProperty.interpolateNumber
    } );

    // @public {number}
    this.stepBottom = 0;
    this.stepTop = 0;

    // @public {Array.<Mass>}
    this.stepMasses = [];

    // @public {Basin|null} - NOTE: only one guaranteed
    this.childBasin = null;
  }

  /**
   * Returns whether a given mass is inside this basin (e.g. if filled with liquid, would it be displacing any
   * liquid).
   * @public
   * @abstract
   *
   * @param {Mass} mass
   * @returns {boolean}
   */
  isMassInside( mass ) {
    throw new Error( 'abstract method' );
  }

  /**
   * Returns the maximum area that could be contained with liquid at a given y value.
   * @public
   * @abstract
   *
   * @param {number} y
   * @returns {number}
   */
  getMaximumArea( y ) {
    throw new Error( 'abstract method' );
  }

  /**
   * Returns the maximum volume that could be contained with liquid up to a given y value.
   * @public
   * @abstract
   *
   * @param {number} y
   * @returns {number}
   */
  getMaximumVolume( y ) {
    throw new Error( 'abstract method' );
  }

  /**
   * Returns the filled area in the basin (i.e. things that aren't air or water) at the given y value
   * @public
   *
   * @param {number} y
   */
  getDisplacedArea( y ) {
    let area = 0;
    this.stepMasses.forEach( mass => {
      area += mass.getDisplacedArea( y );
      assert && assert( !isNaN( area ) );
    } );

    // Don't double-count things, since we're counting the full displacement of the child basin's container
    if ( this.childBasin ) {
      area -= this.childBasin.getDisplacedArea( y );
    }

    return area;
  }

  /**
   * Returns the filled volume in the basin (i.e. things that aren't air or water) that is below the given y value.
   * @public
   *
   * @param {number} y
   */
  getDisplacedVolume( y ) {
    let volume = 0;
    this.stepMasses.forEach( mass => {
      volume += mass.getDisplacedVolume( y );
      assert && assert( !isNaN( volume ) );
    } );

    assert && assert( this !== this.childBasin );

    // Don't double-count things, since we're counting the full displacement of the child basin's container
    if ( this.childBasin ) {
      volume -= this.childBasin.getDisplacedVolume( Math.min( y, this.childBasin.stepTop ) );
    }

    return volume;
  }

  /**
   * Returns the empty area in the basin (i.e. air, that isn't a solid object) at the given y value.
   * @private
   *
   * @param {number} y
   */
  getEmptyArea( y ) {
    return this.getMaximumArea( y ) - this.getDisplacedArea( y );
  }

  /**
   * Returns the empty volume in the basin (i.e. air, that isn't a solid object) that is below the given y value.
   * @private
   *
   * @param {number} y
   */
  getEmptyVolume( y ) {
    return this.getMaximumVolume( y ) - this.getDisplacedVolume( y );
  }

  /**
   * Computes the liquid's y coordinate, given the current volume
   * @public
   */
  computeY() {
    const liquidVolume = this.liquidVolumeProperty.value;
    if ( liquidVolume === 0 ) {
      this.liquidYInterpolatedProperty.setNextValue( this.stepBottom );
      return;
    }

    const emptyVolume = this.getEmptyVolume( this.stepTop );
    if ( emptyVolume === liquidVolume ) {
      this.liquidYInterpolatedProperty.setNextValue( this.stepTop );
      return;
    }

    this.liquidYInterpolatedProperty.setNextValue( Basin.findRoot(
      this.stepBottom,
      this.stepTop,
      1e-7,
      yTest => this.getEmptyVolume( yTest ) - liquidVolume,
      yTest => this.getEmptyArea( yTest )
    ) );
  }

  /**
   * Resets to an initial state.
   * @public
   */
  reset() {
    this.liquidVolumeProperty.reset();
    this.liquidYInterpolatedProperty.reset();
  }

  /**
   * Hybrid root-finding given our constraints.
   * @private
   *
   * @param {number} minX
   * @param {number} maxX
   * @param {number} tolerance
   * @param {function} valueFunction
   * @param {function} derivativeFunction
   * @returns {number}
   */
  static findRoot( minX, maxX, tolerance, valueFunction, derivativeFunction ) {
    let x = ( minX + maxX ) / 2;

    let y;
    let dy;

    while ( Math.abs( y = valueFunction( x ) ) > tolerance ) {
      dy = derivativeFunction( x );

      if ( y < 0 ) {
        minX = x;
      }
      else {
        maxX = x;
      }

      // Newton's method first
      x -= y / dy;

      // Bounded to be bisection at the very least
      if ( x <= minX || x >= maxX ) {
        x = ( minX + maxX ) / 2;

        // Check to see if it's impossible to pass our tolerance
        if ( x === minX || x === maxX ) {
          break;
        }
      }
    }

    return x;
  }
}

densityBuoyancyCommon.register( 'Basin', Basin );
export default Basin;