// Copyright 2024, University of Colorado Boulder

/**
 * The 3D view for a Duck.
 *
 * @author Agustín Vallejo
 * @author Michael Kauzmann
 */

import Bounds3 from '../../../../dot/js/Bounds3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Duck from '../model/Duck.js';
import { THREEModelViewTransform } from '../../common/view/DensityBuoyancyScreenView.js';
import MeasurableMassView from '../../common/view/MeasurableMassView.js';

export default class DuckView extends MeasurableMassView {

  public readonly duck: Duck;
  private readonly duckGeometry: THREE.BufferGeometry;

  // private readonly updateListener: ( newSize: Bounds3, oldSize: Bounds3 ) => void;

  public constructor( duck: Duck, modelViewTransform: THREEModelViewTransform,
                      dragBoundsProperty: TReadOnlyProperty<Bounds3>,
                      showGravityForceProperty: TReadOnlyProperty<boolean>,
                      showBuoyancyForceProperty: TReadOnlyProperty<boolean>,
                      showContactForceProperty: TReadOnlyProperty<boolean>,
                      showForceValuesProperty: TReadOnlyProperty<boolean>,
                      forceScaleProperty: TReadOnlyProperty<number>,
                      showMassesProperty: TReadOnlyProperty<boolean> ) {

    const duckGeometry = Duck.getGeometry();

    super( duck, duckGeometry, modelViewTransform, dragBoundsProperty,

      showGravityForceProperty,
      showBuoyancyForceProperty,
      showContactForceProperty,
      showForceValuesProperty,
      forceScaleProperty,

      showMassesProperty );

    this.duck = duck;
    this.duckGeometry = duckGeometry;
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.duckGeometry.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'DuckView', DuckView );