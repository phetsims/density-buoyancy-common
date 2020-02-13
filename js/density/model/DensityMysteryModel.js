// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityBuoyancyModel = require( 'DENSITY_BUOYANCY_COMMON/common/model/DensityBuoyancyModel' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );
  const Vector2 = require( 'DOT/Vector2' );

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

  return densityBuoyancyCommon.register( 'DensityMysteryModel', DensityMysteryModel );
} );
