// Copyright 2020-2021, University of Colorado Boulder

/**
 * A subtype of ScreenView that has a primary/secondary mass (with visibility controls for the second mass)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyScreenView from './DensityBuoyancyScreenView.js';
import SecondMassVisibleControl from './SecondMassVisibleControl.js';

class SecondaryMassScreenView extends DensityBuoyancyScreenView {
  /**
   * Adding the second-mass control.
   * @protected
   */
  addSecondMassControl() {

    // @private {Node}
    this.secondMassVisibleControl = new SecondMassVisibleControl( this.model.secondaryMassVisibleProperty );

    this.addChild( this.secondMassVisibleControl );

    this.rightBox.transformEmitter.addListener( () => this.positionSecondMassControl() );
    this.transformEmitter.addListener( () => this.positionSecondMassControl() );
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
    this.secondMassVisibleControl.left = this.rightBox.left;
  }

  /**
   * @public
   * @override
   * @param {Bounds2} viewBounds
   */
  layout( viewBounds ) {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.positionSecondMassControl();
  }
}

densityBuoyancyCommon.register( 'SecondaryMassScreenView', SecondaryMassScreenView );
export default SecondaryMassScreenView;