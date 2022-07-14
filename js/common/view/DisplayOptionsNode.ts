// Copyright 2019-2022, University of Colorado Boulder

/**
 * Panel content for showing/hiding various arrows/readouts.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import { FlowBox, GridBox, Text, VBox, VBoxOptions, VDivider } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import DensityBuoyancyModel from '../model/DensityBuoyancyModel.js';

// constants
const arrowSpacing = 15;
const maxWidth = 200;
const arrowLength = 60;
const arrowOptions = {
  stroke: null,
  headWidth: 15,
  headHeight: 15,
  tailWidth: 4
};
const labelOptions = {
  font: new PhetFont( 14 ),
  maxWidth: maxWidth
};
const checkboxOptions = {
  boxWidth: 17
};
const checkboxSpacing = 5;

export default class DisplayOptionsNode extends VBox {
  public constructor( model: DensityBuoyancyModel, options?: VBoxOptions ) {

    super( merge( {
      spacing: 10,
      align: 'left',
      children: [
        new Text( densityBuoyancyCommonStrings.forces, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: maxWidth
        } ),
        new FlowBox( {
          orientation: 'vertical',
          spacing: 8,
          align: 'left',
          children: [
            new GridBox( {
              xSpacing: arrowSpacing,
              ySpacing: 10,
              xAlign: 'left',
              children: [

                // Gravity
                new Checkbox( model.showGravityForceProperty, new Text( densityBuoyancyCommonStrings.gravity.name, labelOptions ), merge( {
                  layoutOptions: { column: 0, row: 0 }
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, merge( {
                  layoutOptions: { column: 1, row: 0 },
                  fill: DensityBuoyancyCommonColors.gravityForceProperty
                }, arrowOptions ) ),

                // Buoyancy
                new Checkbox( model.showBuoyancyForceProperty, new Text( densityBuoyancyCommonStrings.buoyancy, labelOptions ), merge( {
                  layoutOptions: { column: 0, row: 1 }
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, merge( {
                  layoutOptions: { column: 1, row: 1 },
                  fill: DensityBuoyancyCommonColors.buoyancyForceProperty
                }, arrowOptions ) ),

                // Contact
                new Checkbox( model.showContactForceProperty, new Text( densityBuoyancyCommonStrings.contact, labelOptions ), merge( {
                  layoutOptions: { column: 0, row: 2 }
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, merge( {
                  layoutOptions: { column: 1, row: 2 },
                  fill: DensityBuoyancyCommonColors.contactForceProperty
                }, arrowOptions ) ),

                // Vector scale
                new Text( densityBuoyancyCommonStrings.vectorScale, merge( {
                  layoutOptions: { column: 0, row: 3 }
                }, labelOptions ) ),
                new PlusMinusZoomButtonGroup( model.forceScaleProperty, {
                  layoutOptions: { column: 1, row: 3, xAlign: 'center' },
                  orientation: 'horizontal',
                  applyZoomIn: ( scale: number ) => scale * 2,
                  applyZoomOut: ( scale: number ) => scale / 2
                } )
              ]
            } ),
            new VDivider(),
            new VBox( {
              spacing: checkboxSpacing,
              align: 'left',
              children: [
                new Checkbox( model.showMassesProperty, new Text( densityBuoyancyCommonStrings.masses, labelOptions ), checkboxOptions ),
                new Checkbox( model.showForceValuesProperty, new Text( densityBuoyancyCommonStrings.forceValues, labelOptions ), checkboxOptions )
              ]
            } )
          ]
        } )
      ]
    }, options ) );
  }
}

densityBuoyancyCommon.register( 'DisplayOptionsNode', DisplayOptionsNode );
