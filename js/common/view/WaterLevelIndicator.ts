// Copyright 2019-2022, University of Colorado Boulder

/**
 * Shows the water level numerically next to the top-left of the pool's water. Lives for the lifetime of the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { ManualConstraint } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';

export default class WaterLevelIndicator extends Node {
  public constructor( volumeProperty: IReadOnlyProperty<number> ) {
    super();

    const highlightShape = new Shape().moveTo( 0, 0 ).lineTo( -20, -10 ).lineTo( -20, 10 ).close();
    const highlightPath = new Path( highlightShape, {
      fill: DensityBuoyancyCommonColors.waterIndicatorHighlightProperty
    } );
    this.addChild( highlightPath );

    const readoutText = new Text( '', {
      font: new PhetFont( { size: 18 } ),
      maxWidth: 200
    } );

    const readoutPanel = new Panel( readoutText, {
      // Not using the typical margins for UI panels in this sim
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS
    } );
    this.addChild( readoutPanel );

    // Can't use Text.textProperty, see https://github.com/phetsims/scenery/issues/1187
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    volumeProperty.link( volume => {
      readoutText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
        liters: Utils.toFixed( 1000 * volume, 2 )
      } );
    } );

    ManualConstraint.create( this, [ readoutPanel, highlightPath ], ( readoutWrapper, highlightWrapper ) => {
      readoutWrapper.rightCenter = highlightWrapper.leftCenter;
    } );
  }
}

densityBuoyancyCommon.register( 'WaterLevelIndicator', WaterLevelIndicator );
