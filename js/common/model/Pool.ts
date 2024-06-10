// Copyright 2020-2024, University of Colorado Boulder

/**
 * The main pool of liquid, cut into the ground.
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

export default class Pool extends Basin {

  public readonly bounds: Bounds3;

  public readonly liquidMaterialProperty: Property<Material>;
  public readonly liquidDensityProperty: TReadOnlyProperty<number>;
  public readonly liquidViscosityProperty: TReadOnlyProperty<number>;

  public constructor( bounds: Bounds3, tandem: Tandem ) {

    const initialVolume = DensityBuoyancyCommonConstants.DESIRED_STARTING_POOL_VOLUME;

    super( {
      initialVolume: initialVolume,
      initialY: bounds.minY + initialVolume / ( bounds.width * bounds.depth ),
      tandem: tandem
    } );

    this.bounds = bounds;

    // These won't change over the life of the pool.
    this.stepBottom = bounds.minY;
    this.stepTop = bounds.maxY;

    this.liquidMaterialProperty = new Property( Material.WATER, {
      valueType: Material,
      phetioValueType: Material.MaterialIO,
      tandem: tandem.createTandem( 'liquidMaterialProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The material of the liquid in the pool'
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.liquidDensityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.density, {
      tandem: tandem.createTandem( 'liquidDensityProperty' ),
      phetioFeatured: true,
      phetioValueType: NumberIO,
      units: 'kg/m^3'
    } );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.liquidViscosityProperty = new DerivedProperty( [ this.liquidMaterialProperty ], liquidMaterial => liquidMaterial.viscosity, {
      tandem: tandem.createTandem( 'liquidViscosityProperty' ),
      phetioValueType: NumberIO,
      units: 'Pa\u00b7s'
    } );
  }

  /**
   * Returns whether a given mass is inside this basin (e.g. if filled with liquid, would it be displacing any
   * liquid).
   */
  public isMassInside( mass: Mass ): boolean {

    const SLIP = 0.01; // 1 cm of potential overlap due to physics stiffness variables, see BoatBasin.isMassInside

    // Horizontal position does not need to be considered because the only way for a shape to have part below the top
    // of the empty pool is for it to be inside the pool.
    return mass.stepBottom < this.stepTop - SLIP;
  }

  /**
   * Returns the maximum area that could be contained with liquid at a given y value.
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
   * Returns the maximum volume that could be contained with liquid up to a given y value.
   */
  protected getMaximumVolume( y: number ): number {
    if ( y <= this.bounds.minY ) {
      return 0;
    }
    else if ( y >= this.bounds.maxY ) {
      return this.bounds.width * this.bounds.depth * this.bounds.height;
    }
    else {
      return this.bounds.width * this.bounds.depth * ( y - this.bounds.minY );
    }
  }

  public override reset(): void {
    super.reset();
    this.liquidMaterialProperty.reset();

  }
}

densityBuoyancyCommon.register( 'Pool', Pool );