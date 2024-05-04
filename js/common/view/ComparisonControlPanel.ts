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
import { combineOptions, EmptySelfOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import UnitConversionProperty from '../../../../axon/js/UnitConversionProperty.js';
import ComparisonNumberControl from './ComparisonNumberControl.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BlockSet from '../model/BlockSet.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';

const TRACK_SIZE = new Dimension2( 80, 0.5 );

type SelfOptions = EmptySelfOptions;

type ComparisonControlPanelOptions = SelfOptions & PickRequired<Partial<PanelOptions>, 'tandem'>;

export default class ComparisonControlPanel extends Panel {

  public constructor( massProperty: NumberProperty,
                      volumeProperty: NumberProperty,
                      densityProperty: NumberProperty,
                      blockSetProperty: TReadOnlyProperty<BlockSet>,
                      providedOptions: ComparisonControlPanelOptions ) {

    const options = optionize3<ComparisonControlPanelOptions, SelfOptions, PanelOptions>()( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, providedOptions );

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
          trackSize: TRACK_SIZE
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
          trackSize: TRACK_SIZE
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
          trackSize: TRACK_SIZE

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
      ],
      excludeInvisibleChildrenFromBounds: true // To give the "swap out" functionality.
    } ), combineOptions<PanelOptions>( {
      visibleProperty: DerivedProperty.or( [ massNumberControl.visibleProperty, volumeNumberControl.visibleProperty, densityNumberControl.visibleProperty ] )
    }, options ) );
  }
}

densityBuoyancyCommon.register( 'ComparisonControlPanel', ComparisonControlPanel );