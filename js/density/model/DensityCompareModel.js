// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BlockSetModel from '../../common/model/BlockSetModel.js';
import Cube from '../../common/model/Cube.js';
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

class DensityCompareModel extends BlockSetModel( DensityBuoyancyModel, BlockSet, BlockSet.SAME_MASS ) {
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
      units: 'kg',
      phetioStudioControl: false
    } );

    const volumeProperty = new NumberProperty( 0.005, {
      range: new Range( 0.001, 0.01 ),
      tandem: tandem.createTandem( 'volumeProperty' ),
      units: 'm^3',
      phetioStudioControl: false
    } );

    const densityProperty = new NumberProperty( 500, {
      range: new Range( 100, 2000 ),
      tandem: tandem.createTandem( 'densityProperty' ),
      units: 'kg/m^3',
      phetioStudioControl: false
    } );

    const createMaterialProperty = ( colorProperty, densityProperty ) => {
      return new DerivedProperty( [ colorProperty, densityProperty ], ( color, density ) => {
        const lightness = Material.getCustomLightness( density ); // 0-255

        const modifier = 0.1;
        const rawValue = ( lightness / 128 - 1 ) * ( 1 - modifier ) + modifier;
        const power = 0.7;
        const modifiedColor = color.colorUtilsBrightness( Math.sign( rawValue ) * Math.pow( Math.abs( rawValue ), power ) );

        return Material.createCustomMaterial( {
          density: density,
          customColor: new Property( modifiedColor, { tandem: Tandem.OPT_OUT } )
        } );
      }, {
        tandem: Tandem.OPT_OUT
      } );
    };

    const sameMassYellowDensityProperty = new NumberProperty( 500, { tandem: Tandem.OPT_OUT } );
    const sameMassBlueDensityProperty = new NumberProperty( 1000, { tandem: Tandem.OPT_OUT } );
    const sameMassGreenDensityProperty = new NumberProperty( 2000, { tandem: Tandem.OPT_OUT } );
    const sameMassRedDensityProperty = new NumberProperty( 4000, { tandem: Tandem.OPT_OUT } );

    const sameVolumeYellowDensityProperty = new NumberProperty( 1600, { tandem: Tandem.OPT_OUT } );
    const sameVolumeBlueDensityProperty = new NumberProperty( 1200, { tandem: Tandem.OPT_OUT } );
    const sameVolumeGreenDensityProperty = new NumberProperty( 800, { tandem: Tandem.OPT_OUT } );
    const sameVolumeRedDensityProperty = new NumberProperty( 400, { tandem: Tandem.OPT_OUT } );

    const sameDensityYellowDensityProperty = new NumberProperty( 500, { tandem: Tandem.OPT_OUT } );
    const sameDensityBlueDensityProperty = new NumberProperty( 500, { tandem: Tandem.OPT_OUT } );
    const sameDensityGreenDensityProperty = new NumberProperty( 500, { tandem: Tandem.OPT_OUT } );
    const sameDensityRedDensityProperty = new NumberProperty( 500, { tandem: Tandem.OPT_OUT } );

    const sameMassYellowMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareYellowColorProperty, sameMassYellowDensityProperty );
    const sameMassBlueMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareBlueColorProperty, sameMassBlueDensityProperty );
    const sameMassGreenMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareGreenColorProperty, sameMassGreenDensityProperty );
    const sameMassRedMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareRedColorProperty, sameMassRedDensityProperty );

    const sameVolumeYellowMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareYellowColorProperty, sameVolumeYellowDensityProperty );
    const sameVolumeBlueMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareBlueColorProperty, sameVolumeBlueDensityProperty );
    const sameVolumeGreenMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareGreenColorProperty, sameVolumeGreenDensityProperty );
    const sameVolumeRedMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareRedColorProperty, sameVolumeRedDensityProperty );

    const sameDensityYellowMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareYellowColorProperty, sameDensityYellowDensityProperty );
    const sameDensityBlueMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareBlueColorProperty, sameDensityBlueDensityProperty );
    const sameDensityGreenMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareGreenColorProperty, sameDensityGreenDensityProperty );
    const sameDensityRedMaterialProperty = createMaterialProperty( DensityBuoyancyCommonColors.compareRedColorProperty, sameDensityRedDensityProperty );

    const createMasses = ( model, blockSet ) => {
      let masses;
      switch( blockSet ) {
        case BlockSet.SAME_MASS:
          {
            const sameMassYellowMass = Cube.createWithMass( model.engine, sameMassYellowMaterialProperty.value, Vector2.ZERO, 5, { tandem: sameMassTandem.createTandem( 'yellowBlock' ) } );
            const sameMassBlueMass = Cube.createWithMass( model.engine, sameMassBlueMaterialProperty.value, Vector2.ZERO, 5, { tandem: sameMassTandem.createTandem( 'blueBlock' ) } );
            const sameMassGreenMass = Cube.createWithMass( model.engine, sameMassGreenMaterialProperty.value, Vector2.ZERO, 5, { tandem: sameMassTandem.createTandem( 'greenBlock' ) } );
            const sameMassRedMass = Cube.createWithMass( model.engine, sameMassRedMaterialProperty.value, Vector2.ZERO, 5, { tandem: sameMassTandem.createTandem( 'redBlock' ) } );

            sameMassYellowMaterialProperty.link( material => { sameMassYellowMass.materialProperty.value = material; } );
            sameMassBlueMaterialProperty.link( material => { sameMassBlueMass.materialProperty.value = material; } );
            sameMassGreenMaterialProperty.link( material => { sameMassGreenMass.materialProperty.value = material; } );
            sameMassRedMaterialProperty.link( material => { sameMassRedMass.materialProperty.value = material; } );

            masses = [ sameMassYellowMass, sameMassBlueMass, sameMassGreenMass, sameMassRedMass ];

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            massProperty.lazyLink( massValue => {
              sameMassYellowDensityProperty.value = massValue / sameMassYellowMass.volumeProperty.value;
              sameMassBlueDensityProperty.value = massValue / sameMassBlueMass.volumeProperty.value;
              sameMassGreenDensityProperty.value = massValue / sameMassGreenMass.volumeProperty.value;
              sameMassRedDensityProperty.value = massValue / sameMassRedMass.volumeProperty.value;
            } );
          }
          break;
        case BlockSet.SAME_VOLUME:
          {
            const sameVolumeYellowMass = Cube.createWithMass( model.engine, sameVolumeYellowMaterialProperty.value, Vector2.ZERO, 8, { tandem: sameVolumeTandem.createTandem( 'yellowBlock' ) } );
            const sameVolumeBlueMass = Cube.createWithMass( model.engine, sameVolumeBlueMaterialProperty.value, Vector2.ZERO, 6, { tandem: sameVolumeTandem.createTandem( 'blueBlock' ) } );
            const sameVolumeGreenMass = Cube.createWithMass( model.engine, sameVolumeGreenMaterialProperty.value, Vector2.ZERO, 4, { tandem: sameVolumeTandem.createTandem( 'greenBlock' ) } );
            const sameVolumeRedMass = Cube.createWithMass( model.engine, sameVolumeRedMaterialProperty.value, Vector2.ZERO, 2, { tandem: sameVolumeTandem.createTandem( 'redBlock' ) } );

            sameVolumeYellowMaterialProperty.link( material => { sameVolumeYellowMass.materialProperty.value = material; } );
            sameVolumeBlueMaterialProperty.link( material => { sameVolumeBlueMass.materialProperty.value = material; } );
            sameVolumeGreenMaterialProperty.link( material => { sameVolumeGreenMass.materialProperty.value = material; } );
            sameVolumeRedMaterialProperty.link( material => { sameVolumeRedMass.materialProperty.value = material; } );

            masses = [ sameVolumeYellowMass, sameVolumeBlueMass, sameVolumeGreenMass, sameVolumeRedMass ];

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            volumeProperty.lazyLink( volume => {
              const yellowMass = sameVolumeYellowMass.massProperty.value;
              const blueMass = sameVolumeBlueMass.massProperty.value;
              const greenMass = sameVolumeGreenMass.massProperty.value;
              const redMass = sameVolumeRedMass.massProperty.value;

              const size = Cube.boundsFromVolume( volume );
              sameVolumeYellowMass.updateSize( size );
              sameVolumeBlueMass.updateSize( size );
              sameVolumeGreenMass.updateSize( size );
              sameVolumeRedMass.updateSize( size );

              sameVolumeYellowDensityProperty.value = yellowMass / volume;
              sameVolumeBlueDensityProperty.value = blueMass / volume;
              sameVolumeGreenDensityProperty.value = greenMass / volume;
              sameVolumeRedDensityProperty.value = redMass / volume;
            } );
          }
          break;
        case BlockSet.SAME_DENSITY:
          {
            const sameDensityYellowMass = Cube.createWithMass( model.engine, sameDensityYellowMaterialProperty.value, Vector2.ZERO, 3, { tandem: sameDensityTandem.createTandem( 'yellowBlock' ) } );
            const sameDensityBlueMass = Cube.createWithMass( model.engine, sameDensityBlueMaterialProperty.value, Vector2.ZERO, 2, { tandem: sameDensityTandem.createTandem( 'blueBlock' ) } );
            const sameDensityGreenMass = Cube.createWithMass( model.engine, sameDensityGreenMaterialProperty.value, Vector2.ZERO, 1, { tandem: sameDensityTandem.createTandem( 'greenBlock' ) } );
            const sameDensityRedMass = Cube.createWithMass( model.engine, sameDensityRedMaterialProperty.value, Vector2.ZERO, 0.5, { tandem: sameDensityTandem.createTandem( 'redBlock' ) } );

            sameDensityYellowMaterialProperty.link( material => { sameDensityYellowMass.materialProperty.value = material; } );
            sameDensityBlueMaterialProperty.link( material => { sameDensityBlueMass.materialProperty.value = material; } );
            sameDensityGreenMaterialProperty.link( material => { sameDensityGreenMass.materialProperty.value = material; } );
            sameDensityRedMaterialProperty.link( material => { sameDensityRedMass.materialProperty.value = material; } );

            masses = [ sameDensityYellowMass, sameDensityBlueMass, sameDensityGreenMass, sameDensityRedMass ];

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            densityProperty.lazyLink( density => {
              sameDensityYellowDensityProperty.value = density;
              sameDensityBlueDensityProperty.value = density;
              sameDensityGreenDensityProperty.value = density;
              sameDensityRedDensityProperty.value = density;
            } );
          }
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
DensityCompareModel.BlockSet = BlockSet;

densityBuoyancyCommon.register( 'DensityCompareModel', DensityCompareModel );
export default DensityCompareModel;