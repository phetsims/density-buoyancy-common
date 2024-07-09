// Copyright 2019-2024, University of Colorado Boulder

/**
 * Controls the dimensions of different masses with a generic "height/width" control.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import Range from '../../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../../phet-core/js/optionize.js';
import NumberControl, { NumberControlOptions } from '../../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../../scenery-phet/js/NumberDisplay.js';
import { FlowBoxOptions, HBox, HSeparator, Node, Text, VBox } from '../../../../../scenery/js/imports.js';
import ComboBox from '../../../../../sun/js/ComboBox.js';
import DensityBuoyancyCommonConstants, { toLiters } from '../../../common/DensityBuoyancyCommonConstants.js';
import { MassShape } from '../../../common/model/MassShape.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../../DensityBuoyancyCommonStrings.js';
import WithRequired from '../../../../../phet-core/js/types/WithRequired.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import BuoyancyShapeModel from '../../model/shapes/BuoyancyShapeModel.js';

type SelfOptions = {
  labelNode?: Node | null;
};

export type ShapeSizeControlNodeOptions = SelfOptions & WithRequired<FlowBoxOptions, 'tandem'>;

export default class ShapeSizeControlNode extends VBox {
  public constructor( shapeModel: BuoyancyShapeModel, volumeProperty: TReadOnlyProperty<number>,
                      listParent: Node, providedOptions?: ShapeSizeControlNodeOptions ) {

    const options = optionize<ShapeSizeControlNodeOptions, SelfOptions, FlowBoxOptions>()( {
      labelNode: null
    }, providedOptions );

    super( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'left'
    } );

    const shapeComboBox = new ComboBox( shapeModel.shapeProperty, MassShape.enumeration.values.map( massShape => {
      return {
        value: massShape,
        createNode: () => new Text( massShape.shapeString, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: 110 // 160 minus maxWidth of the icons
        } ),
        tandemName: `${massShape.tandemName}Item`,
        a11yName: massShape.shapeString
      };
    } ), listParent, {
      xMargin: 8,
      yMargin: 4,
      tandem: options.tandem.createTandem( 'shapeComboBox' )
    } );

    const numberControlOptions = {
      delta: DensityBuoyancyCommonConstants.NUMBER_CONTROL_DELTA,
      sliderOptions: {
        trackSize: new Dimension2( 120, 0.5 ),
        thumbSize: DensityBuoyancyCommonConstants.THUMB_SIZE
      },
      arrowButtonOptions: {
        scale: DensityBuoyancyCommonConstants.ARROW_BUTTON_SCALE
      },
      numberDisplayOptions: {
        tandem: Tandem.OPT_OUT
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

    const widthNumberControl = new NumberControl( DensityBuoyancyCommonStrings.widthStringProperty, shapeModel.widthRatioProperty, new Range( 0, 1 ), combineOptions<NumberControlOptions>( {
      tandem: options.tandem.createTandem( 'widthNumberControl' ),
      sliderOptions: {
        accessibleName: DensityBuoyancyCommonStrings.widthStringProperty
      }
    }, numberControlOptions ) );
    const heightNumberControl = new NumberControl( DensityBuoyancyCommonStrings.heightStringProperty, shapeModel.heightRatioProperty, new Range( 0, 1 ), combineOptions<NumberControlOptions>( {
      tandem: options.tandem.createTandem( 'heightNumberControl' ),
      sliderOptions: {
        accessibleName: DensityBuoyancyCommonStrings.heightStringProperty
      }
    }, numberControlOptions ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const litersProperty = new DerivedProperty( [ volumeProperty ], volume => toLiters( volume ) );

    this.children = [
      new HBox( {
        spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
        children: [
          shapeComboBox,
          options.labelNode
        ].filter( _.identity ) as Node[]
      } ),
      heightNumberControl,
      widthNumberControl,
      new HSeparator(),
      new HBox( {
        layoutOptions: { stretch: true },
        align: 'center',
        justify: 'spaceBetween',
        children: [
          new Text( DensityBuoyancyCommonStrings.volumeStringProperty, {
            font: DensityBuoyancyCommonConstants.READOUT_FONT,
            maxWidth: widthNumberControl.width / 2
          } ),

          // For this number display, the max is 8.66 (for the cube Block) but each shape has a different maximum. But
          // the limit of 10.00 works well for the sizing.
          new NumberDisplay( litersProperty, new Range( 0, 10 ), {
            valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
            useRichText: true,
            decimalPlaces: 2,
            textOptions: {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: widthNumberControl.width / 3 // to account for the numberDisplay padding
            }
          } )
        ]
      } )
    ];

    this.mutate( options );
  }
}

densityBuoyancyCommon.register( 'ShapeSizeControlNode', ShapeSizeControlNode );