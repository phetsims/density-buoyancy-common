// Copyright 2019-2022, University of Colorado Boulder

/**
 * Handles controlling a quantity with a NumberControl, but combined with a ComboBox for specific non-custom values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, VBoxOptions } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import { VBox } from '../../../../scenery/js/imports.js';
import ComboBox, { ComboBoxOptions } from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';

type SelfOptions<T> = {
  title: string;
  valuePattern: string; // with {{value}} placeholder
  property: Property<T>;
  range: Range;

  // Converts the Property values into numeric values
  toNumericValue: ( t: T ) => number;

  // Given a numeric value, creates the corresponding rich object
  createCustomValue: ( n: number ) => T;

  // Given a main value, returns whether it is a custom value or not
  isCustomValue: ( t: T ) => boolean;

  listParent: Node;

  comboItems: ComboBoxItem<T>[];

  // The token value in items that is the designated custom value
  customValue: T;

  getFallbackNode?: ( t: T ) => Node | null;

  numberControlOptions?: NumberControlOptions;
  comboBoxOptions?: ComboBoxOptions;
};

export type ComboNumberControlOptions<T> = SelfOptions<T> & VBoxOptions;

export default class ComboNumberControl<T> extends VBox {

  private property: Property<T>;
  private numberProperty: Property<number>;
  private comboProperty: Property<T>;
  private disposalCallbacks: ( () => void )[];
  private numberControl: NumberControl;
  private comboBox: ComboBox<T>;

  constructor( providedConfig: SelfOptions<T> ) {

    const disposalCallbacks: ( () => void )[] = [];
    const numberDisplayVisibleProperty = new BooleanProperty( true );

    const config = optionize<ComboNumberControlOptions<T>, SelfOptions<T>, VBoxOptions>( {
      getFallbackNode: () => null,

      // {Object} Options for the number control
      numberControlOptions: {
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
          }
        } ),
        titleNodeOptions: {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 120
        },
        numberDisplayOptions: {
          textOptions: {
            font: DensityBuoyancyCommonConstants.READOUT_FONT
          },
          valuePattern: StringUtils.fillIn( providedConfig.valuePattern, { value: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
          maxWidth: 100,
          decimalPlaces: 2,
          useRichText: true,
          useFullHeight: true,
          visibleProperty: numberDisplayVisibleProperty
        },
        arrowButtonOptions: { scale: 0.56 },

        sliderOptions: {
          majorTickLength: 5,
          thumbSize: new Dimension2( 13, 22 ),
          thumbTouchAreaXDilation: 5,
          thumbTouchAreaYDilation: 4,
          majorTicks: [ {
            value: providedConfig.range.min,
            label: new Text( providedConfig.range.min, { font: new PhetFont( 12 ), maxWidth: 50 } )
          }, {
            value: providedConfig.range.max,
            label: new Text( providedConfig.range.max, { font: new PhetFont( 12 ), maxWidth: 50 } )
          } ],
          trackSize: new Dimension2( 120, 0.5 )
        }
      },

      // {Object} Options for the combo box
      comboBoxOptions: {
        cornerRadius: 3,
        xMargin: 13,
        yMargin: 5
      },

      // VBox options
      spacing: 10,
      align: 'center'
    }, providedConfig );

    assert && assert( !config.children, 'Children should not be specified for ComboNumberControl' );
    assert && assert( typeof config.title === 'string' );
    assert && assert( config.property instanceof Property );
    assert && assert( config.range instanceof Range );
    assert && assert( typeof config.toNumericValue === 'function' );
    assert && assert( typeof config.createCustomValue === 'function' );
    assert && assert( typeof config.isCustomValue === 'function' );
    assert && assert( config.listParent instanceof Node );
    assert && assert( Array.isArray( config.comboItems ) );
    assert && assert( config.customValue );

    const getFallbackNode = config.getFallbackNode;

    super();

    const getNumericValue = ( value: T ) => config.toNumericValue( value );
    const getComboValue = ( value: T ) => config.isCustomValue( value ) ? config.customValue : value;

    this.property = config.property;
    this.numberProperty = new NumberProperty( getNumericValue( this.property.value ) );
    this.comboProperty = new Property( getComboValue( this.property.value ) );
    this.disposalCallbacks = disposalCallbacks;

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

        this.property.value = config.createCustomValue( value );
        this.comboProperty.value = config.customValue;

        locked = false;
      }
    } );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.comboProperty.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        this.property.value = config.isCustomValue( value ) ? config.createCustomValue( this.numberProperty.value ) : value;
        if ( !config.isCustomValue( value ) ) {
          this.numberProperty.value = getNumericValue( value );
        }

        locked = false;
      }
    } );

    this.numberControl = new NumberControl( config.title, this.numberProperty, config.range, merge( {
      sliderOptions: {
        phetioLinkedProperty: this.property
      }
    }, config.numberControlOptions ) );

    this.comboBox = new ComboBox( config.comboItems, this.comboProperty, config.listParent, config.comboBoxOptions );

    config.children = [
      this.numberControl,
      this.comboBox
    ];

    this.mutate( config );
  }

  /**
   * Releases references.
   */
  override dispose() {
    this.numberControl.dispose();
    this.comboBox.dispose();

    this.numberProperty.dispose();
    this.comboProperty.dispose();

    this.disposalCallbacks.forEach( callback => callback() );

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ComboNumberControl', ComboNumberControl );
