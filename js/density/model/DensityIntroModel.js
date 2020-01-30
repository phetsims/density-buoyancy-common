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

      // @public {Property.<boolean>}
      this.densityReadoutExpandedProperty = new BooleanProperty( false );

      // TODO: better way of setting default also
      this.showMassesProperty.value = true;
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

      this.showMassesProperty.value = true;
    }
  }

  return densityBuoyancyCommon.register( 'DensityIntroModel', DensityIntroModel );
} );
