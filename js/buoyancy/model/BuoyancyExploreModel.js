// Copyright 2019-2020, University of Colorado Boulder

/**
 * The main model for the Explore screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class BuoyancyExploreModel extends DensityBuoyancyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public {Property.<boolean>}
    this.secondaryMassVisibleProperty = new BooleanProperty( false );

    // @public {Mass}
    this.primaryMass = Cuboid.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: Mass.MassTag.PRIMARY
    } );
    this.secondaryMass = Cuboid.createWithMass( this.engine, Material.ALUMINUM, new Vector2( -0.2, 0.35 ), 13.5, {
      tag: Mass.MassTag.SECONDARY
    } );

    this.masses.push( this.primaryMass );

    this.secondaryMassVisibleProperty.lazyLink( secondaryMassVisible => {
      if ( secondaryMassVisible ) {
        this.masses.push( this.secondaryMass );
      }
      else {
        this.masses.remove( this.secondaryMass );
      }
    } );

    // Left scale
    this.masses.push( new Scale( this.engine, {
      matrix: Matrix3.translation( -0.65, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.NEWTONS
    } ) );

    // Pool scale
    const poolScale = new Scale( this.engine, {
      matrix: Matrix3.translation( 0.25, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: Scale.DisplayType.NEWTONS
    } );
    this.masses.push( poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );

    // @public {Property.<boolean>}
    this.densityReadoutExpandedProperty = new BooleanProperty( false );
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.secondaryMassVisibleProperty.reset();

    this.primaryMass.reset();
    this.secondaryMass.reset();

    this.densityReadoutExpandedProperty.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'BuoyancyExploreModel', BuoyancyExploreModel );
export default BuoyancyExploreModel;