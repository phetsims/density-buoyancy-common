// Copyright 2020-2021, University of Colorado Boulder

/**
 * A subtype of ScreenView that has a primary/secondary mass (with visibility controls for the second mass)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BlocksRadioButtonGroup from './BlocksRadioButtonGroup.js';
import DensityBuoyancyScreenView from './DensityBuoyancyScreenView.js';

class SecondaryMassScreenView extends DensityBuoyancyScreenView {
  /**
   * Adding the second-mass control.
   * @protected
   *
   * @param {Property.<TwoBlockMode>} modeProperty
   */
  addSecondMassControl( modeProperty ) {
    assert && assert( this.rightBox, 'SecondaryMassScreenView requires a this.rightBox be defined to add this control' );

    // @private {Node}
    this.blocksRadioButtonGroup = new BlocksRadioButtonGroup( modeProperty, {
      tandem: this.tandem.createTandem( 'blocksRadioButtonGroup' )
    } );

    this.addChild( this.blocksRadioButtonGroup );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.rightBox.transformEmitter.addListener( () => this.positionSecondMassControl() );
    this.transformEmitter.addListener( () => this.positionSecondMassControl() );
  }

  /**
   * Positions the second-mass control.
   * @private
   */
  positionSecondMassControl() {
    this.blocksRadioButtonGroup.bottom = this.modelToViewPoint( new Vector3(
      0,
      this.model.poolBounds.minY,
      this.model.poolBounds.maxZ
    ) ).y;
    this.blocksRadioButtonGroup.left = this.rightBox.left;
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