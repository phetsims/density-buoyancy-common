// Copyright 2021-2022, University of Colorado Boulder

/**
 * A cuboid with the same dimension in all directions (allows adjusting volume on the fly)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import merge from '../../../../phet-core/js/merge.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid, { CuboidOptions } from './Cuboid.js';
import PhysicsEngine from './PhysicsEngine.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Material from './Material.js';
import Vector2 from '../../../../dot/js/Vector2.js';

type CubeSelfOptions = {
  adjustMassWithVolume?: boolean
};

type CubeOptions = CubeSelfOptions & CuboidOptions;

class Cube extends Cuboid {
  constructor( engine: PhysicsEngine, volume: number, providedConfig: CubeOptions ) {

    let config = optionize<CubeOptions, CubeSelfOptions, CuboidOptions>( {
      adjustMassWithVolume: false,

      volumePropertyOptions: {
        phetioReadOnly: false
      }
    }, providedConfig );

    if ( config.adjustMassWithVolume ) {
      config = merge( {
        massPropertyOptions: {
          phetioReadOnly: false
        }
      }, config );
    }

    super( engine, Cube.boundsFromVolume( volume ), config );

    // Hook volumeProperty to adjust the size
    this.volumeProperty.lazyLink( volume => {
      if ( !this.volumeLock ) {
        this.updateSize( Cube.boundsFromVolume( volume ) );
      }
    } );

    if ( config.adjustMassWithVolume ) {
      // Hook massProperty to adjust the size
      this.massProperty.lazyLink( mass => {
        if ( !this.massLock ) {
          this.updateSize( Cube.boundsFromVolume( mass / this.materialProperty.value.density ) );
        }
      } );
    }
  }

  /**
   * Returns the Bounds3 for a Cube that would be used for a specific volume (cubical).
   */
  static boundsFromVolume( volume: number ): Bounds3 {
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
   */
  static createWithVolume( engine: PhysicsEngine, material: Material, position: Vector2, volume: number, options: Omit<CubeOptions, 'matrix' | 'material'> ): Cube {
    return new Cube( engine, volume, merge( {
      matrix: Matrix3.translation( position.x, position.y ),
      material: material
    }, options ) );
  }

  /**
   * Creates a Cube with a defined volume
   */
  static createWithMass( engine: PhysicsEngine, material: Material, position: Vector2, mass: number, options: Omit<CubeOptions, 'matrix' | 'material'> ) {
    return Cube.createWithVolume( engine, material, position, mass / material.density, options );
  }
}

densityBuoyancyCommon.register( 'Cube', Cube );
export default Cube;
export type { CubeOptions };
