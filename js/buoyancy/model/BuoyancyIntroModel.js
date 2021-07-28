// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModal from '../../common/model/DensityBuoyancyModal.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const Mode = Enumeration.byKeys( [
  'SAME_MASS',
  'SAME_VOLUME',
  'SAME_DENSITY'
] );

class BuoyancyIntroModel extends DensityBuoyancyModal( DensityBuoyancyModel, Mode, Mode.SAME_MASS ) {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const createMasses = ( model, mode ) => {
      switch( mode ) {
        case Mode.SAME_MASS:
          return [
            Cuboid.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 5 ),
            Cuboid.createWithMass( model.engine, Material.BRICK, Vector2.ZERO, 5 )
          ];
        case Mode.SAME_VOLUME:
          return [
            Cuboid.createWithVolume( model.engine, Material.WOOD, Vector2.ZERO, 0.005 ),
            Cuboid.createWithVolume( model.engine, Material.BRICK, Vector2.ZERO, 0.005 )
          ];
        case Mode.SAME_DENSITY:
          return [
            Cuboid.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 2 ),
            Cuboid.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 4 )
          ];
        default:
          throw new Error( `unknown mode: ${mode}` );
      }
    };

    const positionMasses = ( model, mode, masses ) => {
      switch( mode ) {
        case Mode.SAME_MASS:
          model.positionMassesLeft( [ masses[ 0 ] ] );
          model.positionMassesRight( [ masses[ 1 ] ] );
          break;
        case Mode.SAME_VOLUME:
          model.positionMassesLeft( [ masses[ 0 ] ] );
          model.positionMassesRight( [ masses[ 1 ] ] );
          break;
        case Mode.SAME_DENSITY:
          model.positionMassesLeft( [ masses[ 0 ] ] );
          model.positionMassesRight( [ masses[ 1 ] ] );
          break;
        default:
          throw new Error( `unknown mode: ${mode}` );
      }
    };

    super( tandem, createMasses, () => {}, positionMasses, tandem );

    // Left scale
    this.masses.push( new Scale( this.engine, {
      matrix: Matrix3.translation( -0.8, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.NEWTONS,
      canMove: false
    } ) );

    // Pool scale
    const poolScale = new Scale( this.engine, {
      matrix: Matrix3.translation( 0.25, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: Scale.DisplayType.NEWTONS,
      canMove: false
    } );
    this.masses.push( poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );
  }
}

// @public {Enumeration}
BuoyancyIntroModel.Mode = Mode;

densityBuoyancyCommon.register( 'BuoyancyIntroModel', BuoyancyIntroModel );
export default BuoyancyIntroModel;