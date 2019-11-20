// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds3 = require( 'DOT/Bounds3' );
  const Cone = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cone' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyModel = require( 'DENSITY_BUOYANCY_COMMON/common/model/DensityBuoyancyModel' );
  const Ellipsoid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Ellipsoid' );
  const HorizontalCylinder = require( 'DENSITY_BUOYANCY_COMMON/common/model/HorizontalCylinder' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );
  const VerticalCylinder = require( 'DENSITY_BUOYANCY_COMMON/common/model/VerticalCylinder' );

  class Demo3DModel extends DensityBuoyancyModel {
    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      super( tandem );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.06, -0.06, -0.06, 0.06, 0.06, 0.06 ), {
        matrix: Matrix3.translation( -0.15, -0.2 ),
        material: Material.BRICK
      } ) );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.05, -0.05, -0.05, 0.05, 0.05, 0.05 ), {
        matrix: Matrix3.translation( -0.5, 0.2 ),
        material: Material.STEEL
      } ) );

      this.masses.push( new Cuboid( this.engine, new Bounds3( -0.05, -0.05, -0.05, 0.05, 0.05, 0.05 ), {
        matrix: Matrix3.translation( 0, 0.05 ),
        material: Material.ICE
      } ) );

      this.masses.push( new Scale( this.engine, {
        matrix: Matrix3.translation( 0.5, 0.2 )
      } ) );

      this.masses.push( new Cone( this.engine, 0.05, 0.1, true, {
        matrix: Matrix3.translation( 0.3, 0.3 ),
        material: Material.WOOD
      } ) );

      this.masses.push( new Ellipsoid( this.engine, new Bounds3( -0.08, -0.05, -0.08, 0.08, 0.05, 0.08 ), {
        matrix: Matrix3.translation( -0.1, 0.4 ),
        material: Material.WOOD
      } ) );

      this.masses.push( new VerticalCylinder( this.engine, 0.05, 0.1, {
        matrix: Matrix3.translation( -0.1, 1.0 ),
        material: Material.WOOD
      } ) );

      this.masses.push( new HorizontalCylinder( this.engine, 0.05, 0.1, {
        matrix: Matrix3.translation( 0.2, 1.5 ),
        material: Material.WOOD
      } ) );

      this.masses.push( new Ellipsoid( this.engine, new Bounds3( -0.07, -0.07, -0.07, 0.07, 0.07, 0.07 ), {
        matrix: Matrix3.translation( 0.5, 0.6 ),
        material: Material.COPPER
      } ) );
    }
  }

  return densityBuoyancyCommon.register( 'Demo3DModel', Demo3DModel );
} );
