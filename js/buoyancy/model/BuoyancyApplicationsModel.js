// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main model for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Boat from './Boat.js';
import Bottle from './Bottle.js';

// constants
const Scene = Enumeration.byKeys( [
  'BOTTLE',
  'BOAT'
] );

class BuoyancyApplicationsModel extends DensityBuoyancyModel {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    const tandem = options.tandem;

    super( options );

    // @public {Property.<Scene>}
    this.sceneProperty = new EnumerationProperty( Scene, Scene.BOTTLE );

    // @public {Property.<boolean>}
    this.densityExpandedProperty = new BooleanProperty( false );

    // @public (read-only) {Bottle}
    this.bottle = new Bottle( this.engine, {
      matrix: Matrix3.translation( 0, 0 ),
      tandem: tandem.createTandem( 'bottle' )
    } );

    // @public (read-only) {Cuboid}
    this.block = Cuboid.createWithVolume( this.engine, Material.PYRITE, new Vector2( 0.5, 0.5 ), 0.001 );

    // @public (read-only) {Boat|null}
    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.boat = new Boat( this.engine, new DerivedProperty( [ this.block.sizeProperty ], size => size.depth ), this.liquidMaterialProperty, {
      matrix: Matrix3.translation( 0, -0.1 ),
      tandem: tandem.createTandem( 'boat' )
    } );

    // @public (read-only) {Scale}
    this.leftScale = new Scale( this.engine, {
      matrix: Matrix3.translation( -0.7, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.NEWTONS,
      canMove: false,
      tandem: tandem.createTandem( 'leftScale' )
    } );
    this.availableMasses.push( this.leftScale );

    // @public (read-only) {Scale}
    this.poolScale = new Scale( this.engine, {
      matrix: Matrix3.translation( 0.25, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: Scale.DisplayType.NEWTONS,
      canMove: false,
      tandem: tandem.createTandem( 'poolScale' )
    } );
    this.availableMasses.push( this.poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= this.poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.sceneProperty.link( scene => {
      this.setMassVisible( this.bottle, scene === Scene.BOTTLE );
      this.setMassVisible( this.boat, scene === Scene.BOAT );
      this.setMassVisible( this.block, scene === Scene.BOAT );
    } );
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.densityExpandedProperty.reset();

    this.sceneProperty.reset();

    this.bottle.reset();
    this.block.reset();
    this.boat.reset();

    super.reset();
  }
}

// @public (read-only) {Enumeration}
BuoyancyApplicationsModel.Scene = Scene;

densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );
export default BuoyancyApplicationsModel;