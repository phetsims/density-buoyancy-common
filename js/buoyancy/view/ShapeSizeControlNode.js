// Copyright 2019-2020, University of Colorado Boulder

/**
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
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
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

class ShapeSizeControlNode extends VBox {
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
      align: 'left'
    } );

    const comboBox = new ComboBox( BuoyancyShapesModel.MassShape.VALUES.map( massShape => {
      return new ComboBoxItem( new Text( shapeStringMap[ massShape ], {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: 160
      } ), massShape );
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
        }
      },
      layoutFunction: NumberControl.createLayoutFunction4( {
        hasReadoutProperty: new BooleanProperty( false )
        // TODO: createBottomContent for custom? or no?
      } ),
      titleNodeOptions: {
        maxWidth: 160
      }
    };

    const widthNumberControl = new NumberControl( densityBuoyancyCommonStrings.width, widthRatioProperty, new Range( 0, 1 ), numberControlOptions );
    const heightNumberControl = new NumberControl( densityBuoyancyCommonStrings.height, heightRatioProperty, new Range( 0, 1 ), numberControlOptions );

    // TODO: ensure maxWidth for combo box contents so this isn't an issue. How do we want to do layout?
    const topRow = options.labelNode ? new HBox( {
      children: [
        comboBox,
        options.labelNode
      ],
      spacing: 5
    } ) : comboBox;

    const volumeLabel = new Text( densityBuoyancyCommonStrings.volume, {
      font: new PhetFont( 12 ),
      maxWidth: 120
    } );

    const litersProperty = new DerivedProperty( [ volumeProperty ], volume => {
      return volume * 1000;
    } );

    this.children = [
      topRow,
      heightNumberControl,
      widthNumberControl,
      new HSeparator( heightNumberControl.width ),
      new Node( {
        children: [
          volumeLabel,
          new AlignBox( new NumberDisplay( litersProperty, new Range( 0, 10 ), { // TODO: is 10 the most?
            valuePattern: StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
              liters: '{{value}}'
            } ),
            decimalPlaces: 2,
            textOptions: {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: 160
            }
          } ), {
            alignBounds: volumeLabel.bounds.withMaxX( heightNumberControl.width ),
            xAlign: 'right',
            yAlign: 'center'
          } )
        ]
      } )
    ];

    this.mutate( options );
  }
}

densityBuoyancyCommon.register( 'ShapeSizeControlNode', ShapeSizeControlNode );
export default ShapeSizeControlNode;