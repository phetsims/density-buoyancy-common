// Copyright 2019-2024, University of Colorado Boulder

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
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import { FlowBoxOptions, HBox, HSeparator, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import { MassShape } from '../../common/model/MassShape.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';

type SelfOptions = {
  labelNode?: Node | null;
};

export type ShapeSizeControlNodeOptions = SelfOptions & WithRequired<FlowBoxOptions, 'tandem'>;

export default class ShapeSizeControlNode extends VBox {
  public constructor( massShapeProperty: Property<MassShape>, widthRatioProperty: Property<number>,
                      heightRatioProperty: Property<number>, volumeProperty: TReadOnlyProperty<number>,
                      listParent: Node, providedOptions?: ShapeSizeControlNodeOptions ) {

    const options = optionize<ShapeSizeControlNodeOptions, SelfOptions, FlowBoxOptions>()( {
      labelNode: null
    }, providedOptions );

    super( {
      spacing: 5,
      align: 'left'
    } );

    const shapeComboBox = new ComboBox( massShapeProperty, MassShape.enumeration.values.map( massShape => {
      return {
        value: massShape,
        createNode: () => new Text( massShape.shapeString, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: 120 // 160 minus maxwidth of the icons
        } ),
        tandemName: `${massShape.tandemName}Item`
      };
    } ), listParent, {
      xMargin: 8,
      yMargin: 4,
      tandem: options.tandem.createTandem( 'shapeComboBox' )
    } );

    const numberControlOptions = {
      delta: 0.01,
      sliderOptions: {
        trackSize: new Dimension2( 120, 0.5 ),
        thumbSize: DensityBuoyancyCommonConstants.THUMB_SIZE
      },
      arrowButtonOptions: {
        scale: DensityBuoyancyCommonConstants.ARROW_BUTTON_SCALE
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

    const widthNumberControl = new NumberControl( DensityBuoyancyCommonStrings.widthStringProperty, widthRatioProperty, new Range( 0, 1 ), combineOptions<NumberControlOptions>( {
      tandem: options.tandem.createTandem( 'widthNumberControl' ),
      sliderOptions: {
        accessibleName: DensityBuoyancyCommonStrings.widthStringProperty
      }
    }, numberControlOptions ) );
    const heightNumberControl = new NumberControl( DensityBuoyancyCommonStrings.heightStringProperty, heightRatioProperty, new Range( 0, 1 ), combineOptions<NumberControlOptions>( {
      tandem: options.tandem.createTandem( 'heightNumberControl' ),
      sliderOptions: {
        accessibleName: DensityBuoyancyCommonStrings.heightStringProperty
      }
    }, numberControlOptions ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const litersProperty = new DerivedProperty( [ volumeProperty ], volume => {
      return volume * 1000;
    } );

    this.children = [
      // TODO: ensure maxWidth for combo box contents so this isn't an issue. How do we want to do layout? https://github.com/phetsims/density-buoyancy-common/issues/86
      new HBox( {
        spacing: 5,
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
          new NumberDisplay( litersProperty, new Range( 0, 10 ), { // TODO: is 10 the most? https://github.com/phetsims/density-buoyancy-common/issues/86
            valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
            useRichText: true,
            decimalPlaces: 2,
            textOptions: {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: widthNumberControl.width / 2
            }
          } )
        ]
      } )
    ];

    this.mutate( options );
  }
}

densityBuoyancyCommon.register( 'ShapeSizeControlNode', ShapeSizeControlNode );