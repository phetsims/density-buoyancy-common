// Copyright 2019-2024, University of Colorado Boulder

/**
 * Panel content for showing/hiding various arrows/readouts.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import { Color, HBox, HSeparator, Text, TextOptions, VBox } from '../../../../scenery/js/imports.js';
import Checkbox, { CheckboxOptions } from '../../../../sun/js/Checkbox.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import { combineOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import RectangularButton from '../../../../sun/js/buttons/RectangularButton.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

// constants
const arrowSpacing = DensityBuoyancyCommonConstants.SPACING;
const arrowLength = 45;
const arrowOptions = {
  stroke: null,
  headWidth: 15,
  headHeight: 15,
  tailWidth: 4
};
const labelFont = new PhetFont( 14 );
const checkboxOptions = {
  boxWidth: 17,
  spacing: DensityBuoyancyCommonConstants.SPACING_SMALL
};
const checkboxSpacing = DensityBuoyancyCommonConstants.SPACING_SMALL;

type SelfOptions = {
  contentWidth?: number;
};

type BuoyancyDisplayOptionsPanelOptions = SelfOptions & WithRequired<PanelOptions, 'tandem'>;

export default class BuoyancyDisplayOptionsPanel extends Panel {
  public constructor( model: DensityBuoyancyModel, providedOptions: BuoyancyDisplayOptionsPanelOptions ) {

    const options = optionize4<BuoyancyDisplayOptionsPanelOptions, SelfOptions, PanelOptions>()( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, {
      contentWidth: 200
    }, providedOptions );

    const labelOptions = {
      font: labelFont,
      maxWidth: options.contentWidth - 3 * arrowSpacing - arrowLength - checkboxOptions.boxWidth - checkboxOptions.spacing - 2 * options.xMargin
    };

    const createForceControl = ( property: Property<boolean>, label: TReadOnlyProperty<string>, color: TReadOnlyProperty<Color>, tandemName: string ) => {
      const children = [
        new Text( label, labelOptions ),
        new ArrowNode( 0, 0, arrowLength, 0, combineOptions<ArrowNodeOptions>( {
          fill: color
        }, arrowOptions ) )
      ];
      return new Checkbox( property, new HBox( { children: children, spacing: 2 * arrowSpacing } ), combineOptions<CheckboxOptions>( {
        tandem: options.tandem.createTandem( tandemName ),
        containerTagName: 'p',
        accessibleName: label,
        boxWidth: 14,
        touchAreaYDilation: 2.2
      }, checkboxOptions ) );
    };

    const content = new VBox( {
      align: 'left',
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      children: [
        new Text( DensityBuoyancyCommonStrings.forcesStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: options.contentWidth - 2 * options.xMargin
        } ),
        new VBox( {
          spacing: checkboxSpacing,
          align: 'left',
          children: [
            new VBox( {
              spacing: checkboxSpacing,
              align: 'left',
              stretch: true,
              children: [
                // Gravity
                createForceControl( model.showGravityForceProperty, DensityBuoyancyCommonStrings.gravity.nameStringProperty, DensityBuoyancyCommonColors.gravityForceProperty, 'showGravityForceCheckbox' ),
                createForceControl( model.showBuoyancyForceProperty, DensityBuoyancyCommonStrings.buoyancyStringProperty, DensityBuoyancyCommonColors.buoyancyForceProperty, 'showBuoyancyForceCheckbox' ),
                createForceControl( model.showContactForceProperty, DensityBuoyancyCommonStrings.contactStringProperty, DensityBuoyancyCommonColors.contactForceProperty, 'showContactForceCheckbox' ),

                // Vector zoom
                new HBox( {
                  children: [
                    new Text( DensityBuoyancyCommonStrings.vectorZoomStringProperty, combineOptions<TextOptions>( {}, labelOptions ) ),
                    new PlusMinusZoomButtonGroup( model.vectorZoomProperty, {
                      spacing: 3, // Custom small spacing between the buttons
                      buttonOptions: {
                        cornerRadius: 3,
                        buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy,
                        stroke: 'black',
                        xMargin: 7,
                        yMargin: 7
                      },
                      applyZoomIn: ( scale: number ) => scale * 2,
                      applyZoomOut: ( scale: number ) => scale / 2,
                      tandem: options.tandem.createTandem( 'vectorZoomButtonGroup' )
                    } ) ]
                } ),

                new Checkbox( model.showForceValuesProperty, new Text( DensityBuoyancyCommonStrings.forceValuesStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  tandem: options.tandem.createTandem( 'showForceValuesCheckbox' ),
                  containerTagName: 'p',
                  accessibleName: DensityBuoyancyCommonStrings.forceValuesStringProperty
                }, checkboxOptions ) )
              ]
            } ),
            new HSeparator(),
            new VBox( {
              spacing: checkboxSpacing,
              align: 'left',
              children: [
                new Checkbox( model.showMassValuesProperty, new Text( DensityBuoyancyCommonStrings.massValuesStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  tandem: options.tandem.createTandem( 'showMassValuesCheckbox' ),
                  containerTagName: 'p',
                  accessibleName: DensityBuoyancyCommonStrings.massValuesStringProperty
                }, checkboxOptions ) ),
                ...( model.supportsDepthLines ?
                  [ new Checkbox( model.showDepthLinesProperty, new Text( DensityBuoyancyCommonStrings.depthLinesStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                    tandem: options.tandem.createTandem( 'showDepthLinesCheckbox' ),
                    containerTagName: 'p',
                    accessibleName: DensityBuoyancyCommonStrings.depthLinesStringProperty
                  }, checkboxOptions ) ) ] : [] )
              ]
            } )
          ]
        } )
      ]
    } );

    super( content, options );
  }
}

densityBuoyancyCommon.register( 'BuoyancyDisplayOptionsPanel', BuoyancyDisplayOptionsPanel );