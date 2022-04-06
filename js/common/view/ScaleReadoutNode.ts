// Copyright 2019-2022, University of Colorado Boulder

/**
 * Shows a readout in front of a scale, for its measured mass/weight.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
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
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';

export default class ScaleReadoutNode extends Node {

  mass: Scale;
  private scaleForceMultilink: Multilink<[number, Gravity]>;

  constructor( mass: Scale, gravityProperty: IReadOnlyProperty<Gravity> ) {
    super();

    const readoutText = new Text( '', {
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

    this.addChild( readoutPanel );

    this.mass = mass;

    this.scaleForceMultilink = Property.multilink( [ mass.scaleForceInterpolatedProperty, gravityProperty ], ( scaleForce: number, gravity: Gravity ) => {
      if ( mass.displayType === DisplayType.NEWTONS ) {
        readoutText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.newtonsPattern, {
          newtons: Utils.toFixed( scaleForce, 2 )
        } );
      }
      else {
        readoutText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPattern, {
          kilograms: gravity.value > 0 ? Utils.toFixed( scaleForce / gravity.value, 2 ) : '-'
        } );
      }
      readoutPanel.center = Vector2.ZERO;
    } );
  }

  /**
   * Releases references.
   */
  override dispose() {
    this.scaleForceMultilink.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ScaleReadoutNode', ScaleReadoutNode );
