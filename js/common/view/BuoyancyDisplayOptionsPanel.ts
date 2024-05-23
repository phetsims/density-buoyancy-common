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
const arrowSpacing = 15;
const arrowLength = 60;
const arrowOptions = {
  stroke: null,
  headWidth: 15,
  headHeight: 15,
  tailWidth: 4
};
const labelFont = new PhetFont( 14 );
const checkboxOptions = {
  boxWidth: 17,
  spacing: 5
};
const checkboxSpacing = 5;

type SelfOptions = {
  includeVectorScaleControl?: boolean;
  contentWidth?: number;
};

type BuoyancyDisplayOptionsPanelOptions = SelfOptions & WithRequired<PanelOptions, 'tandem'>;

export default class BuoyancyDisplayOptionsPanel extends Panel {
  public constructor( model: DensityBuoyancyModel, providedOptions: BuoyancyDisplayOptionsPanelOptions ) {

    const options = optionize4<BuoyancyDisplayOptionsPanelOptions, SelfOptions, PanelOptions>()( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, {
      includeVectorScaleControl: true,
      contentWidth: 200
    }, providedOptions );

    const labelOptions = {
      font: labelFont,
      maxWidth: options.contentWidth - arrowSpacing - arrowLength - checkboxOptions.boxWidth - checkboxOptions.spacing - 2 * options.xMargin
    };

    const content = new VBox( {
      spacing: DensityBuoyancyCommonConstants.MARGIN,
      align: 'left',
      children: [
        new Text( DensityBuoyancyCommonStrings.forcesStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: options.contentWidth - 2 * options.xMargin
        } ),
        new VBox( {
          spacing: 8,
          align: 'left',
          children: [
            new GridBox( {
              xSpacing: arrowSpacing,
              ySpacing: checkboxSpacing,
              xAlign: 'left',
              children: [

                // Gravity
                new Checkbox( model.showGravityForceProperty, new Text( DensityBuoyancyCommonStrings.gravity.nameStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  layoutOptions: { column: 0, row: 0 },
                  tandem: options.tandem.createTandem( 'gravityCheckbox' ),
                  containerTagName: 'p',
                  accessibleName: DensityBuoyancyCommonStrings.gravity.nameStringProperty
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, combineOptions<ArrowNodeOptions>( {
                  layoutOptions: { column: 1, row: 0 },
                  fill: DensityBuoyancyCommonColors.gravityForceProperty
                }, arrowOptions ) ),

                // Buoyancy
                new Checkbox( model.showBuoyancyForceProperty, new Text( DensityBuoyancyCommonStrings.buoyancyStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  layoutOptions: { column: 0, row: 1 },
                  tandem: options.tandem.createTandem( 'buoyancyCheckbox' ),
                  containerTagName: 'p',
                  accessibleName: DensityBuoyancyCommonStrings.buoyancyStringProperty
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, combineOptions<ArrowNodeOptions>( {
                  layoutOptions: { column: 1, row: 1 },
                  fill: DensityBuoyancyCommonColors.buoyancyForceProperty
                }, arrowOptions ) ),

                // Contact
                new Checkbox( model.showContactForceProperty, new Text( DensityBuoyancyCommonStrings.contactStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  layoutOptions: { column: 0, row: 2 },
                  tandem: options.tandem.createTandem( 'contactCheckbox' ),
                  containerTagName: 'p',
                  accessibleName: DensityBuoyancyCommonStrings.contactStringProperty
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, combineOptions<ArrowNodeOptions>( {
                  layoutOptions: { column: 1, row: 2 },
                  fill: DensityBuoyancyCommonColors.contactForceProperty
                }, arrowOptions ) ),

                // Vector scale
                ...( options.includeVectorScaleControl ? [
                    new Text( DensityBuoyancyCommonStrings.vectorScaleStringProperty, combineOptions<TextOptions>( {
                      layoutOptions: { column: 0, row: 3 }
                    }, labelOptions ) ),
                    new PlusMinusZoomButtonGroup( model.forceScaleProperty, {
                      spacing: 3,
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
                      tandem: options.tandem.createTandem( 'vectorScaleZoomButtonGroup' )
                    } ) ] : []
                ),

                new Checkbox( model.showForceValuesProperty, new Text( DensityBuoyancyCommonStrings.forceValuesStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  tandem: options.tandem.createTandem( 'forcesCheckbox' ),
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
                  tandem: options.tandem.createTandem( 'massValuesCheckbox' ),
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