// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bottle = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Bottle' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyModel = require( 'DENSITY_BUOYANCY_COMMON/common/model/DensityBuoyancyModel' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );

  class BuoyancyApplicationsModel extends DensityBuoyancyModel {
    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      super( tandem );

      // @public {Bottle}
      this.bottle = new Bottle( this.engine, {
        matrix: Matrix3.translation( 0, 0 )
      } );

      this.masses.push( this.bottle );

      this.masses.push( new Scale( this.engine, {
        matrix: Matrix3.translation( -0.8, -Scale.SCALE_BASE_BOUNDS.minY ),
        displayType: Scale.DisplayType.NEWTONS
      } ) );
    }

    /**
     * Resets things to their original values.
     * @public
     * @override
     */
    reset() {
      super.reset();
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );
} );
