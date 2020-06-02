// Copyright 2019-2020, University of Colorado Boulder

/**
 * Handles controlling a quantity with a NumberControl, but combined with a ComboBox for specific non-custom values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';

class ComboNumberControl extends VBox {
  /**
   * @param {Object} config
   */
  constructor( config ) {

    config = merge( {
      // {string} - required
      title: null,

      // {string} - required, with {{value}} placeholder
      valuePattern: null,

      // {Property.<*>} - required
      property: null,

      // {Range} - required
      range: null,

      // {function} - Converts the Property values into numeric values
      toNumericValue: null,

      // {function} - Given a numeric value, creates the corresponding rich object
      createCustomValue: null,

      // {function} - Given a main value, returns whether it is a custom value or not
      isCustomValue: null,

      // {Node} - required
      listParent: null,

      // {Array.<Object>} - See ComboBox's items
      comboItems: null,

      // {*} - The token value in items that is the designated custom value
      customValue: null,

      // {Object} Options for the number control
      numberControlOptions: {
        layoutFunction: NumberControl.createLayoutFunction4(),

        titleNodeOptions: {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 80
        },
        numberDisplayOptions: {
          textOptions: {
            font: DensityBuoyancyCommonConstants.READOUT_FONT
          },
          valuePattern: StringUtils.fillIn( config.valuePattern, { value: SunConstants.VALUE_NUMBERED_PLACEHOLDER } ),
          maxWidth: 100,
          decimalPlaces: 2,
          useRichText: true
        },
        arrowButtonOptions: { scale: 0.56 },

        sliderOptions: {
          majorTickLength: 5,
          thumbSize: new Dimension2( 13, 22 ),
          thumbTouchAreaXDilation: 5,
          thumbTouchAreaYDilation: 4,
          majorTicks: [ {
            value: config.range.min,
            label: new Text( config.range.min, { font: new PhetFont( 12 ), maxWidth: 50 } )
          }, {
            value: config.range.max,
            label: new Text( config.range.max, { font: new PhetFont( 12 ), maxWidth: 50 } )
          } ],
          trackSize: new Dimension2( 120, 0.5 )
        }
      },

      // {Object} Options for the number control
      numberControlLayoutOptions: null,

      // {Object} Options for the combo box
      comboBoxOptions: {
        cornerRadius: 3,
        xMargin: 13,
        yMargin: 5
      },

      // VBox options
      spacing: 10,
      align: 'center'
    }, config );

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

    super();

    const getNumericValue = value => config.toNumericValue( value );
    const getComboValue = value => config.isCustomValue( value ) ? config.customValue : value;

    // @private {Property.<*>}
    this.property = config.property;

    // @private {Property.<number>}
    this.numberProperty = new NumberProperty( getNumericValue( this.property.value ) );

    // @private {Property.<*>}
    this.comboProperty = new Property( getComboValue( this.property.value ) );

    let locked = false;

    this.property.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        this.numberProperty.value = getNumericValue( value );
        this.comboProperty.value = getComboValue( value );

        locked = false;
      }
    } );
    this.numberProperty.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        this.property.value = config.createCustomValue( value );
        this.comboProperty.value = config.customValue;

        locked = false;
      }
    } );
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

    // @private {NumberControl}
    this.numberControl = new NumberControl( config.title, this.numberProperty, config.range, config.numberControlOptions );

    // @private {ComboBox}
    this.comboBox = new ComboBox( config.comboItems, this.comboProperty, config.listParent, config.comboBoxOptions );

    config.children = [
      this.numberControl,
      this.comboBox
    ];

    this.mutate( config );
  }

  /**
   * Releases references.
   * @public
   */
  dispose() {
    this.numberControl.dispose();
    this.comboBox.dispose();

    this.numberProperty.dispose();
    this.comboProperty.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ComboNumberControl', ComboNumberControl );
export default ComboNumberControl;