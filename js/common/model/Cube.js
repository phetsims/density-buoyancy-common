// Copyright 2019-2021, University of Colorado Boulder

/**
 * A cuboid with the same dimension in all directions (allows adjusting volume on the fly)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid from './Cuboid.js';

class Cube extends Cuboid {
  /**
   * @param {PhysicsEngine} engine
   * @param {number} volume
   * @param {Object} config
   */
  constructor( engine, volume, config ) {

    config = merge( {
      volumePropertyOptions: {
        phetioReadOnly: false
      }
    }, config );

    super( engine, Cube.boundsFromVolume( volume ), config );

    this.volumeProperty.lazyLink( volume => {
      if ( !this.volumeLock ) {
        this.updateSize( Cube.boundsFromVolume( volume ) );
      }
    } );
  }

  /**
   * Returns the Bounds3 for a Cube that would be used for a specific volume (cubical).
   * @public
   *
   * @param {number} volume
   * @returns {Bounds3}
   */
  static boundsFromVolume( volume ) {
    const halfSideLength = Math.pow( volume, 1 / 3 ) / 2;
    return new Bounds3(
      -halfSideLength,
      -halfSideLength,
      -halfSideLength,
      halfSideLength,
      halfSideLength,
      halfSideLength
    );
  }

  /**
   * Creates a Cube with a defined volume
   * @public
   *
   * @param {PhysicsEngine} engine
   * @param {Material} material
   * @param {Vector2} position
   * @param {number} volume - m^3
   * @param {Object} [options]
   * @returns {Cube}
   */
  static createWithVolume( engine, material, position, volume, options ) {
    return new Cube( engine, volume, merge( {
      matrix: Matrix3.translation( position.x, position.y ),
      material: material
    }, options ) );
  }

  /**
   * Creates a Cube with a defined volume
   * @public
   *
   * @param {PhysicsEngine} engine
   * @param {Material} material
   * @param {Vector2} position
   * @param {number} mass - kg
   * @param {Object} [options]
   * @returns {Cube}
   */
  static createWithMass( engine, material, position, mass, options ) {
    return Cube.createWithVolume( engine, material, position, mass / material.density, options );
  }
}

densityBuoyancyCommon.register( 'Cube', Cube );
export default Cube;