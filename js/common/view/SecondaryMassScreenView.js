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
   *
   * @param {Property.<boolean>} secondaryMassVisibleProperty
   */
  addSecondMassControl( secondaryMassVisibleProperty ) {
    assert && assert( this.rightBox, 'SecondaryMassScreenView requires a this.rightBox be defined to add this control' );

    // @private {Node}
    this.secondMassVisibleControl = new SecondMassVisibleControl( secondaryMassVisibleProperty, this.tandem.createTandem( 'secondMassVisibleControl' ) );

    this.addChild( this.secondMassVisibleControl );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.rightBox.transformEmitter.addListener( () => this.positionSecondMassControl() );
    this.transformEmitter.addListener( () => this.positionSecondMassControl() );
  }

  /**
   * Positions the second-mass control.
   * @private
   */
  positionSecondMassControl() {
    this.secondMassVisibleControl.bottom = this.modelToViewPoint( new Vector3(
      0,
      this.model.poolBounds.minY,
      this.model.poolBounds.maxZ
    ) ).y;
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