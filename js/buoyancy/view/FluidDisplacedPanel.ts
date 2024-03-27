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
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

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
    assert && assert( Utils.toFixedNumber( poolVolumeProperty.value, 7 ) === STARTING_VOLUME,
      `This class greatly expects the starting volume of the pool to be ${STARTING_VOLUME}L.` );

    const displayRange = new Range( 0, maxBeakerVolume );
    const displayedDisplacedVolumeProperty = new NumberProperty( 0, { range: displayRange } );
    poolVolumeProperty.link( totalLiters => {
      const displacedVolume = totalLiters - STARTING_VOLUME;
      assert && assert( Utils.toFixedNumber( displacedVolume, 7 ) <= maxBeakerVolume,
        `pool volume exceeded expected max of ${STARTING_VOLUME + maxBeakerVolume}: ${totalLiters}` );
      displayedDisplacedVolumeProperty.value = displayRange.constrainValue( displacedVolume );
    } );

    // Beaker expects a range between 0 and 1
    const beakerRange = new Range( 0, 1 );
    const beakerVolumeProperty = new NumberProperty( 0, { range: beakerRange } );

    const beakerNode = new BeakerNode( beakerVolumeProperty, {
      lineWidth: 1,
      beakerHeight: CONTENT_WIDTH * 0.8,
      beakerWidth: CONTENT_WIDTH,
      yRadiusOfEnds: CONTENT_WIDTH * 0.12,
      ticksVisible: true,
      numberOfTicks: 9, // The top is the 10th tick mark
      majorTickMarkModulus: 5
    } );

    displayedDisplacedVolumeProperty.link( displayedLiters => {
      beakerVolumeProperty.value = displayedLiters / maxBeakerVolume;
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

    const displacedFluidForceProperty = new DerivedProperty( [
      gravityProperty,
      displayedDisplacedVolumeProperty
    ], ( gravity, displacedVolume ) => gravity.value * displacedVolume );

    const stringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.newtonsPatternStringProperty, {
      newtons: displacedFluidForceProperty
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