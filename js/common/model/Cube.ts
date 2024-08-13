// Copyright 2021-2024, University of Colorado Boulder

/**
 * A cuboid with the same dimension in all directions (allows adjusting volume on the fly)
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid, { CuboidOptions } from './Cuboid.js';
import PhysicsEngine from './PhysicsEngine.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { MaterialSchema } from './Mass.js';

type SelfOptions = {

  // When true, volume will update upon a mass change. The default (false) will update the density on mass change.
  // This will also make the massProperty phetioReadOnly:false. Careful!
  adjustVolumeOnMassChanged?: boolean;
};

export type CubeOptions = SelfOptions & CuboidOptions;

export type StrictCubeOptions = StrictOmit<CubeOptions, 'matrix' | 'material'>;

export default class Cube extends Cuboid {
  public constructor( engine: PhysicsEngine, volume: number, providedOptions: CubeOptions ) {

    let options = optionize<CubeOptions, SelfOptions, CuboidOptions>()( {
      adjustVolumeOnMassChanged: false,

      volumePropertyOptions: {
        phetioReadOnly: false
      }
    }, providedOptions );

    if ( options.adjustVolumeOnMassChanged ) {
      //TODO AV https://github.com/phetsims/density-buoyancy-common/issues/333
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
  public static createWithVolume( engine: PhysicsEngine, material: MaterialSchema, position: Vector2, volume: number, options?: StrictCubeOptions ): Cube {
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
  public static createWithMass( engine: PhysicsEngine, material: MaterialSchema, position: Vector2, mass: number, options?: StrictCubeOptions ): Cube {
    let density: number;
    if ( material === 'CUSTOM' ) {
      assert && assert( options?.customMaterialOptions?.density, 'density needed to create with mass' );
      density = options!.customMaterialOptions!.density!;
    }
    else {
      density = material.density;
    }
    return Cube.createWithVolume( engine, material, position, mass / density, options );
  }
}

densityBuoyancyCommon.register( 'Cube', Cube );