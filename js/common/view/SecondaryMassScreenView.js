// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const SecondMassVisibleControl = require( 'DENSITY_BUOYANCY_COMMON/common/view/SecondMassVisibleControl' );
  const Vector3 = require( 'DOT/Vector3' );

  class SecondaryMassScreenView extends DensityBuoyancyScreenView {
    /**
     * Adding the second-mass control
     */
    addSecondMassControl() {

      // @private {Node}
      this.secondMassVisibleControl = new SecondMassVisibleControl( this.model.secondaryMassVisibleProperty );

      this.addChild( this.secondMassVisibleControl );

      this.rightBox.on( 'transform', () => this.positionSecondMassControl() );
      this.on( 'transform', () => this.positionSecondMassControl() );
    }

    /**
     * Positions the second-mass control.
     * @private
     */
    positionSecondMassControl() {
      const point3 = new Vector3(
        0,
        this.model.poolBounds.minY,
        this.model.poolBounds.maxZ
      );
      this.secondMassVisibleControl.bottom = this.modelToViewPoint( point3 ).y;
      this.secondMassVisibleControl.centerX = this.rightBox.centerX;
    }

    /**
     * @override
     * @param {number} width
     * @param {number} height
     */
    layout( width, height ) {
      super.layout( width, height );

      // If the simulation was not able to load for WebGL, bail out
      if ( !this.sceneNode ) {
        return;
      }

      this.positionSecondMassControl();
    }
  }

  return densityBuoyancyCommon.register( 'SecondaryMassScreenView', SecondaryMassScreenView );
} );
