// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import merge from '../../../../phet-core/js/merge.js';
import BlockSetModel from '../../common/model/BlockSetModel.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const BlockSet = Enumeration.byKeys( [
  'SAME_MASS',
  'SAME_VOLUME',
  'SAME_DENSITY'
] );

class DensityIntroModel extends BlockSetModel( DensityBuoyancyModel, BlockSet, BlockSet.SAME_MASS ) {
  /**
   * @mixes BlockSet
   * @param {Object} [options]
   */
  constructor( options ) {

    const tandem = options.tandem;

    const blockSetsTandem = tandem.createTandem( 'blockSets' );
    const sameMassTandem = blockSetsTandem.createTandem( 'sameMass' );
    const sameVolumeTandem = blockSetsTandem.createTandem( 'sameVolume' );
    const sameDensityTandem = blockSetsTandem.createTandem( 'sameDensity' );

    const massProperty = new NumberProperty( 5, {
      range: new Range( 1, 10 ),
      tandem: tandem.createTandem( 'massProperty' ),
      units: 'kg'
    } );

    const volumeProperty = new NumberProperty( 0.005, {
      range: new Range( 0.001, 0.01 ),
      tandem: tandem.createTandem( 'volumeProperty' ),
      units: 'm^3'
    } );

    const densityProperty = new NumberProperty( 500, {
      range: new Range( 100, 2000 ),
      tandem: tandem.createTandem( 'densityProperty' ),
      units: 'kg/m^3'
    } );

    const createMasses = ( model, blockSet ) => {
      let masses;
      switch( blockSet ) {
        case BlockSet.SAME_MASS:
          masses = [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 500,
              customColor: DensityBuoyancyCommonColors.comparingYellowColorProperty
            } ), Vector2.ZERO, 5, { tandem: sameMassTandem.createTandem( 'yellowBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1000,
              customColor: DensityBuoyancyCommonColors.comparingBlueColorProperty
            } ), Vector2.ZERO, 5, { tandem: sameMassTandem.createTandem( 'blueBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 2000,
              customColor: DensityBuoyancyCommonColors.comparingGreenColorProperty
            } ), Vector2.ZERO, 5, { tandem: sameMassTandem.createTandem( 'greenBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 4000,
              customColor: DensityBuoyancyCommonColors.comparingRedColorProperty
            } ), Vector2.ZERO, 5, { tandem: sameMassTandem.createTandem( 'redBlock' ) } )
          ];

          // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
          massProperty.lazyLink( massValue => {
            masses.forEach( mass => {
              mass.materialProperty.value = Material.createCustomMaterial( {
                density: massValue / mass.volumeProperty.value,
                customColor: mass.materialProperty.value.customColor
              } );
            } );
          } );
          break;
        case BlockSet.SAME_VOLUME:
          masses = [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1600,
              customColor: DensityBuoyancyCommonColors.comparingYellowColorProperty
            } ), Vector2.ZERO, 8, { tandem: sameVolumeTandem.createTandem( 'yellowBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 1200,
              customColor: DensityBuoyancyCommonColors.comparingBlueColorProperty
            } ), Vector2.ZERO, 6, { tandem: sameVolumeTandem.createTandem( 'blueBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 800,
              customColor: DensityBuoyancyCommonColors.comparingGreenColorProperty
            } ), Vector2.ZERO, 4, { tandem: sameVolumeTandem.createTandem( 'greenBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 400,
              customColor: DensityBuoyancyCommonColors.comparingRedColorProperty
            } ), Vector2.ZERO, 2, { tandem: sameVolumeTandem.createTandem( 'redBlock' ) } )
          ];

          // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
          volumeProperty.lazyLink( volume => {
            masses.forEach( mass => {
              const massValue = mass.massProperty.value;

              mass.updateSize( Cuboid.boundsFromVolume( volume ) );
              mass.materialProperty.value = Material.createCustomMaterial( {
                density: massValue / volume,
                customColor: mass.materialProperty.value.customColor
              } );
            } );
          } );
          break;
        case BlockSet.SAME_DENSITY:
          masses = [
            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 500,
              customColor: DensityBuoyancyCommonColors.comparingYellowColorProperty
            } ), Vector2.ZERO, 3, { tandem: sameDensityTandem.createTandem( 'yellowBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 500,
              customColor: DensityBuoyancyCommonColors.comparingBlueColorProperty
            } ), Vector2.ZERO, 2, { tandem: sameDensityTandem.createTandem( 'blueBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 500,
              customColor: DensityBuoyancyCommonColors.comparingGreenColorProperty
            } ), Vector2.ZERO, 1, { tandem: sameDensityTandem.createTandem( 'greenBlock' ) } ),

            Cuboid.createWithMass( model.engine, Material.createCustomMaterial( {
              density: 500,
              customColor: DensityBuoyancyCommonColors.comparingRedColorProperty
            } ), Vector2.ZERO, 0.5, { tandem: sameDensityTandem.createTandem( 'redBlock' ) } )
          ];

          // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
          densityProperty.lazyLink( density => {
            masses.forEach( mass => {
              mass.materialProperty.value = Material.createCustomMaterial( {
                density: density,
                customColor: mass.materialProperty.value.customColor
              } );
            } );
          } );
          break;
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }

      return masses;
    };

    const positionMasses = ( model, blockSet, masses ) => {
      switch( blockSet ) {
        case BlockSet.SAME_MASS:
          model.positionMassesLeft( [ masses[ 0 ], masses[ 1 ] ] );
          model.positionMassesRight( [ masses[ 2 ], masses[ 3 ] ] );
          break;
        case BlockSet.SAME_VOLUME:
          model.positionMassesLeft( [ masses[ 3 ], masses[ 0 ] ] );
          model.positionMassesRight( [ masses[ 1 ], masses[ 2 ] ] );
          break;
        case BlockSet.SAME_DENSITY:
          model.positionMassesLeft( [ masses[ 0 ], masses[ 1 ] ] );
          model.positionMassesRight( [ masses[ 2 ], masses[ 3 ] ] );
          break;
        default:
          throw new Error( `unknown blockSet: ${blockSet}` );
      }
    };

    super( tandem, createMasses, () => {}, positionMasses, merge( {
      showMassesDefault: true,
      canShowForces: false
    }, options ) );

    // @public {Property.<number>}
    this.massProperty = massProperty;
    this.volumeProperty = volumeProperty;
    this.densityProperty = densityProperty;

    this.uninterpolateMasses();
  }

  /**
   * Resets values to their original state
   * @public
   * @override
   */
  reset() {
    this.massProperty.reset();
    this.volumeProperty.reset();
    this.densityProperty.reset();

    super.reset();
  }
}

// @public (read-only) {Enumeration}
DensityIntroModel.BlockSet = BlockSet;

densityBuoyancyCommon.register( 'DensityIntroModel', DensityIntroModel );
export default DensityIntroModel;