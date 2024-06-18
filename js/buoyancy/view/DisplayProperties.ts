// Copyright 2024, University of Colorado Boulder

/**
 * Contains properties that control the display of forces and mass values.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Property from '../../../../axon/js/Property.js';

export default class DisplayProperties {

  public readonly gravityForceVisibleProperty: Property<boolean>;
  public readonly buoyancyForceVisibleProperty: Property<boolean>;
  public readonly contactForceVisibleProperty: Property<boolean>;
  public readonly forceValuesVisibleProperty: Property<boolean>;

  public readonly massValuesVisibleProperty: Property<boolean>;
  public readonly depthLinesVisibleProperty: Property<boolean>;

  public readonly vectorZoomProperty: NumberProperty;

  public constructor( canShowForces: boolean,
                      tandem: Tandem,
                      public readonly supportsDepthLines: boolean,
                      forcesInitiallyDisplayed: boolean,
                      massValuesInitiallyDisplayed: boolean,
                      initialForceScale: number ) {
    this.gravityForceVisibleProperty = new BooleanProperty( forcesInitiallyDisplayed, {
      tandem: canShowForces ? tandem.createTandem( 'gravityForceVisibleProperty' ) : Tandem.OPT_OUT
    } );
    this.buoyancyForceVisibleProperty = new BooleanProperty( forcesInitiallyDisplayed, {
      tandem: canShowForces ? tandem.createTandem( 'buoyancyForceVisibleProperty' ) : Tandem.OPT_OUT
    } );
    this.contactForceVisibleProperty = new BooleanProperty( forcesInitiallyDisplayed, {
      tandem: canShowForces ? tandem.createTandem( 'contactForceVisibleProperty' ) : Tandem.OPT_OUT
    } );
    this.forceValuesVisibleProperty = new BooleanProperty( forcesInitiallyDisplayed, {
      tandem: canShowForces ? tandem.createTandem( 'forceValuesVisibleProperty' ) : Tandem.OPT_OUT
    } );
    this.massValuesVisibleProperty = new BooleanProperty( massValuesInitiallyDisplayed, {
      tandem: tandem.createTandem( 'massValuesVisibleProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Displays a mass readout on each object'
    } );
    this.vectorZoomProperty = new NumberProperty( initialForceScale, {
      tandem: canShowForces ? tandem.createTandem( 'vectorZoomProperty' ) : Tandem.OPT_OUT,
      range: new Range( Math.pow( 0.5, 9 ), 1 )
    } );

    this.depthLinesVisibleProperty = new BooleanProperty( false, {
      tandem: supportsDepthLines ? tandem.createTandem( 'depthLinesVisibleProperty' ) : Tandem.OPT_OUT,
      phetioDocumentation: 'Display visual lines on blocks to aid in calculating the percentage that the block is submerged.'
    } );
  }

  public reset(): void {
    this.gravityForceVisibleProperty.reset();
    this.buoyancyForceVisibleProperty.reset();
    this.contactForceVisibleProperty.reset();
    this.massValuesVisibleProperty.reset();
    this.forceValuesVisibleProperty.reset();
    this.depthLinesVisibleProperty.reset();
    this.vectorZoomProperty.reset();
  }

}

densityBuoyancyCommon.register( 'DisplayProperties', DisplayProperties );