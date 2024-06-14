// Copyright 2024, University of Colorado Boulder

/**
 * Shows a NumberControl for the current BlockSet, to control the "locked in" variable.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Node, PhetioControlledVisibilityProperty } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import { combineOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import UnitConversionProperty from '../../../../axon/js/UnitConversionProperty.js';
import ComparisonNumberControl, { DEFAULT_COMPARISON_TRACK_SIZE } from './ComparisonNumberControl.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BlockSet from '../model/BlockSet.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';

type SelfOptions = {
  sliderTrackSize?: Dimension2;
};

type BlocksValueControlPanelOptions = SelfOptions & PickRequired<Partial<PanelOptions>, 'tandem'>;

export default class BlocksValueControlPanel extends Panel {

  public constructor( massProperty: NumberProperty,
                      volumeProperty: NumberProperty,
                      densityProperty: NumberProperty,
                      blockSetProperty: TReadOnlyProperty<BlockSet>,
                      providedOptions: BlocksValueControlPanelOptions ) {


    const options = optionize4<BlocksValueControlPanelOptions, SelfOptions, PanelOptions>()( {},
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

    const massNumberControlTandem = options.tandem.createTandem( 'massNumberControl' );
    const massNumberControl = new ComparisonNumberControl(
      massProperty,
      DensityBuoyancyCommonStrings.massStringProperty,
      DensityBuoyancyCommonStrings.kilogramsPatternStringProperty,
      'kilograms',
      {
        tandem: massNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ blockSetProperty ], blockSet => blockSet === BlockSet.SAME_MASS, {
          nodeTandem: massNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: massProperty,
          trackSize: options.sliderTrackSize,
          accessibleName: DensityBuoyancyCommonStrings.massStringProperty
        }
      }
    );

    const volumeNumberControlTandem = options.tandem.createTandem( 'volumeNumberControl' );
    const volumeNumberControl = new ComparisonNumberControl(
      convertedVolumeProperty,
      DensityBuoyancyCommonStrings.volumeStringProperty,
      DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
      'value',
      {
        tandem: volumeNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ blockSetProperty ], blockSet => blockSet === BlockSet.SAME_VOLUME, {
          nodeTandem: volumeNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: volumeProperty,
          trackSize: options.sliderTrackSize,
          accessibleName: DensityBuoyancyCommonStrings.volumeStringProperty
        }
      }
    );

    const densityNumberControlTandem = options.tandem.createTandem( 'densityNumberControl' );
    const densityNumberControl = new ComparisonNumberControl(
      convertedDensityProperty,
      DensityBuoyancyCommonStrings.densityStringProperty,
      DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY,
      'value',
      {
        tandem: densityNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ blockSetProperty ], blockSet => blockSet === BlockSet.SAME_DENSITY, {
          nodeTandem: densityNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: densityProperty,
          trackSize: options.sliderTrackSize,
          accessibleName: DensityBuoyancyCommonStrings.densityStringProperty
        }
      }
    );

    // @ts-expect-error - don't instrument this container.
    delete options.tandem;

    super( new Node( {
      children: [
        massNumberControl,
        volumeNumberControl,
        densityNumberControl
      ]
    } ), combineOptions<PanelOptions>( {
      visibleProperty: DerivedProperty.or( [ massNumberControl.visibleProperty, volumeNumberControl.visibleProperty, densityNumberControl.visibleProperty ] )
    }, options ) );
  }
}

densityBuoyancyCommon.register( 'BlocksValueControlPanel', BlocksValueControlPanel );