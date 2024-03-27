// Copyright 2024, University of Colorado Boulder

/**
 * A display to show the excess pool liquid that has been displaced.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MultiSectionPanelsNode, { MultiSectionPanelsNodeOptions } from '../../common/view/MultiSectionPanelsNode.js';
import BeakerNode from '../../../../scenery-phet/js/BeakerNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Node, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Gravity from '../../common/model/Gravity.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';

type SelfOptions = EmptySelfOptions;

type FluidDisplacedPanelOptions = SelfOptions & MultiSectionPanelsNodeOptions;

const STARTING_VOLUME = DensityBuoyancyCommonConstants.DESIRED_STARTING_POOL_VOLUME * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER;
const CONTENT_WIDTH = 100;

export default class FluidDisplacedPanel extends MultiSectionPanelsNode {

  public constructor( poolVolumeProperty: TReadOnlyProperty<number>,
                      maxBeakerVolume: number,
                      scaleIcon: Node,
                      gravityProperty: TReadOnlyProperty<Gravity>,
                      providedOptions?: FluidDisplacedPanelOptions ) {
    // TODO: is there a way to assert this? https://github.com/phetsims/buoyancy/issues/113
    // assert && assert( Utils.toFixedNumber( poolVolumeProperty.value, 7 ) === 100,      'This class greatly expects the starting value to be 100.' );

    const displayRange = new Range( 0, maxBeakerVolume );
    const displayedDisplacedVolumeProperty = new NumberProperty( 0, { range: displayRange } );
    poolVolumeProperty.link( totalLiters => {
      // TODO: assert if we go over 10?? https://github.com/phetsims/buoyancy/issues/113
      displayedDisplacedVolumeProperty.value = displayRange.constrainValue( totalLiters - STARTING_VOLUME );
    } );

    // Beaker expects a range between 0 and 1
    const beakerRange = new Range( 0, 1 );
    const beakerVolumeProperty = new NumberProperty( 0, { range: beakerRange } );

    // TODO: add majorTickMarkModulus: 5 as an option, https://github.com/phetsims/buoyancy/issues/113
    const beakerNode = new BeakerNode( beakerVolumeProperty, {
      lineWidth: 1,
      beakerHeight: CONTENT_WIDTH * 0.8,
      beakerWidth: CONTENT_WIDTH,
      yRadiusOfEnds: CONTENT_WIDTH * 0.12,
      ticksVisible: true,
      numberOfTicks: 10
    } );

    displayedDisplacedVolumeProperty.link( displayedLiters => {
      // TODO: assert if we go over 1?? https://github.com/phetsims/buoyancy/issues/113
      beakerVolumeProperty.value = beakerRange.constrainValue( ( displayedLiters ) / maxBeakerVolume );
    } );

    const numberDisplay = new NumberDisplay( displayedDisplacedVolumeProperty, displayedDisplacedVolumeProperty.range, {
      numberFormatter: value => StringUtils.fillIn( DensityBuoyancyCommonStrings.litersPatternStringProperty, {
        liters: Utils.toFixed( value, 2 )
      } ),
      numberFormatterDependencies: [ DensityBuoyancyCommonStrings.litersPatternStringProperty ],
      textOptions: {
        font: new PhetFont( 14 ),
        maxWidth: beakerNode.width * 0.66 // recognizing that this isn't the maxWidth of the whole NumberDisplay.
      },
      opacity: 0.8
    } );

    const stringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.newtonsPatternStringProperty, {
      newtons: displayedDisplacedVolumeProperty
    }, {
      decimalPlaces: {
        newtons: 2
      }
    } );
    const forceReadout = new RichText( stringProperty, {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } ),
      maxWidth: scaleIcon.width * 0.8 // margins on the scale, and the icon goes beyond the actual scale, see https://github.com/phetsims/density-buoyancy-common/issues/108
    } );

    stringProperty.link( () => {
      forceReadout.centerX = beakerNode.centerX;
    } );

    numberDisplay.bottom = beakerNode.bottom;
    numberDisplay.left = beakerNode.left;
    scaleIcon.top = beakerNode.bottom - 20;
    forceReadout.centerY = scaleIcon.bottom - 15;
    scaleIcon.centerX = forceReadout.centerX = beakerNode.centerX;

    super( [ new VBox( {
      spacing: DensityBuoyancyCommonConstants.MARGIN,
      children: [
        new Text( DensityBuoyancyCommonStrings.fluidDisplacedStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: CONTENT_WIDTH
        } ),
        new Node( {
          children: [ scaleIcon, beakerNode, numberDisplay, forceReadout ]
        } )
      ]
    } ) ], providedOptions );
  }
}

densityBuoyancyCommon.register( 'FluidDisplacedPanel', FluidDisplacedPanel );