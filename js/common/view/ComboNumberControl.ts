// Copyright 2019-2024, University of Colorado Boulder

/**
 * Handles controlling a quantity with a NumberControl, but combined with a ComboBox for specific non-custom values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
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

type SelfOptions<T> = {
  titleProperty: TReadOnlyProperty<string>;
  valuePatternProperty: TReadOnlyProperty<string>; // with {{value}} placeholder
  property: Property<T>;
  range: Range;

  // Converts the Property values into numeric values
  toNumericValue: ( t: T ) => number;

  // Given a numeric value, creates the corresponding rich object
  createCustomValue: ( n: number ) => T;

  // Given a main value, returns whether it is a custom value or not
  isCustomValue: ( t: T ) => boolean;

  // Given a main value, returns whether it is a hidden value or not
  isHiddenValue: ( t: T ) => boolean;

  listParent: Node;

  comboItems: ComboBoxItem<T>[];

  // The token value in items that is the designated custom value
  customValue: T;

  getFallbackNode?: ( t: T ) => Node | null;

  numberControlOptions?: NumberControlOptions;
  comboBoxOptions?: ComboBoxOptions;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

export type ComboNumberControlOptions<T> = SelfOptions<T> & VBoxOptions;

export default abstract class ComboNumberControl<T> extends VBox {

  private readonly property: Property<T>;
  private readonly numberProperty: Property<number>;
  private readonly comboProperty: Property<T>;
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
            this.property.link( listener );
            disposalCallbacks.push( () => this.property.unlink( listener ) );

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
    assert && assert( options.property instanceof Property );
    assert && assert( typeof options.toNumericValue === 'function' );
    assert && assert( typeof options.createCustomValue === 'function' );
    assert && assert( typeof options.isCustomValue === 'function' );
    assert && assert( Array.isArray( options.comboItems ) );
    assert && assert( options.customValue );

    const getFallbackNode = options.getFallbackNode;

    super();

    const getNumericValue = ( value: T ) => options.toNumericValue( value );
    const getComboValue = ( value: T ) => options.isCustomValue( value ) ? options.customValue : value;

    this.property = options.property;
    this.numberProperty = new NumberProperty( getNumericValue( this.property.value ) );
    this.comboProperty = new Property( getComboValue( this.property.value ) );
    this.disposalCallbacks = disposalCallbacks;

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    // Track the last non-hidden value, so that if we go to CUSTOM, we'll use this (and not just show the hidden value,
    // see https://github.com/phetsims/buoyancy/issues/54
    let lastNonHiddenValue = this.property.value;
    this.property.link( value => {
      if ( !options.isHiddenValue( value ) ) {
        lastNonHiddenValue = value;
      }
    } );

    let locked = false;

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.property.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        this.numberProperty.value = getNumericValue( value );
        this.comboProperty.value = getComboValue( value );

        locked = false;
      }
    } );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.numberProperty.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        this.property.value = options.createCustomValue( value );
        this.comboProperty.value = options.customValue;

        locked = false;
      }
    } );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.comboProperty.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        if ( options.isCustomValue( value ) ) {
          // We'll swap to the last non-hidden value (and make it custom). This is so that we don't immediately show a
          // "hidden" previous value (e.g. DENSITY_A) and the students have to guess it.
          // See https://github.com/phetsims/buoyancy/issues/54
          const newValue = getNumericValue( lastNonHiddenValue );
          this.property.value = options.createCustomValue( newValue );
          this.numberProperty.value = newValue;
        }
        else {
          this.property.value = value;
          this.numberProperty.value = getNumericValue( value );
        }

        locked = false;
      }
    } );

    this.numberControl = new NumberControl( options.titleProperty, this.numberProperty, options.range, combineOptions<NumberControlOptions>( {
      tandem: options.tandem.createTandem( 'numberControl' ),
      sliderOptions: {
        accessibleName: options.titleProperty
      }
    }, options.numberControlOptions ) );
    this.numberControl.addLinkedElement( this.property, {
      tandemName: 'valueProperty'
    } );

    this.comboBox = new ComboBox( this.comboProperty, options.comboItems, options.listParent, combineOptions<ComboBoxOptions>( {
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

    this.numberProperty.dispose();
    this.comboProperty.dispose();

    this.disposalCallbacks.forEach( callback => callback() );

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ComboNumberControl', ComboNumberControl );