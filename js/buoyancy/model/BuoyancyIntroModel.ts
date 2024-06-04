// Copyright 2022-2024, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BlockSetModel, { BlockSetModelOptions } from '../../common/model/BlockSetModel.js';
import Cube from '../../common/model/Cube.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassTag from '../../common/model/MassTag.js';
import BlockSet from '../../common/model/BlockSet.js';

export type BuoyancyIntroModelOptions = StrictOmit<BlockSetModelOptions<BlockSet>, 'initialMode' | 'BlockSet' | 'createMassesCallback' | 'regenerateMassesCallback' | 'positionMassesCallback'>;

export default class BuoyancyIntroModel extends BlockSetModel<BlockSet> {

  public constructor( providedOptions: BuoyancyIntroModelOptions ) {
    const tandem = providedOptions.tandem;

    const blockSetsTandem = tandem.createTandem( 'blockSets' );
    const sameMassTandem = blockSetsTandem.createTandem( 'sameMass' );
    const sameVolumeTandem = blockSetsTandem.createTandem( 'sameVolume' );
    const sameDensityTandem = blockSetsTandem.createTandem( 'sameDensity' );

    const options = optionize<BuoyancyIntroModelOptions, EmptySelfOptions, BlockSetModelOptions<BlockSet>>()( {
      initialMode: BlockSet.SAME_MASS,
      BlockSet: BlockSet.enumeration,

      supportsDepthLines: true,

      createMassesCallback: ( model, blockSet ) => {
        switch( blockSet ) {
          case BlockSet.SAME_MASS:
            return [
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 5, {
                tandem: sameMassTandem.createTandem( 'blockA' ),
                tag: MassTag.ONE_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY )
              } ),
              Cube.createWithMass( model.engine, Material.BRICK, Vector2.ZERO, 5, {
                tandem: sameMassTandem.createTandem( 'blockB' ),
                tag: MassTag.ONE_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY )
              } )
            ];
          case BlockSet.SAME_VOLUME:
            return [
              Cube.createWithVolume( model.engine, Material.WOOD, Vector2.ZERO, 0.005, {
                tandem: sameVolumeTandem.createTandem( 'blockA' ),
                tag: MassTag.TWO_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY )
              } ),
              Cube.createWithVolume( model.engine, Material.BRICK, Vector2.ZERO, 0.005, {
                tandem: sameVolumeTandem.createTandem( 'blockB' ),
                tag: MassTag.TWO_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY )
              } )
            ];
          case BlockSet.SAME_DENSITY:
            return [
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 2, {
                tandem: sameDensityTandem.createTandem( 'blockA' ),
                tag: MassTag.THREE_A.withColorProperty( MassTag.PRIMARY_COLOR_PROPERTY )
              } ),
              Cube.createWithMass( model.engine, Material.WOOD, Vector2.ZERO, 4, {
                tandem: sameDensityTandem.createTandem( 'blockB' ),
                tag: MassTag.THREE_B.withColorProperty( MassTag.SECONDARY_COLOR_PROPERTY )
              } )
            ];
          default:
            throw new Error( `unknown blockSet: ${blockSet}` );
        }
      },

      regenerateMassesCallback: _.noop, // Cannot be regenerated on this screen

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
      matrix: Matrix3.translation( -0.77, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: providedOptions.tandem.createTandem( 'scale1' ),
      canMove: true,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } ) );
  }
}

densityBuoyancyCommon.register( 'BuoyancyIntroModel', BuoyancyIntroModel );