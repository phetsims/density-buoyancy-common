// Copyright 2019-2021, University of Colorado Boulder

/**
 * Panel content for showing/hiding various arrows/readouts.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { FlowBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import { VDivider } from '../../../../scenery/js/imports.js';
import { AlignBox } from '../../../../scenery/js/imports.js';
import { AlignGroup } from '../../../../scenery/js/imports.js';
import { HBox } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import { VBox } from '../../../../scenery/js/imports.js';
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

class DisplayOptionsNode extends VBox {
  constructor( model: DensityBuoyancyModel, options?: VBoxOptions ) {

    options = merge( {
      spacing: 10,
      align: 'left'
    }, options );

    const forceAlignGroup = new AlignGroup();

    const forcesText = new Text( densityBuoyancyCommonStrings.forces, {
      font: DensityBuoyancyCommonConstants.TITLE_FONT,
      maxWidth: maxWidth
    } );

    const gravityNode = new HBox( {
      spacing: arrowSpacing,
      children: [
        new AlignBox( new Checkbox( new Text( densityBuoyancyCommonStrings.gravity.name, labelOptions ), model.showGravityForceProperty, checkboxOptions ), {
          group: forceAlignGroup,
          xAlign: 'left'
        } ),
        new ArrowNode( 0, 0, arrowLength, 0, merge( {
          fill: DensityBuoyancyCommonColors.gravityForceProperty
        }, arrowOptions ) )
      ]
    } );

    const buoyancyNode = new HBox( {
      spacing: arrowSpacing,
      children: [
        new AlignBox( new Checkbox( new Text( densityBuoyancyCommonStrings.buoyancy, labelOptions ), model.showBuoyancyForceProperty, checkboxOptions ), {
          group: forceAlignGroup,
          xAlign: 'left'
        } ),
        new ArrowNode( 0, 0, arrowLength, 0, merge( {
          fill: DensityBuoyancyCommonColors.buoyancyForceProperty
        }, arrowOptions ) )
      ]
    } );

    const contactNode = new HBox( {
      spacing: arrowSpacing,
      children: [
        new AlignBox( new Checkbox( new Text( densityBuoyancyCommonStrings.contact, labelOptions ), model.showContactForceProperty, checkboxOptions ), {
          group: forceAlignGroup,
          xAlign: 'left'
        } ),
        new ArrowNode( 0, 0, arrowLength, 0, merge( {
          fill: DensityBuoyancyCommonColors.contactForceProperty
        }, arrowOptions ) )
      ]
    } );

    const massesNode = new Checkbox( new Text( densityBuoyancyCommonStrings.masses, labelOptions ), model.showMassesProperty, checkboxOptions );
    const forceValuesNode = new Checkbox( new Text( densityBuoyancyCommonStrings.forceValues, labelOptions ), model.showForceValuesProperty, checkboxOptions );

    options.children = [
      forcesText,
      new FlowBox( {
        orientation: 'vertical',
        spacing: 8,
        align: 'left',
        children: [
          new VBox( {
            spacing: checkboxSpacing,
            align: 'left',
            children: [
              gravityNode,
              buoyancyNode,
              contactNode
            ]
          } ),
          new VDivider(),
          new VBox( {
            spacing: checkboxSpacing,
            align: 'left',
            children: [
              massesNode,
              forceValuesNode
            ]
          } )
        ]
      } )
    ];

    super( options );
  }
}

densityBuoyancyCommon.register( 'DisplayOptionsNode', DisplayOptionsNode );
export default DisplayOptionsNode;