// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows a readout in front of a scale, for its measured mass/weight.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import Gravity from '../model/Gravity.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import BlendedNumberProperty from '../model/BlendedNumberProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';

type GeneralScaleReadoutNodeSelfOptions = {
  textMaxWidth?: number;
};
type GeneralScaleReadoutNodeOptions = NodeOptions & GeneralScaleReadoutNodeSelfOptions;

// Not dependent on a Scale model instance.
export class GeneralScaleReadoutNode extends Node {

  private readonly stringProperty: TReadOnlyProperty<string>;

  public constructor( forceProperty: TReadOnlyProperty<number>, gravityProperty: TReadOnlyProperty<Gravity>,
                      displayType: DisplayType, providedOptions?: GeneralScaleReadoutNodeOptions ) {
    const options = optionize<GeneralScaleReadoutNodeOptions, GeneralScaleReadoutNodeSelfOptions, NodeOptions>()( {
      pickable: false,
      textMaxWidth: 85
    }, providedOptions );
    super( options );

    this.stringProperty = new DerivedProperty( [
      forceProperty,
      gravityProperty,
      DensityBuoyancyCommonStrings.newtonsPatternStringProperty,
      DensityBuoyancyCommonStrings.kilogramsPatternStringProperty
    ], ( scaleForce, gravity, newtonsPattern, kilogramsPattern ) => {
      if ( displayType === DisplayType.NEWTONS ) {
        return StringUtils.fillIn( newtonsPattern, {
          newtons: Utils.toFixed( scaleForce, chooseDecimalPlaces( scaleForce ) )
        } );
      }
      else {
        return StringUtils.fillIn( kilogramsPattern, {
          kilograms: gravity.value > 0 ? Utils.toFixed( scaleForce / gravity.value, chooseDecimalPlaces( scaleForce ) ) : '-'
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

export default class ScaleReadoutNode extends GeneralScaleReadoutNode {

  public readonly mass: Scale;

  public constructor( mass: Scale, gravityProperty: TReadOnlyProperty<Gravity> ) {

    const blendedProperty = new BlendedNumberProperty( mass.scaleForceInterpolatedProperty.value );
    mass.stepEmitter.addListener( () => blendedProperty.step( mass.scaleForceInterpolatedProperty.value ) );

    super( blendedProperty, gravityProperty, mass.displayType );

    this.mass = mass;
  }
}

densityBuoyancyCommon.register( 'ScaleReadoutNode', ScaleReadoutNode );