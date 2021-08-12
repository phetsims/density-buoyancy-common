// Copyright 2019-2021, University of Colorado Boulder

/**
 * Controls the dimensions of different masses with a generic "height/width" control.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import FlowBox from '../../../../scenery/js/layout/FlowBox.js';
import VDivider from '../../../../scenery/js/layout/VDivider.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import BuoyancyShapesModel from '../model/BuoyancyShapesModel.js';

// constants
const shapeStringMap = {
  [ BuoyancyShapesModel.MassShape.BLOCK ]: densityBuoyancyCommonStrings.shape.block,
  [ BuoyancyShapesModel.MassShape.ELLIPSOID ]: densityBuoyancyCommonStrings.shape.ellipsoid,
  [ BuoyancyShapesModel.MassShape.VERTICAL_CYLINDER ]: densityBuoyancyCommonStrings.shape.verticalCylinder,
  [ BuoyancyShapesModel.MassShape.HORIZONTAL_CYLINDER ]: densityBuoyancyCommonStrings.shape.horizontalCylinder,
  [ BuoyancyShapesModel.MassShape.CONE ]: densityBuoyancyCommonStrings.shape.cone,
  [ BuoyancyShapesModel.MassShape.INVERTED_CONE ]: densityBuoyancyCommonStrings.shape.invertedCone
};
const tandemNameMap = {
  [ BuoyancyShapesModel.MassShape.BLOCK ]: 'block',
  [ BuoyancyShapesModel.MassShape.ELLIPSOID ]: 'ellipsoid',
  [ BuoyancyShapesModel.MassShape.VERTICAL_CYLINDER ]: 'verticalCylinder',
  [ BuoyancyShapesModel.MassShape.HORIZONTAL_CYLINDER ]: 'horizontalCylinder',
  [ BuoyancyShapesModel.MassShape.CONE ]: 'cone',
  [ BuoyancyShapesModel.MassShape.INVERTED_CONE ]: 'invertedCone'
};

class ShapeSizeControlNode extends FlowBox {
  /**
   * @param {Property.<BuoyancyShapesModel.MassShape>} massShapeProperty
   * @param {Property.<number>} widthRatioProperty
   * @param {Property.<number>} heightRatioProperty
   * @param {Property.<number>} volumeProperty
   * @param {Node} listParent
   * @param {Object} [options]
   */
  constructor( massShapeProperty, widthRatioProperty, heightRatioProperty, volumeProperty, listParent, options ) {

    options = merge( {
      // {Node|null}
      labelNode: null
    }, options );

    super( {
      spacing: 5,
      orientation: 'vertical',
      align: 'left'
    } );

    const comboBox = new ComboBox( BuoyancyShapesModel.MassShape.VALUES.map( massShape => {
      return new ComboBoxItem( new Text( shapeStringMap[ massShape ], {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: 160
      } ), massShape, { tandemName: `${tandemNameMap[ massShape ]}Item` } );
    } ), massShapeProperty, listParent, {
      xMargin: 8,
      yMargin: 4
    } );

    const numberControlOptions = {
      delta: 0.01,
      sliderOptions: {
        trackSize: new Dimension2( 120, 3 ),
        thumbSize: new Dimension2( 8, 20 )
      },
      numberDisplayOptions: {
        decimalPlaces: 2,
        textOptions: {
          font: DensityBuoyancyCommonConstants.READOUT_FONT
        },
        useFullHeight: true
      },
      layoutFunction: NumberControl.createLayoutFunction4( {
        hasReadoutProperty: new BooleanProperty( false )
      } ),
      titleNodeOptions: {
        maxWidth: 160
      }
    };

    const widthNumberControl = new NumberControl( densityBuoyancyCommonStrings.width, widthRatioProperty, new Range( 0, 1 ), numberControlOptions );
    const heightNumberControl = new NumberControl( densityBuoyancyCommonStrings.height, heightRatioProperty, new Range( 0, 1 ), numberControlOptions );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const litersProperty = new DerivedProperty( [ volumeProperty ], volume => {
      return volume * 1000;
    } );

    this.children = [
      // TODO: ensure maxWidth for combo box contents so this isn't an issue. How do we want to do layout?
      new HBox( {
        spacing: 5,
        children: [
          comboBox,
          options.labelNode
        ].filter( _.identity )
      } ),
      heightNumberControl,
      widthNumberControl,
      new VDivider(),
      new FlowBox( {
        layoutOptions: { align: 'stretch' },
        orientation: 'horizontal',
        align: 'center',
        justify: 'spaceBetween',
        children: [
          new Text( densityBuoyancyCommonStrings.volume, {
            font: new PhetFont( 12 ),
            maxWidth: 120
          } ),
          new NumberDisplay( litersProperty, new Range( 0, 10 ), { // TODO: is 10 the most?
            valuePattern: StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
              liters: '{{value}}'
            } ),
            decimalPlaces: 2,
            textOptions: {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: 160
            }
          } )
        ]
      } )
    ];

    this.mutate( options );
  }
}

densityBuoyancyCommon.register( 'ShapeSizeControlNode', ShapeSizeControlNode );
export default ShapeSizeControlNode;