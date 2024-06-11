// Copyright 2019-2024, University of Colorado Boulder

/**
 * Panel content for showing/hiding various arrows/readouts.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import { GridBox, HSeparator, Text, TextOptions, VBox } from '../../../../scenery/js/imports.js';
import Checkbox, { CheckboxOptions } from '../../../../sun/js/Checkbox.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import DensityBuoyancyModel from '../model/DensityBuoyancyModel.js';
import { combineOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import RectangularButton from '../../../../sun/js/buttons/RectangularButton.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';

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
  includeVectorZoomControl?: boolean;
  contentWidth?: number;
};

type BuoyancyDisplayOptionsPanelOptions = SelfOptions & WithRequired<PanelOptions, 'tandem'>;

export default class BuoyancyDisplayOptionsPanel extends Panel {
  public constructor( model: DensityBuoyancyModel, providedOptions: BuoyancyDisplayOptionsPanelOptions ) {

    const options = optionize4<BuoyancyDisplayOptionsPanelOptions, SelfOptions, PanelOptions>()( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, {
      includeVectorZoomControl: true,
      contentWidth: 200
    }, providedOptions );

    const labelOptions = {
      font: labelFont,
      maxWidth: options.contentWidth - arrowSpacing - arrowLength - checkboxOptions.boxWidth - checkboxOptions.spacing - 2 * options.xMargin
    };

    const createForceControl = ( property: Property<boolean>, label: string, color: Color, row: number, tandemName: string ) => {
      return [
        new Checkbox( property, new Text( label, labelOptions ), combineOptions<CheckboxOptions>( {
          layoutOptions: { column: 0, row: row },
          tandem: options.tandem.createTandem( tandemName ),
          containerTagName: 'p',
          accessibleName: label
        }, checkboxOptions ) ),
        new ArrowNode( 0, 0, arrowLength, 0, combineOptions<ArrowNodeOptions>( {
          layoutOptions: { column: 1, row: row },
          fill: color
        }, arrowOptions ) )
      ];
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
          spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
          align: 'left',
          children: [
            new GridBox( {
              xSpacing: arrowSpacing,
              ySpacing: checkboxSpacing,
              xAlign: 'left',
              children: [

                // Gravity
                ...createForceControl( model.showGravityForceProperty, DensityBuoyancyCommonStrings.gravity.nameStringProperty, DensityBuoyancyCommonColors.gravityForceProperty, 0, 'showGravityForceCheckbox' ),
                ...createForceControl( model.showBuoyancyForceProperty, DensityBuoyancyCommonStrings.buoyancyStringProperty, DensityBuoyancyCommonColors.buoyancyForceProperty, 1, 'showBuoyancyForceCheckbox' ),
                ...createForceControl( model.showContactForceProperty, DensityBuoyancyCommonStrings.contactStringProperty, DensityBuoyancyCommonColors.contactForceProperty, 2, 'showContactForceCheckbox' ),

                // Vector zoom
                ...( options.includeVectorZoomControl ? [
                    new Text( DensityBuoyancyCommonStrings.vectorZoomStringProperty, combineOptions<TextOptions>( {
                      layoutOptions: { column: 0, row: 3 }
                    }, labelOptions ) ),
                    new PlusMinusZoomButtonGroup( model.vectorZoomProperty, {
                      spacing: 3, // Custom small spacing between the buttons
                      layoutOptions: { column: 1, row: 3, xAlign: 'center' },
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
                    } ) ] : []
                ),

                new Checkbox( model.showForceValuesProperty, new Text( DensityBuoyancyCommonStrings.forceValuesStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  tandem: options.tandem.createTandem( 'showForceValuesCheckbox' ),
                  layoutOptions: { column: 0, row: 4 },
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
                    tandem: options.tandem.createTandem( 'depthLinesCheckbox' ),
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
