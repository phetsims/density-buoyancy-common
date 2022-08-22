// Copyright 2019-2022, University of Colorado Boulder

/**
 * Controls the dimensions of different masses with a generic "height/width" control.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import { FlowBox, FlowBoxOptions, HBox, Node, Text, VDivider } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import { MassShape } from '../../common/model/MassShape.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';

// constants
const shapeStringMap = {
  [ MassShape.BLOCK.name ]: densityBuoyancyCommonStrings.shape.blockProperty,
  [ MassShape.ELLIPSOID.name ]: densityBuoyancyCommonStrings.shape.ellipsoidProperty,
  [ MassShape.VERTICAL_CYLINDER.name ]: densityBuoyancyCommonStrings.shape.verticalCylinderProperty,
  [ MassShape.HORIZONTAL_CYLINDER.name ]: densityBuoyancyCommonStrings.shape.horizontalCylinderProperty,
  [ MassShape.CONE.name ]: densityBuoyancyCommonStrings.shape.coneProperty,
  [ MassShape.INVERTED_CONE.name ]: densityBuoyancyCommonStrings.shape.invertedConeProperty
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

export default class ShapeSizeControlNode extends FlowBox {
  public constructor( massShapeProperty: Property<MassShape>, widthRatioProperty: Property<number>, heightRatioProperty: Property<number>, volumeProperty: TReadOnlyProperty<number>, listParent: Node, providedOptions?: ShapeSizeControlNodeOptions ) {

    const options = optionize<ShapeSizeControlNodeOptions, SelfOptions, FlowBoxOptions>()( {
      labelNode: null
    }, providedOptions );

    super( {
      spacing: 5,
      orientation: 'vertical',
      align: 'left'
    } );

    const comboBox = new ComboBox( massShapeProperty, MassShape.enumeration.values.map( massShape => {
      return {
        value: massShape,
        node: new Text( shapeStringMap[ massShape.name ], {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: 160
        } ),
        tandemName: `${tandemNameMap[ massShape.name ]}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      };
    } ), listParent, {
      xMargin: 8,
      yMargin: 4
    } );

    const numberControlOptions = {
      delta: 0.01,
      sliderOptions: {
        trackSize: new Dimension2( 120, 0.5 ),
        thumbSize: DensityBuoyancyCommonConstants.THUMB_SIZE
      },
      numberDisplayOptions: {
        decimalPlaces: 2,
        textOptions: {
          font: DensityBuoyancyCommonConstants.READOUT_FONT
        },
        useFullHeight: true
      },
      layoutFunction: NumberControl.createLayoutFunction4( {
        hasReadoutProperty: new BooleanProperty( false ),
        sliderPadding: 5
      } ),
      titleNodeOptions: {
        font: DensityBuoyancyCommonConstants.ITEM_FONT,
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
        layoutOptions: { stretch: true },
        orientation: 'horizontal',
        align: 'center',
        justify: 'spaceBetween',
        children: [
          new Text( densityBuoyancyCommonStrings.volumeProperty, {
            font: DensityBuoyancyCommonConstants.READOUT_FONT,
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
