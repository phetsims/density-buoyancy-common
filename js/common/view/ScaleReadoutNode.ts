// Copyright 2019-2022, University of Colorado Boulder

/**
 * Shows a readout in front of a scale, for its measured mass/weight.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Scale, { DisplayType } from '../model/Scale.js';
import Gravity from '../model/Gravity.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

export default class ScaleReadoutNode extends Node {

  public readonly mass: Scale;

  private readonly textProperty: TReadOnlyProperty<string>;

  public constructor( mass: Scale, gravityProperty: TReadOnlyProperty<Gravity> ) {
    super( {
      pickable: false
    } );

    this.textProperty = new DerivedProperty( [
      mass.scaleForceInterpolatedProperty,
      gravityProperty,
      densityBuoyancyCommonStrings.newtonsPatternStringProperty,
      densityBuoyancyCommonStrings.kilogramsPatternStringProperty
    ], ( scaleForce, gravity, newtonsPattern, kilogramsPattern ) => {
      if ( mass.displayType === DisplayType.NEWTONS ) {
        return StringUtils.fillIn( newtonsPattern, {
          newtons: Utils.toFixed( scaleForce, 2 )
        } );
      }
      else {
        return StringUtils.fillIn( kilogramsPattern, {
          kilograms: gravity.value > 0 ? Utils.toFixed( scaleForce / gravity.value, 2 ) : '-'
        } );
      }
    } );

    const readoutText = new Text( this.textProperty, {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } ),
      maxWidth: 85
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

    this.mass = mass;
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.textProperty.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ScaleReadoutNode', ScaleReadoutNode );
