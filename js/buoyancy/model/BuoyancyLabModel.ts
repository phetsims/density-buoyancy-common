// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Lab screen of the Buoyancy simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';

export type BuoyancyLabModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyLabModel extends DensityBuoyancyModel {

  public readonly primaryMass: Cube;
  public readonly densityExpandedProperty: Property<boolean>;
  public readonly showFluidDisplacedProperty: Property<boolean>;
  public readonly poolScaleHeightProperty: NumberProperty;

  public constructor( options: BuoyancyLabModelOptions ) {

    const tandem = options.tandem;

    super( combineOptions<DensityBuoyancyModelOptions>( {
      usePoolScale: false // Creating our own
    }, options ) );


    this.primaryMass = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tandem: tandem.createTandem( 'blocks' ).createTandem( 'blockA' )
    } );
    this.availableMasses.push( this.primaryMass );

    // Left scale
    this.availableMasses.push( new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.65, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'scale1' ),
      canMove: true,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } ) );

    this.densityExpandedProperty = new BooleanProperty( false );
    this.showFluidDisplacedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showFluidDisplacedProperty' )
    } );

    this.poolScaleHeightProperty = new NumberProperty( 1, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'poolScaleHeightProperty' )
    } );

    // Pool scale
    const poolScaleDefaultPosition = new Vector2( 0.35, -Scale.SCALE_BASE_BOUNDS.minY + 0.5 * this.poolBounds.minY );
    const poolScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( poolScaleDefaultPosition.x, poolScaleDefaultPosition.y ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'poolScale' ),
      canMove: false, //TODO This should be true, but first some work is needed https://github.com/phetsims/density-buoyancy-common/issues/107
      inputEnabledPropertyOptions: {
        phetioReadOnly: true
      }
    } );

    poolScale.startDrag( poolScale.matrix.translation );

    this.poolScaleHeightProperty.lazyLink( height => {
      const modelHeight = -0.5 * ( 2 - height ) * this.poolBounds.height - 2 * Scale.SCALE_BASE_BOUNDS.minY;
      poolScale.updateDrag( poolScale.matrix.translation.setXY( poolScaleDefaultPosition.x, modelHeight ) );
    } );

    this.availableMasses.push( poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {

    this.primaryMass.reset();

    this.densityExpandedProperty.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'BuoyancyLabModel', BuoyancyLabModel );