// Copyright 2019-2022, University of Colorado Boulder

/**
 * Controls the dimensions of different masses with a generic "height/width" control.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { FlowBox, FlowBoxOptions, HBox, Text, VDivider, Node } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import { MassShape } from '../model/BuoyancyShapesModel.js';

// constants
const shapeStringMap = {
  [ MassShape.BLOCK.name ]: densityBuoyancyCommonStrings.shape.block,
  [ MassShape.ELLIPSOID.name ]: densityBuoyancyCommonStrings.shape.ellipsoid,
  [ MassShape.VERTICAL_CYLINDER.name ]: densityBuoyancyCommonStrings.shape.verticalCylinder,
  [ MassShape.HORIZONTAL_CYLINDER.name ]: densityBuoyancyCommonStrings.shape.horizontalCylinder,
  [ MassShape.CONE.name ]: densityBuoyancyCommonStrings.shape.cone,
  [ MassShape.INVERTED_CONE.name ]: densityBuoyancyCommonStrings.shape.invertedCone
};
const tandemNameMap = {
  [ MassShape.BLOCK.name ]: 'block',
  [ MassShape.ELLIPSOID.name ]: 'ellipsoid',
  [ MassShape.VERTICAL_CYLINDER.name ]: 'verticalCylinder',
  [ MassShape.HORIZONTAL_CYLINDER.name ]: 'horizontalCylinder',
  [ MassShape.CONE.name ]: 'cone',
  [ MassShape.INVERTED_CONE.name ]: 'invertedCone'
};

type SelfOptions = {
  labelNode?: Node | null;
};

export type ShapeSizeControlNodeOptions = SelfOptions & FlowBoxOptions;

class ShapeSizeControlNode extends FlowBox {
  constructor( massShapeProperty: Property<MassShape>, widthRatioProperty: Property<number>, heightRatioProperty: Property<number>, volumeProperty: Property<number>, listParent: Node, providedOptions?: ShapeSizeControlNodeOptions ) {

    const options = optionize<ShapeSizeControlNodeOptions, SelfOptions, FlowBoxOptions>( {
      labelNode: null
    }, providedOptions );

    super( {
      spacing: 5,
      orientation: 'vertical',
      align: 'left'
    } );

    const comboBox = new ComboBox( MassShape.enumeration.values.map( massShape => {
      return new ComboBoxItem( new Text( shapeStringMap[ massShape.name ], {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: 160
      } ), massShape, { tandemName: `${tandemNameMap[ massShape.name ]}Item` } );
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
        ].filter( _.identity ) as Node[]
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