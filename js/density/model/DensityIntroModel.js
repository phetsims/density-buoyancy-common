// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyModel = require( 'DENSITY_BUOYANCY_COMMON/common/model/DensityBuoyancyModel' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Vector2 = require( 'DOT/Vector2' );

  class DensityIntroModel extends DensityBuoyancyModel {
    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      super( tandem );

      // @public {Property.<boolean>}
      this.secondaryMassVisibleProperty = new BooleanProperty( false );

      // @public {Mass}
      this.primaryMass = Cuboid.createWithVolume( this.engine, Material.WOOD, new Vector2( 0.15, -0.2 ), 0.005, {
        tag: Mass.MassTag.PRIMARY
      } );
      this.secondaryMass = Cuboid.createWithVolume( this.engine, Material.BRICK, new Vector2( -0.15, -0.2 ), 0.005, {
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

  return densityBuoyancyCommon.register( 'DensityIntroModel', DensityIntroModel );
} );
