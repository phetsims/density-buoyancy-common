// Copyright 2021-2024, University of Colorado Boulder

/**
 * A cuboid with the same dimension in all directions (allows adjusting volume on the fly)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid, { CuboidOptions } from './Cuboid.js';
import PhysicsEngine from './PhysicsEngine.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import Material from './Material.js';
import Vector2 from '../../../../dot/js/Vector2.js';

type SelfOptions = {

  // When true, volume will update upon a mass change. The default (false) will update the density on mass change.
  // This will also make the massProperty phetioReadOnly:false. Careful!
  adjustVolumeOnMassChanged?: boolean;
};

export type CubeOptions = SelfOptions & CuboidOptions;

export default class Cube extends Cuboid {
  public constructor( engine: PhysicsEngine, volume: number, providedOptions: CubeOptions ) {

    let options = optionize<CubeOptions, SelfOptions, CuboidOptions>()( {
      adjustVolumeOnMassChanged: false,

      volumePropertyOptions: {
        phetioReadOnly: false
      }
    }, providedOptions );

    if ( options.adjustVolumeOnMassChanged ) {
      options = combineOptions<typeof options>( {
        massPropertyOptions: {
          phetioReadOnly: false
        }
      }, options );
    }

    super( engine, Cube.boundsFromVolume( volume ), options );

    // Hook volumeProperty to adjust the size
    this.volumeProperty.lazyLink( volume => {
      this.updateSize( Cube.boundsFromVolume( volume ) );
    } );

    if ( options.adjustVolumeOnMassChanged ) {
      // Hook massProperty to adjust the size
      this.massProperty.lazyLink( mass => {
        this.updateSize( Cube.boundsFromVolume( mass / this.materialProperty.value.density ) );
      } );
    }
  }

  /**
   * Returns the Bounds3 for a Cube that would be used for a specific volume (cubical).
   */
  public static boundsFromVolume( volume: number ): Bounds3 {
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
  public static createWithVolume( engine: PhysicsEngine, material: Material, position: Vector2, volume: number, options?: StrictOmit<CubeOptions, 'matrix' | 'material'> ): Cube {
    return new Cube( engine, volume, combineOptions<CubeOptions>( {
      matrix: Matrix3.translation( position.x, position.y ),
      minVolume: Cuboid.MIN_VOLUME,
      maxVolume: Cuboid.MAX_VOLUME,
      material: material
    }, options ) );
  }

  /**
   * Creates a Cube with a defined volume
   */
  public static createWithMass( engine: PhysicsEngine, material: Material, position: Vector2, mass: number, options?: StrictOmit<CubeOptions, 'matrix' | 'material'> ): Cube {
    return Cube.createWithVolume( engine, material, position, mass / material.density, options );
  }
}

densityBuoyancyCommon.register( 'Cube', Cube );