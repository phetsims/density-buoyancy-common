// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const BuoyancyShapesModel = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/BuoyancyShapesModel' );
  const ComboBox = require( 'SUN/ComboBox' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HSeparator = require( 'SUN/HSeparator' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const heightString = require( 'string!DENSITY_BUOYANCY_COMMON/height' );
  const litersPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/litersPattern' );
  const shapeBlockString = require( 'string!DENSITY_BUOYANCY_COMMON/shape.block' );
  const shapeConeString = require( 'string!DENSITY_BUOYANCY_COMMON/shape.cone' );
  const shapeEllipsoidString = require( 'string!DENSITY_BUOYANCY_COMMON/shape.ellipsoid' );
  const shapeHorizontalCylinderString = require( 'string!DENSITY_BUOYANCY_COMMON/shape.horizontalCylinder' );
  const shapeInvertedConeString = require( 'string!DENSITY_BUOYANCY_COMMON/shape.invertedCone' );
  const shapeVerticalCylinderString = require( 'string!DENSITY_BUOYANCY_COMMON/shape.verticalCylinder' );
  const volumeString = require( 'string!DENSITY_BUOYANCY_COMMON/volume' );
  const widthString = require( 'string!DENSITY_BUOYANCY_COMMON/width' );

  // constants
  const shapeStringMap = {
    [ BuoyancyShapesModel.MassShape.BLOCK ]: shapeBlockString,
    [ BuoyancyShapesModel.MassShape.ELLIPSOID ]: shapeEllipsoidString,
    [ BuoyancyShapesModel.MassShape.VERTICAL_CYLINDER ]: shapeVerticalCylinderString,
    [ BuoyancyShapesModel.MassShape.HORIZONTAL_CYLINDER ]: shapeHorizontalCylinderString,
    [ BuoyancyShapesModel.MassShape.CONE ]: shapeConeString,
    [ BuoyancyShapesModel.MassShape.INVERTED_CONE ]: shapeInvertedConeString
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
        return new ComboBoxItem( new Text( shapeStringMap[ massShape ], { font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT } ), massShape );
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
          font: DensityBuoyancyCommonConstants.READOUT_FONT
        },
        layoutFunction: NumberControl.createLayoutFunction4( {
          hasReadoutProperty: new BooleanProperty( false )
          // TODO: createBottomContent for custom? or no?
        } )
      };

      const widthNumberControl = new NumberControl( widthString, widthRatioProperty, new Range( 0, 1 ), numberControlOptions );
      const heightNumberControl = new NumberControl( heightString, heightRatioProperty, new Range( 0, 1 ), numberControlOptions );

      // TODO: ensure maxWidth for combo box contents so this isn't an issue. How do we want to do layout?
      const topRow = options.labelNode ? new HBox( {
        children: [
          comboBox,
          options.labelNode
        ],
        spacing: 5
      } ) : comboBox;

      const volumeLabel = new Text( volumeString, { font: new PhetFont( 12 ) } );

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
              valuePattern: StringUtils.fillIn( litersPatternString, {
                liters: '{{value}}'
              } ),
              decimalPlaces: 2,
              font: DensityBuoyancyCommonConstants.READOUT_FONT
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

  return densityBuoyancyCommon.register( 'ShapeSizeControlNode', ShapeSizeControlNode );
} );
