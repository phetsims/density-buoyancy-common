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
import { Text, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utils from '../../../../dot/js/Utils.js';

type SelfOptions = EmptySelfOptions;

type FluidDisplacedPanelOptions = SelfOptions & MultiSectionPanelsNodeOptions;

const STARTING_VOLUME = DensityBuoyancyCommonConstants.DESIRED_STARTING_POOL_VOLUME * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER;

export default class FluidDisplacedPanel extends MultiSectionPanelsNode {

  /**
   * @param poolVolumeProperty
   * @param maxBeakerVolume - in liters
   * @param providedOptions
   */
  public constructor( poolVolumeProperty: TReadOnlyProperty<number>,
                      maxBeakerVolume: number,
                      providedOptions?: FluidDisplacedPanelOptions ) {
    // TODO: is there a way to assert this? https://github.com/phetsims/buoyancy/issues/113
    // assert && assert( Utils.toFixedNumber( poolVolumeProperty.value, 7 ) === 100,      'This class greatly expects the starting value to be 100.' );


    const displayRange = new Range( 0, maxBeakerVolume );
    const displayedDisplacedVolumeProperty = new NumberProperty( 0, { range: displayRange } );
    poolVolumeProperty.link( totalLiters => {
      // TODO: assert if we go over 10?? https://github.com/phetsims/buoyancy/issues/113
      displayedDisplacedVolumeProperty.value = displayRange.constrainValue( totalLiters - STARTING_VOLUME );
    } );

    const numberDisplay = new NumberDisplay( displayedDisplacedVolumeProperty, displayedDisplacedVolumeProperty.range, {
      numberFormatter: value => StringUtils.fillIn( DensityBuoyancyCommonStrings.litersPatternStringProperty, {
        liters: Utils.toFixed( value, 2 )
      } ),
      numberFormatterDependencies: [ DensityBuoyancyCommonStrings.litersPatternStringProperty ]
    } );

    // Beaker expects a range between 0 and 1
    const beakerRange = new Range( 0, 1 );
    const beakerVolumeProperty = new NumberProperty( 0, { range: beakerRange } );
    displayedDisplacedVolumeProperty.link( displayedLiters => {
      // TODO: assert if we go over 1?? https://github.com/phetsims/buoyancy/issues/113
      beakerVolumeProperty.value = beakerRange.constrainValue( ( displayedLiters ) / maxBeakerVolume );
    } );

    // TODO: add majorTickMarkModulus: 5 as an option, https://github.com/phetsims/buoyancy/issues/113
    const beakerNode = new BeakerNode( beakerVolumeProperty, {
      lineWidth: 1,
      beakerHeight: 100,
      beakerWidth: 100,
      yRadiusOfEnds: 12,
      ticksVisible: true,
      numberOfTicks: 10
    } );

    super( [ new VBox( {
      spacing: DensityBuoyancyCommonConstants.MARGIN,
      children: [
        new Text( DensityBuoyancyCommonStrings.fluidDisplacedStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 100
        } ),
        beakerNode,
        numberDisplay
      ]
    } ) ], providedOptions );
  }
}

densityBuoyancyCommon.register( 'FluidDisplacedPanel', FluidDisplacedPanel );
