// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Boat = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Boat' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bottle = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Bottle' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyModel = require( 'DENSITY_BUOYANCY_COMMON/common/model/DensityBuoyancyModel' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );
  const Vector2 = require( 'DOT/Vector2' );

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
      this.boat = new Boat( this.engine, new DerivedProperty( [ this.block.sizeProperty ], size => size.depth ), {
        matrix: Matrix3.translation( 0, 0 )
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

  return densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );
} );
