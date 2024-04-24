// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Applications screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Boat from './Boat.js';
import Bottle from './Bottle.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Range from '../../../../dot/js/Range.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';

// constants
export class Scene extends EnumerationValue {
  public static readonly BOTTLE = new Scene();
  public static readonly BOAT = new Scene();

  public static readonly enumeration = new Enumeration( Scene, {
    phetioDocumentation: 'Bottle or boat scene'
  } );
}

export type BuoyancyApplicationsModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyApplicationsModel extends DensityBuoyancyModel {

  public readonly sceneProperty: Property<Scene>;
  public readonly densityExpandedProperty: Property<boolean>;

  public readonly bottle: Bottle;
  public readonly block: Cube;
  public override boat: Boat;
  public readonly scale1: Scale; // Scale sitting to the right of the pool
  public readonly customDensityProperty: NumberProperty;
  public readonly customDensityControlVisibleProperty: TReadOnlyProperty<boolean>;

  public constructor( options: BuoyancyApplicationsModelOptions ) {

    const tandem = options.tandem;

    super( combineOptions<DensityBuoyancyModelOptions>( {
      usePoolScale: true
    }, options ) );

    this.sceneProperty = new EnumerationProperty( Scene.BOAT, {
      tandem: options.tandem.createTandem( 'sceneProperty' )
    } );
    this.densityExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'densityExpandedProperty' )
    } );

    this.bottle = new Bottle( this.engine, {
      matrix: Matrix3.translation( 0, 0 ),
      tandem: tandem.createTandem( 'bottle' ),
      visible: true
    } );
    this.availableMasses.push( this.bottle );

    this.block = Cube.createWithVolume( this.engine, Material.BRICK, new Vector2( -0.5, 0.3 ), 0.001, {
      visible: false,
      tandem: tandem.createTandem( 'block' )
    } );
    this.availableMasses.push( this.block );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.boat = new Boat( this.engine, new DerivedProperty( [ this.block.sizeProperty ], size => size.depth ), this.liquidMaterialProperty, {
      matrix: Matrix3.translation( 0, -0.1 ),
      tandem: tandem.createTandem( 'boat' ),
      visible: false
    } );
    this.availableMasses.push( this.boat );

    this.scale1 = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.77, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'scale1' ),
      canMove: false,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } );
    this.availableMasses.push( this.scale1 );

    this.customDensityProperty = new NumberProperty( 1, {
      range: new Range( 0.05, 20 ),
      tandem: tandem.createTandem( 'customDensityProperty' ),
      units: 'kg/L'
    } );
    this.customDensityControlVisibleProperty = new DerivedProperty( [ this.bottle.interiorMaterialProperty ],
      material => material.custom, {
        tandem: tandem.createTandem( 'customDensityControlVisibleProperty' ),
        phetioValueType: BooleanIO
      } );

    // Adjust pool volume so that it's at the desired value WITH the pool scales inside.
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.sceneProperty.link( scene => {
      this.bottle.internalVisibleProperty.value = scene === Scene.BOTTLE;
      this.boat.internalVisibleProperty.value = scene === Scene.BOAT;
      this.block.internalVisibleProperty.value = scene === Scene.BOAT;
      this.scale2!.internalVisibleProperty.value = scene === Scene.BOTTLE;

      assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
        'Boat and bottle should not be visible at the same time' );
    } );

    this.scale2!.internalVisibleProperty.lazyLink( visible => {
      const plusMinusScale = visible ? -1 : 1;
      this.pool.liquidVolumeProperty.value += plusMinusScale * this.scale2!.volumeProperty.value;
      this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );
    } );
  }

  public override step( dt: number ): void {
    assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
      'Boat and bottle should not be visible at the same time' );

    super.step( dt );
  }

  /**
   * Moves the boat and block to their initial locations (see https://github.com/phetsims/buoyancy/issues/25)
   */
  public resetBoatScene(): void {
    // Reset the basin levels (clear the liquid out of the boat)
    this.boat.basin.reset();
    this.pool.reset();

    // Move things to the initial position
    this.boat.resetPosition();
    this.block.resetPosition();
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.densityExpandedProperty.reset();

    this.bottle.reset();
    this.block.reset();
    this.boat.reset();

    this.customDensityProperty.reset();

    super.reset();

    this.sceneProperty.reset();

    assert && assert( !this.boat.visibleProperty.value || !this.bottle.visibleProperty.value,
      'Boat and bottle should not be visible at the same time' );
  }
}

densityBuoyancyCommon.register( 'BuoyancyApplicationsModel', BuoyancyApplicationsModel );