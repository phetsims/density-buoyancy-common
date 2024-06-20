// Copyright 2020-2024, University of Colorado Boulder

/**
 * The main pool of fluid, cut into the ground.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Basin from './Basin.js';
import Mass from './Mass.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Property from '../../../../axon/js/Property.js';
import Material from './Material.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import PoolScale from './PoolScale.js';
import PhysicsEngine from './PhysicsEngine.js';
import Gravity from './Gravity.js';

export default class Pool extends Basin {

  public readonly bounds: Bounds3;

  public readonly fluidMaterialProperty: Property<Material>;
  public readonly fluidDensityProperty: TReadOnlyProperty<number>;
  public readonly fluidViscosityProperty: TReadOnlyProperty<number>;

  // In Liters, how much volume does the Pool fluid + displaced Masses take up.
  public readonly fluidLevelVolumeProperty: TReadOnlyProperty<number>;

  // Scale for the pool and its heightProperty, if we are using it
  public readonly scale: PoolScale | null = null;

  public constructor( bounds: Bounds3, usePoolScale: boolean, engine: PhysicsEngine, gravityProperty: TReadOnlyProperty<Gravity>, tandem: Tandem ) {

    const initialVolume = DensityBuoyancyCommonConstants.DESIRED_STARTING_POOL_VOLUME;

    super( {
      initialVolume: initialVolume,
      initialY: bounds.minY + initialVolume / ( bounds.width * bounds.depth ),
      tandem: tandem
    } );

    this.bounds = bounds;

    const fluidTandem = tandem.createTandem( 'fluid' );

    // These won't change over the life of the pool.
    this.stepBottom = bounds.minY;
    this.stepTop = bounds.maxY;

    this.fluidMaterialProperty = new Property( Material.WATER, {
      valueType: Material,
      phetioValueType: Material.MaterialIO,
      tandem: fluidTandem.createTandem( 'materialProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The material of the fluid in the pool'
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.fluidDensityProperty = new DerivedProperty( [ this.fluidMaterialProperty ], fluidMaterial => fluidMaterial.density, {
      tandem: fluidTandem.createTandem( 'densityProperty' ),
      phetioFeatured: true,
      phetioValueType: NumberIO,
      units: 'kg/m^3'
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.fluidViscosityProperty = new DerivedProperty( [ this.fluidMaterialProperty ], fluidMaterial => fluidMaterial.viscosity );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.fluidLevelVolumeProperty = new DerivedProperty( [ this.fluidYInterpolatedProperty ],

      // Round to nearest 1E-6 to avoid floating point errors. Before we were rounding, the initial value
      // was showing as 99.999999999999 and the current value on startup was 100.0000000000001
      // Normally we would ignore a problem like this, but the former was appearing in the API.
      fluidY => Utils.roundToInterval( bounds.width *
                                       bounds.depth *
                                       ( fluidY - bounds.minY ) *
                                       DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER, DensityBuoyancyCommonConstants.TOLERANCE ), {
        units: 'L',
        tandem: tandem.createTandem( 'fluidLevelVolumeProperty' ),
        phetioValueType: NumberIO,
        phetioDocumentation: 'The volume of fluid in the pool plus the volume of fluid displaced by objects in the pool.'
      } );

    if ( usePoolScale ) {

      this.scale = new PoolScale( engine, gravityProperty, tandem.createTandem( 'scale' ) );

      // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
      this.fluidVolumeProperty.value -= this.scale.volumeProperty.value;
      this.fluidVolumeProperty.setInitialValue( this.fluidVolumeProperty.value );
    }
  }

  /**
   * Returns whether a given mass is inside this basin (e.g. if filled with fluid, would it be displacing any
   * fluid).
   */
  public isMassInside( mass: Mass ): boolean {

    const SLIP = 0.01; // 1 cm of potential overlap due to physics stiffness variables, see BoatBasin.isMassInside

    // Horizontal position does not need to be considered because the only way for a shape to have part below the top
    // of the empty pool is for it to be inside the pool.
    return mass.stepBottom < this.stepTop - SLIP;
  }

  /**
   * Returns the maximum area that could be contained with fluid at a given y value.
   */
  protected getMaximumArea( y: number ): number {
    if ( y < this.bounds.minY || y > this.bounds.maxY ) {
      return 0;
    }
    else {
      return this.bounds.width * this.bounds.depth;
    }
  }

  /**
   * Returns the maximum volume that could be contained with fluid up to a given y value.
   */
  protected getMaximumVolume( y: number ): number {
    if ( y <= this.bounds.minY ) {
      return 0;
    }
    else if ( y >= this.bounds.maxY ) {
      return this.bounds.volume;
    }
    else {
      return this.bounds.width * this.bounds.depth * ( y - this.bounds.minY );
    }
  }

  public override reset(): void {
    super.reset();
    this.fluidMaterialProperty.reset();
    this.scale && this.scale.reset();
  }
}

densityBuoyancyCommon.register( 'Pool', Pool );