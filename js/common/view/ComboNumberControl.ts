// Copyright 2019-2024, University of Colorado Boulder

/**
 * Handles controlling a quantity with a NumberControl, but combined with a ComboBox for specific non-custom values.
 * TODO: More careful review as part of https://github.com/phetsims/density-buoyancy-common/issues/123
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import ComboBox, { ComboBoxItem, ComboBoxOptions } from '../../../../sun/js/ComboBox.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Material from '../model/Material.js';
import Gravity from '../model/Gravity.js';
import MappedWrappedProperty from '../model/MappedWrappedProperty.js';
import UnitConversionProperty from '../../../../axon/js/UnitConversionProperty.js';

type SelfOptions<T extends Material | Gravity> = {
  titleProperty: TReadOnlyProperty<string>;
  valuePatternProperty: TReadOnlyProperty<string>; // with {{value}} placeholder
  property: MappedWrappedProperty<T>;
  range: Range;

  listParent: Node;

  comboItems: ComboBoxItem<T>[];

  getFallbackNode?: ( t: T ) => Node | null;

  numberControlOptions?: NumberControlOptions;
  comboBoxOptions?: ComboBoxOptions;

  unitsConversionFactor: number;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

export type ComboNumberControlOptions<T extends Material | Gravity> = SelfOptions<T> & VBoxOptions;

export default abstract class ComboNumberControl<T extends Material | Gravity> extends VBox {

  private readonly mappedWrappedProperty: MappedWrappedProperty<T>;
  private readonly disposalCallbacks: ( () => void )[];
  private readonly numberControl: NumberControl;
  private readonly comboBox: ComboBox<T>;

  protected constructor( providedOptions: SelfOptions<T> ) {

    const disposalCallbacks: ( () => void )[] = [];
    const numberDisplayVisibleProperty = new BooleanProperty( true );

    const options = optionize<ComboNumberControlOptions<T>, SelfOptions<T>, VBoxOptions>()( {
      getFallbackNode: () => null,

      // {Object} Options for the number control
      numberControlOptions: {
        delta: DensityBuoyancyCommonConstants.NUMBER_CONTROL_DELTA,
        layoutFunction: NumberControl.createLayoutFunction4( {
          createBottomContent: bottomBox => {

            const fallbackContainer = new Node();

            // Supports Pendulum Lab's questionText where a question is substituted for the slider
            const bottomContent = new Node( {
              children: [
                bottomBox,
                fallbackContainer
              ]
            } );

            const listener = ( value: T ) => {
              const fallbackNode = getFallbackNode( value );
              const hasFallback = fallbackNode !== null;

              bottomBox.visible = !hasFallback;
              numberDisplayVisibleProperty.value = !hasFallback;
              fallbackContainer.removeAllChildren();

              if ( fallbackNode !== null ) {
                fallbackContainer.addChild( fallbackNode );
                fallbackNode.maxWidth = bottomBox.width;
                fallbackNode.center = bottomBox.center;
              }
            };

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            this.mappedWrappedProperty.link( listener );
            disposalCallbacks.push( () => this.mappedWrappedProperty.unlink( listener ) );

            return bottomContent;
          },
          sliderPadding: 5
        } ),
        titleNodeOptions: {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 120
        },
        numberDisplayOptions: {
          textOptions: {
            font: DensityBuoyancyCommonConstants.READOUT_FONT
          },
          valuePattern: new PatternStringProperty( providedOptions.valuePatternProperty, {
            value: SunConstants.VALUE_NAMED_PLACEHOLDER
          }, { tandem: Tandem.OPT_OUT } ),
          maxWidth: 100,
          decimalPlaces: 2,
          useRichText: true,
          useFullHeight: true,
          visibleProperty: numberDisplayVisibleProperty
        },
        arrowButtonOptions: {
          scale: DensityBuoyancyCommonConstants.ARROW_BUTTON_SCALE
        },
        sliderOptions: {
          majorTickLength: 5,
          thumbSize: DensityBuoyancyCommonConstants.THUMB_SIZE,
          thumbTouchAreaXDilation: 5,
          thumbTouchAreaYDilation: 4,
          majorTicks: [ {
            value: providedOptions.range.min,
            label: new Text( providedOptions.range.min, { font: new PhetFont( 12 ), maxWidth: 50 } )
          }, {
            value: providedOptions.range.max,
            label: new Text( providedOptions.range.max, { font: new PhetFont( 12 ), maxWidth: 50 } )
          } ],
          trackSize: new Dimension2( 120, 0.5 ),
          keyboardStep: DensityBuoyancyCommonConstants.SLIDER_KEYBOARD_STEP,
          pageKeyboardStep: DensityBuoyancyCommonConstants.SLIDER_KEYBOARD_PAGE_STEP,
          shiftKeyboardStep: DensityBuoyancyCommonConstants.SLIDER_KEYBOARD_SHIFT_STEP
        }
      },

      // {Object} Options for the combo box
      comboBoxOptions: {
        cornerRadius: 3,
        xMargin: 13,
        yMargin: 5
      },

      // VBox options
      spacing: DensityBuoyancyCommonConstants.SPACING,
      align: 'center'
    }, providedOptions );

    assert && assert( !options.children, 'Children should not be specified for ComboNumberControl' );

    const getFallbackNode = options.getFallbackNode;

    super();

    this.mappedWrappedProperty = options.property;
    this.disposalCallbacks = disposalCallbacks;

    const correctUnitsProperty = new UnitConversionProperty( this.mappedWrappedProperty.customValue.valueProperty, {
      factor: options.unitsConversionFactor
    } );

    this.numberControl = new NumberControl( options.titleProperty, correctUnitsProperty, options.range, combineOptions<NumberControlOptions>( {
      tandem: options.tandem.createTandem( 'numberControl' ),
      sliderOptions: {
        accessibleName: options.titleProperty
      }
    }, options.numberControlOptions ) );
    this.numberControl.addLinkedElement( this.mappedWrappedProperty.customValue.valueProperty, {
      tandemName: 'valueProperty'
    } );

    this.comboBox = new ComboBox( this.mappedWrappedProperty, options.comboItems, options.listParent, combineOptions<ComboBoxOptions>( {
      tandem: options.tandem.createTandem( 'comboBox' )
    }, options.comboBoxOptions ) );

    options.children = [
      this.numberControl,
      this.comboBox
    ];

    // @ts-expect-error
    delete options.tandem;

    this.mutate( options );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.numberControl.dispose();
    this.comboBox.dispose();

    this.disposalCallbacks.forEach( callback => callback() );

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ComboNumberControl', ComboNumberControl );