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
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityBuoyancyModel = require( 'DENSITY_BUOYANCY_COMMON/common/model/DensityBuoyancyModel' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Property = require( 'AXON/Property' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const Mode = new Enumeration( [
    'SAME_MASS',
    'SAME_VOLUME',
    'SAME_DENSITY',
    'MYSTERY'
  ] );

  class DensityComparingModel extends DensityBuoyancyModel {
    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      super( tandem );

      // @public {Property.<Mode>}
      this.modeProperty = new Property( Mode.SAME_MASS );

      // @public {Property.<boolean>}
      this.tableVisibleProperty = new BooleanProperty( false );

      this.modeProperty.link( mode => {
        this.setup();
        this.showMassesProperty.value = mode !== Mode.MYSTERY;
      } );
    }

    /**
     * Sets up the scene with the given mode.
     * @public
     */
    setup() {
      this.clearMasses();

      switch ( this.modeProperty.value ) {
        case Mode.SAME_MASS:
          this.setupSameMass();
          break;
        case Mode.SAME_VOLUME:
          this.setupSameVolume();
          break;
        case Mode.SAME_DENSITY:
          this.setupSameDensity();
          break;
        case Mode.MYSTERY:
          this.setupMystery();
          break;
        default:
          throw new Error( 'unknown mode: ' + this.modeProperty.value );
      }
    }

    /**
     * Sets up the initial state for the "Same Mass" mode.
     * @public
     */
    setupSameMass() {
      const masses = [
        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 500,
          customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
        } ), Vector2.ZERO, 5 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 1000,
          customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
        } ), Vector2.ZERO, 5 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 2000,
          customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
        } ), Vector2.ZERO, 5 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 4000,
          customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
        } ), Vector2.ZERO, 5 )
      ];

      this.positionMassesLeft( [
        masses[ 0 ],
        masses[ 1 ]
      ] );

      this.positionMassesRight( [
        masses[ 2 ],
        masses[ 3 ]
      ] );

      this.masses.addAll( masses );
    }

    /**
     * Sets up the initial state for the "Same Volume" mode.
     * @public
     */
    setupSameVolume() {
      const masses = [
        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 1600,
          customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
        } ), Vector2.ZERO, 8 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 1200,
          customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
        } ), Vector2.ZERO, 6 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 800,
          customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
        } ), Vector2.ZERO, 4 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 400,
          customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
        } ), Vector2.ZERO, 2 )
      ];

      this.positionMassesLeft( [
        masses[ 3 ],
        masses[ 0 ]
      ] );

      this.positionMassesRight( [
        masses[ 1 ],
        masses[ 2 ]
      ] );

      this.masses.addAll( masses );
    }

    /**
     * Sets up the initial state for the "Same Density" mode.
     * @public
     */
    setupSameDensity() {
      const masses = [
        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 800,
          customColor: DensityBuoyancyCommonColorProfile.comparingYellowProperty
        } ), Vector2.ZERO, 4 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 800,
          customColor: DensityBuoyancyCommonColorProfile.comparingBlueProperty
        } ), Vector2.ZERO, 3 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 800,
          customColor: DensityBuoyancyCommonColorProfile.comparingGreenProperty
        } ), Vector2.ZERO, 2 ),

        Cuboid.createWithMass( this.engine, Material.createCustomMaterial( {
          density: 800,
          customColor: DensityBuoyancyCommonColorProfile.comparingRedProperty
        } ), Vector2.ZERO, 1 )
      ];

      this.positionMassesLeft( [
        masses[ 0 ],
        masses[ 1 ]
      ] );

      this.positionMassesRight( [
        masses[ 2 ],
        masses[ 3 ]
      ] );

      this.masses.addAll( masses );
    }

    /**
     * Sets up the initial state for the "Mystery" mode.
     * @public
     */
    setupMystery() {
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
      this.modeProperty.reset();
      this.tableVisibleProperty.reset();

      super.reset();

      this.setup();
    }
  }

  // @public {Enumeration}
  DensityComparingModel.Mode = Mode;

  return densityBuoyancyCommon.register( 'DensityComparingModel', DensityComparingModel );
} );
