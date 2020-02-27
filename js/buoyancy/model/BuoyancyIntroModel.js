// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import Cuboid from '../../common/model/Cuboid.js';
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

class BuoyancyIntroModel extends DensityBuoyancyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public {Property.<Mode>}
    this.modeProperty = new Property( Mode.SAME_MASS );

    this.modeProperty.link( mode => {
      this.setup();
    } );
  }

  /**
   * Sets up the scene with the given mode.
   * @public
   */
  setup() {
    this.clearMasses();

    switch( this.modeProperty.value ) {
      case Mode.SAME_MASS:
        this.setupSameMass();
        break;
      case Mode.SAME_VOLUME:
        this.setupSameVolume();
        break;
      case Mode.SAME_DENSITY:
        this.setupSameDensity();
        break;
      default:
        throw new Error( 'unknown mode: ' + this.modeProperty.value );
    }

    // Left scale
    this.masses.push( new Scale( this.engine, {
      matrix: Matrix3.translation( -0.8, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.NEWTONS
    } ) );

    // Pool scale
    this.masses.push( new Scale( this.engine, {
      matrix: Matrix3.translation( 0.25, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: Scale.DisplayType.NEWTONS
    } ) );
  }

  /**
   * Sets up the initial state for the "Same Mass" mode.
   * @public
   */
  setupSameMass() {
    const masses = [
      Cuboid.createWithMass( this.engine, Material.WOOD, Vector2.ZERO, 5 ),
      Cuboid.createWithMass( this.engine, Material.BRICK, Vector2.ZERO, 5 )
    ];

    this.positionMassesLeft( [ masses[ 0 ] ] );
    this.positionMassesRight( [ masses[ 1 ] ] );

    this.masses.addAll( masses );
  }

  /**
   * Sets up the initial state for the "Same Volume" mode.
   * @public
   */
  setupSameVolume() {
    const masses = [
      Cuboid.createWithVolume( this.engine, Material.WOOD, Vector2.ZERO, 0.005 ),
      Cuboid.createWithVolume( this.engine, Material.BRICK, Vector2.ZERO, 0.005 )
    ];

    this.positionMassesLeft( [ masses[ 0 ] ] );
    this.positionMassesRight( [ masses[ 1 ] ] );

    this.masses.addAll( masses );
  }

  /**
   * Sets up the initial state for the "Same Density" mode.
   * @public
   */
  setupSameDensity() {
    const masses = [
      Cuboid.createWithMass( this.engine, Material.WOOD, Vector2.ZERO, 2 ),
      Cuboid.createWithMass( this.engine, Material.WOOD, Vector2.ZERO, 4 )
    ];

    this.positionMassesLeft( [ masses[ 0 ] ] );
    this.positionMassesRight( [ masses[ 1 ] ] );

    this.masses.addAll( masses );
  }

  /**
   * Clears all of the masses away.
   * @private
   */
  clearMasses() {
    this.masses.forEach( mass => {
      this.masses.remove( mass );
      // TODO: memory management for the colors/etc.?
    } );
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.modeProperty.reset();

    super.reset();

    this.setup();
  }
}

// @public {Enumeration}
BuoyancyIntroModel.Mode = Mode;

densityBuoyancyCommon.register( 'BuoyancyIntroModel', BuoyancyIntroModel );
export default BuoyancyIntroModel;