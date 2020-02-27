// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import DensityBuoyancyCommonColorProfile from '../../common/view/DensityBuoyancyCommonColorProfile.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class DensityMysteryModel extends DensityBuoyancyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public {Property.<boolean>}
    this.densityTableExpandedProperty = new BooleanProperty( false );

    const masses = [
      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 19320,
        customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
      } ), Vector2.ZERO, 65.3 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 640,
        customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
      } ), Vector2.ZERO, 0.64 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 700,
        customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
      } ), Vector2.ZERO, 4.08 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 920,
        customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
      } ), Vector2.ZERO, 3.10 ),

      Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
        density: 3530,
        customColor: DensityBuoyancyCommonColorProfile.comparingPurpleProperty
      } ), Vector2.ZERO, 3.53 ),

      new Scale( this.engine, {
        matrix: Matrix3.translation( -0.67, -Scale.SCALE_BASE_BOUNDS.minY ),
        displayType: Scale.DisplayType.KILOGRAMS
      } )
    ];

    this.positionStackLeft( [
      masses[ 1 ],
      masses[ 4 ]
    ] );

    this.positionStackRight( [
      masses[ 2 ],
      masses[ 3 ],
      masses[ 0 ]
    ] );

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
    this.densityTableExpandedProperty.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'DensityMysteryModel', DensityMysteryModel );
export default DensityMysteryModel;