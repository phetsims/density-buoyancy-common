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
import VolumelessScale from '../../common/model/VolumelessScale.js';

export type BuoyancyLabModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyLabModel extends DensityBuoyancyModel {

  public readonly primaryMass: Cube;
  public readonly densityExpandedProperty: Property<boolean>;
  public readonly showFluidDisplacedProperty: Property<boolean>;
  public readonly poolScaleHeightProperty: NumberProperty;
  public readonly poolScale: Scale;

  public constructor( options: BuoyancyLabModelOptions ) {

    const tandem = options.tandem;

    super( combineOptions<DensityBuoyancyModelOptions>( {
      supportsDepthLines: true,
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
      canMove: false,
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
    this.poolScale = new VolumelessScale( this.engine, this.gravityProperty, {
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'poolScale' ),
      canMove: false, // No input listeners, but the ScaleHeightControl can still move it
      inputEnabledPropertyOptions: {
        phetioReadOnly: true
      }
    } );

    // Make sure to render it
    this.availableMasses.push( this.poolScale );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    super.reset();

    this.primaryMass.reset();

    this.densityExpandedProperty.reset();

    // The model position of the pool is reset before, so even if this Property value doesn't change, we need to reposition via listeners
    this.poolScaleHeightProperty.reset();
    this.poolScaleHeightProperty.notifyListenersStatic();
  }
}

densityBuoyancyCommon.register( 'BuoyancyLabModel', BuoyancyLabModel );