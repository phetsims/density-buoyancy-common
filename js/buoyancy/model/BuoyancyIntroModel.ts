// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BlockSetModel, { BlockSetModelOptions } from '../../common/model/BlockSetModel.js';
import Cube from '../../common/model/Cube.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class BlockSet extends EnumerationValue {
  static SAME_MASS = new BlockSet();
  static SAME_VOLUME = new BlockSet();
  static SAME_DENSITY = new BlockSet();

  static enumeration = new Enumeration( BlockSet, {
    phetioDocumentation: 'Block set'
  } );
}

type BuoyancyIntroModelOptions = BlockSetModelOptions<BlockSet>;

class BuoyancyIntroModel extends BlockSetModel<BlockSet> {
  constructor( providedOptions: BuoyancyIntroModelOptions ) {
    const options = optionize<BuoyancyIntroModelOptions, {}, BlockSetModelOptions<BlockSet>>( {
      initialMode: BlockSet.SAME_MASS,
      BlockSet: BlockSet.enumeration,

      createMassesCallback: ( model, blockSet ) => {
        switch( blockSet ) {
          case BlockSet.SAME_MASS:
            return [
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 5, { tandem: providedOptions.tandem.createTandem( 'sameMassWood' ) } ),
              Cube.createWithMass( model.engine, Material.BRICK, Vector2.ZERO, 5, { tandem: providedOptions.tandem.createTandem( 'sameMassBrick' ) } )
            ];
          case BlockSet.SAME_VOLUME:
            return [
              Cube.createWithVolume( model.engine, Material.WOOD, Vector2.ZERO, 0.005, { tandem: providedOptions.tandem.createTandem( 'sameVolumeWood' ) } ),
              Cube.createWithVolume( model.engine, Material.BRICK, Vector2.ZERO, 0.005, { tandem: providedOptions.tandem.createTandem( 'sameVolumeBrick' ) } )
            ];
          case BlockSet.SAME_DENSITY:
            return [
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 2, { tandem: providedOptions.tandem.createTandem( 'sameDensitySmall' ) } ),
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 4, { tandem: providedOptions.tandem.createTandem( 'sameDensityLarge' ) } )
            ];
          default:
            throw new Error( `unknown blockSet: ${blockSet}` );
        }
      },

      regenerateMassesCallback: ( model, blockSet, masses ) => {},

      positionMassesCallback: ( model, blockSet, masses ) => {
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
      }
    }, providedOptions );

    super( options );

    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.8, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      canMove: false,
      tandem: providedOptions.tandem.createTandem( 'leftScale' )
    } ) );

    // Pool scale
    const poolScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( 0.25, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: DisplayType.NEWTONS,
      canMove: false,
      tandem: providedOptions.tandem.createTandem( 'poolScale' )
    } );
    this.availableMasses.push( poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );
  }
}

densityBuoyancyCommon.register( 'BuoyancyIntroModel', BuoyancyIntroModel );
export default BuoyancyIntroModel;
export { BlockSet };
export type { BuoyancyIntroModelOptions };