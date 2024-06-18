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

  public readonly showGravityForceProperty: Property<boolean>;
  public readonly showBuoyancyForceProperty: Property<boolean>;
  public readonly showContactForceProperty: Property<boolean>;
  public readonly showForceValuesProperty: Property<boolean>;

  public readonly showMassValuesProperty: Property<boolean>;
  public readonly showDepthLinesProperty: Property<boolean>;

  public readonly vectorZoomProperty: NumberProperty;

  public constructor( canShowForces: boolean,
                      tandem: Tandem,
                      public readonly supportsDepthLines: boolean,
                      forcesInitiallyDisplayed: boolean,
                      massValuesInitiallyDisplayed: boolean,
                      initialForceScale: number ) {
    this.showGravityForceProperty = new BooleanProperty( forcesInitiallyDisplayed, {
      tandem: canShowForces ? tandem.createTandem( 'showGravityForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showBuoyancyForceProperty = new BooleanProperty( forcesInitiallyDisplayed, {
      tandem: canShowForces ? tandem.createTandem( 'showBuoyancyForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showContactForceProperty = new BooleanProperty( forcesInitiallyDisplayed, {
      tandem: canShowForces ? tandem.createTandem( 'showContactForceProperty' ) : Tandem.OPT_OUT
    } );
    this.showForceValuesProperty = new BooleanProperty( forcesInitiallyDisplayed, {
      tandem: canShowForces ? tandem.createTandem( 'showForceValuesProperty' ) : Tandem.OPT_OUT
    } );
    this.showMassValuesProperty = new BooleanProperty( massValuesInitiallyDisplayed, {
      tandem: tandem.createTandem( 'showMassValuesProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Displays a mass readout on each object'
    } );
    this.vectorZoomProperty = new NumberProperty( initialForceScale, {
      tandem: canShowForces ? tandem.createTandem( 'vectorZoomProperty' ) : Tandem.OPT_OUT,
      range: new Range( Math.pow( 0.5, 9 ), 1 )
    } );

    this.showDepthLinesProperty = new BooleanProperty( false, {
      tandem: supportsDepthLines ? tandem.createTandem( 'showDepthLinesProperty' ) : Tandem.OPT_OUT,
      phetioDocumentation: 'Display visual lines on blocks to aid in calculating the percentage that the block is submerged.'
    } );
  }

  public reset(): void {
    this.showGravityForceProperty.reset();
    this.showBuoyancyForceProperty.reset();
    this.showContactForceProperty.reset();
    this.showMassValuesProperty.reset();
    this.showForceValuesProperty.reset();
    this.showDepthLinesProperty.reset();
    this.vectorZoomProperty.reset();
  }

}

densityBuoyancyCommon.register( 'DisplayProperties', DisplayProperties );