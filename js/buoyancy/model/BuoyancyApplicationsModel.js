// Copyright 2019-2020, University of Colorado Boulder

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
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public {Property.<Scene>}
    this.sceneProperty = new EnumerationProperty( Scene, Scene.BOTTLE );

    // @public {Property.<boolean>}
    this.densityReadoutExpandedProperty = new BooleanProperty( false );

    // @public {Bottle}
    this.bottle = new Bottle( this.engine, {
      matrix: Matrix3.translation( 0, 0 )
    } );


    // @public {Cuboid}
    this.block = Cuboid.createWithVolume( this.engine, Material.STEEL, new Vector2( 0.5, 0.5 ), 0.005 );

    // @public {Boat}
    this.boat = new Boat( this.engine, new DerivedProperty( [ this.block.sizeProperty ], size => size.depth ), this.liquidMaterialProperty, {
      matrix: Matrix3.translation( 0, -0.1 )
    } );

    // @public {Scale}
    this.leftScale = new Scale( this.engine, {
      matrix: Matrix3.translation( -0.7, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.NEWTONS
    } );
    this.masses.push( this.leftScale );

    // @public {Scale}
    this.poolScale = new Scale( this.engine, {
      matrix: Matrix3.translation( 0.25, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: Scale.DisplayType.NEWTONS
    } );
    this.masses.push( this.poolScale );

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
    this.densityReadoutExpandedProperty.reset();

    this.sceneProperty.reset();

    this.bottle.reset();
    this.block.reset();
    this.boat.reset();

    super.reset();
  }
}

// @public {Enumeration}
BuoyancyApplicationsModel.Scene = Scene;

densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );
export default BuoyancyApplicationsModel;