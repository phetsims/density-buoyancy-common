// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import BlockSetModel from '../../common/model/BlockSetModel.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const BlockSet = Enumeration.byKeys( [
  'SAME_MASS',
  'SAME_VOLUME',
  'SAME_DENSITY'
] );

class BuoyancyIntroModel extends BlockSetModel( DensityBuoyancyModel, BlockSet, BlockSet.SAME_MASS ) {
  /**
   * @mixes BlockSet
   * @param {Object} [options]
   */
  constructor( options ) {
    const tandem = options.tandem;

    const createMasses = ( model, blockSet ) => {
      switch( blockSet ) {
        case BlockSet.SAME_MASS:
          return [
            Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 5, { tandem: tandem.createTandem( 'sameMassWood' ) } ),
            Cube.createWithMass( model.engine, Material.BRICK, Vector2.ZERO, 5, { tandem: tandem.createTandem( 'sameMassBrick' ) } )
          ];
        case BlockSet.SAME_VOLUME:
          return [
            Cube.createWithVolume( model.engine, Material.WOOD, Vector2.ZERO, 0.005, { tandem: tandem.createTandem( 'sameVolumeWood' ) } ),
            Cube.createWithVolume( model.engine, Material.BRICK, Vector2.ZERO, 0.005, { tandem: tandem.createTandem( 'sameVolumeBrick' ) } )
          ];
        case BlockSet.SAME_DENSITY:
          return [
            Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 2, { tandem: tandem.createTandem( 'sameDensitySmall' ) } ),
            Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 4, { tandem: tandem.createTandem( 'sameDensityLarge' ) } )
          ];
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    const positionMasses = ( model, blockSet, masses ) => {
      switch( blockSet ) {
        case BlockSet.SAME_MASS:
          model.positionMassesLeft( [ masses[ 0 ] ] );
          model.positionMassesRight( [ masses[ 1 ] ] );
          break;
        case BlockSet.SAME_VOLUME:
          model.positionMassesLeft( [ masses[ 0 ] ] );
          model.positionMassesRight( [ masses[ 1 ] ] );
          break;
        case BlockSet.SAME_DENSITY:
          model.positionMassesLeft( [ masses[ 0 ] ] );
          model.positionMassesRight( [ masses[ 1 ] ] );
          break;
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    super( tandem, createMasses, () => {}, positionMasses, options );

    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.8, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.NEWTONS,
      canMove: false,
      tandem: tandem.createTandem( 'leftScale' )
    } ) );

    // Pool scale
    const poolScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( 0.25, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: Scale.DisplayType.NEWTONS,
      canMove: false,
      tandem: tandem.createTandem( 'poolScale' )
    } );
    this.availableMasses.push( poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );
  }
}

// @public (read-only) {Enumeration}
BuoyancyIntroModel.BlockSet = BlockSet;

densityBuoyancyCommon.register( 'BuoyancyIntroModel', BuoyancyIntroModel );
export default BuoyancyIntroModel;