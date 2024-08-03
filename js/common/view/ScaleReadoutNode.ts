// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows a readout in front of a scale, for its measured mass/weight.
 * Not dependent on a Scale model instance.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants, { chooseDecimalPlaces } from '../DensityBuoyancyCommonConstants.js';
import Scale, { DisplayType } from '../model/Scale.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import BlendedNumberProperty from '../model/BlendedNumberProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import GravityProperty from '../model/GravityProperty.js';

type GeneralScaleReadoutNodeSelfOptions = {
  textMaxWidth?: number;
};
type GeneralScaleReadoutNodeOptions = NodeOptions & GeneralScaleReadoutNodeSelfOptions;

export class GeneralScaleReadoutNode extends Node {

  private readonly stringProperty: TReadOnlyProperty<string>;

  public constructor( forceProperty: TReadOnlyProperty<number>, gravityProperty: GravityProperty,
                      displayType: DisplayType, providedOptions?: GeneralScaleReadoutNodeOptions ) {
    const options = optionize<GeneralScaleReadoutNodeOptions, GeneralScaleReadoutNodeSelfOptions, NodeOptions>()( {
      pickable: false,
      textMaxWidth: 85
    }, providedOptions );
    super( options );

    this.stringProperty = new DerivedProperty( [
      forceProperty,
      gravityProperty.gravityValueProperty,
      DensityBuoyancyCommonStrings.newtonsPatternStringProperty,
      DensityBuoyancyCommonStrings.kilogramsPatternStringProperty
    ], ( scaleForce, gravityValue, newtonsPattern, kilogramsPattern ) => {
      if ( displayType === DisplayType.NEWTONS ) {
        return StringUtils.fillIn( newtonsPattern, {
          newtons: Utils.toFixed( scaleForce, chooseDecimalPlaces( scaleForce ) )
        } );
      }
      else {
        return StringUtils.fillIn( kilogramsPattern, {
          kilograms: gravityValue > 0 ? Utils.toFixed( scaleForce / gravityValue, chooseDecimalPlaces( scaleForce ) ) : '-'
        } );
      }
    } );

    const readoutText = new Text( this.stringProperty, {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } ),
      maxWidth: options.textMaxWidth
    } );

    const readoutPanel = new Panel( readoutText, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      xMargin: 2,
      yMargin: 2,
      fill: null,
      stroke: null
    } );

    readoutPanel.localBoundsProperty.link( () => {
      readoutPanel.center = Vector2.ZERO;
    } );

    this.addChild( readoutPanel );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.stringProperty.dispose();

    super.dispose();
  }
}

// TODO: https://github.com/phetsims/density-buoyancy-common/issues/257 document how this differs from GeneralScaleReadoutNode
// TODO: How can a client choose which one they need? See https://github.com/phetsims/density-buoyancy-common/issues/257
export default class ScaleReadoutNode extends GeneralScaleReadoutNode {

  // TODO: Rename mass => scale, see https://github.com/phetsims/density-buoyancy-common/issues/123
  public constructor( public readonly mass: Scale, gravityProperty: GravityProperty ) {

    const blendedProperty = new BlendedNumberProperty( mass.measuredWeightInterpolatedProperty.value );
    mass.stepEmitter.addListener( () => blendedProperty.step( mass.measuredWeightInterpolatedProperty.value ) );

    super( blendedProperty, gravityProperty, mass.displayType );
  }
}

densityBuoyancyCommon.register( 'ScaleReadoutNode', ScaleReadoutNode );