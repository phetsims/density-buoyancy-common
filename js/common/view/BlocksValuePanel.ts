// Copyright 2024, University of Colorado Boulder

/**
 * Shows a NumberControl for the current BlockSet, to control the "locked in" variable.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import { optionize4 } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import UnitConversionProperty from '../../../../axon/js/UnitConversionProperty.js';
import ComparisonNumberControl, { DEFAULT_COMPARISON_TRACK_SIZE } from './ComparisonNumberControl.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BlockSet from '../model/BlockSet.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';

type SelfOptions = {
  sliderTrackSize?: Dimension2;
};

type BlocksValuePanelOptions = SelfOptions & PickRequired<Partial<PanelOptions>, 'tandem'>;

export default class BlocksValuePanel extends Panel {

  public constructor( massProperty: NumberProperty,
                      volumeProperty: NumberProperty,
                      densityProperty: NumberProperty,
                      blockSetProperty: TReadOnlyProperty<BlockSet>,
                      providedOptions: BlocksValuePanelOptions ) {


    const options = optionize4<BlocksValuePanelOptions, SelfOptions, PanelOptions>()( {},
      DensityBuoyancyCommonConstants.PANEL_OPTIONS, {
        sliderTrackSize: DEFAULT_COMPARISON_TRACK_SIZE
      }, providedOptions );

    // For unit conversion, cubic meters => liters
    const convertedVolumeProperty = new UnitConversionProperty( volumeProperty, {
      factor: DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
    } );

    // For unit conversion, kg/cubic meter => kg/liter
    const convertedDensityProperty = new UnitConversionProperty( densityProperty, {
      factor: 1 / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
    } );

    // PhET-iO Note: We are not using tandemName here because we don't want to instrument the ToggleNode itself.
    // Instead, we instrument the number controls directly under the Panel. See design in https://github.com/phetsims/density-buoyancy-common/issues/251
    const toggleNode = new ToggleNode( blockSetProperty, [ {
      value: BlockSet.SAME_MASS,
      createNode: () => new ComparisonNumberControl(
        massProperty,
        DensityBuoyancyCommonStrings.massStringProperty,
        DensityBuoyancyCommonStrings.kilogramsPatternStringProperty,
        'kilograms', {
          tandem: options.tandem.createTandem( 'massNumberControl' ),
          sliderOptions: {
            phetioLinkedProperty: massProperty,
            trackSize: options.sliderTrackSize,
            accessibleName: DensityBuoyancyCommonStrings.massStringProperty
          },
          phetioVisiblePropertyInstrumented: false
        }
      )
    }, {
      value: BlockSet.SAME_VOLUME,
      createNode: () => new ComparisonNumberControl(
        convertedVolumeProperty,
        DensityBuoyancyCommonStrings.volumeStringProperty,
        DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
        'value', {
          tandem: options.tandem.createTandem( 'volumeNumberControl' ),
          sliderOptions: {
            phetioLinkedProperty: volumeProperty,
            trackSize: options.sliderTrackSize,
            accessibleName: DensityBuoyancyCommonStrings.volumeStringProperty
          },
          phetioVisiblePropertyInstrumented: false
        }
      )
    }, {
      value: BlockSet.SAME_DENSITY,
      createNode: () => new ComparisonNumberControl(
        convertedDensityProperty,
        DensityBuoyancyCommonStrings.densityStringProperty,
        DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY,
        'value', {
          tandem: options.tandem.createTandem( 'densityNumberControl' ),
          sliderOptions: {
            phetioLinkedProperty: densityProperty,
            trackSize: options.sliderTrackSize,
            accessibleName: DensityBuoyancyCommonStrings.densityStringProperty
          },
          phetioVisiblePropertyInstrumented: false
        }
      )
    } ] );

    super( toggleNode, options );
  }
}

densityBuoyancyCommon.register( 'BlocksValuePanel', BlocksValuePanel );