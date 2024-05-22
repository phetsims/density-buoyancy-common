// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Explore screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import TwoBlockMode from '../../common/model/TwoBlockMode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassTag from '../../common/model/MassTag.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import VolumelessScale from '../../common/model/VolumelessScale.js';
import PoolScaleHeightProperty from '../../common/model/PoolScaleHeightProperty.js';

type BuoyancyBasicsExploreModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyBasicsExploreModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  public readonly primaryMass: Cube;
  public readonly secondaryMass: Cube;
  public readonly poolScaleHeightProperty: NumberProperty;
  public readonly poolScale: Scale;

  public constructor( options: BuoyancyBasicsExploreModelOptions ) {

    const tandem = options.tandem;

    super( combineOptions<DensityBuoyancyModelOptions>( {
      usePoolScale: false, // Create our own for the ScaleHeightControl
      supportsDepthLines: true
    }, options ) );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: tandem.createTandem( 'modeProperty' )
    } );

    const blocksTandem = tandem.createTandem( 'blocks' );

    this.primaryMass = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: MassTag.PRIMARY,
      tandem: blocksTandem.createTandem( 'blockA' )
    } );
    this.availableMasses.push( this.primaryMass );
    this.secondaryMass = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( 0.05, 0.35 ), 13.5, {
      tag: MassTag.SECONDARY,
      tandem: blocksTandem.createTandem( 'blockB' ),
      visible: false
    } );
    this.availableMasses.push( this.secondaryMass );

    this.modeProperty.link( mode => {
      this.secondaryMass.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

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

    this.poolScaleHeightProperty = new PoolScaleHeightProperty( 1, {
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

    this.showMassValuesProperty.value = false;
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {
    this.modeProperty.reset();

    this.primaryMass.reset();
    this.secondaryMass.reset();

    super.reset();

    // This has to be called after the super reset
    this.poolScaleHeightProperty.reset();
  }
}

densityBuoyancyCommon.register( 'BuoyancyBasicsExploreModel', BuoyancyBasicsExploreModel );