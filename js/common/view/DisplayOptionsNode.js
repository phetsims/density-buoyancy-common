// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import densityBuoyancyCommonStrings from '../../density-buoyancy-common-strings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColorProfile from './DensityBuoyancyCommonColorProfile.js';

const buoyancyString = densityBuoyancyCommonStrings.buoyancy;
const contactString = densityBuoyancyCommonStrings.contact;
const forcesString = densityBuoyancyCommonStrings.forces;
const forceValuesString = densityBuoyancyCommonStrings.forceValues;
const gravityNameString = densityBuoyancyCommonStrings.gravity.name;
const massesString = densityBuoyancyCommonStrings.masses;

// constants
const arrowSpacing = 15;
const maxWidth = 300;
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
const checkboxOptions = {};
const checkboxSpacing = 5;

class DisplayOptionsNode extends VBox {
  /**
   * @param {DensityBuoyancyModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      spacing: 10,
      align: 'left'
    }, options );

    const forceAlignGroup = new AlignGroup();

    const forcesText = new Text( forcesString, {
      font: DensityBuoyancyCommonConstants.TITLE_FONT,
      maxWidth: maxWidth
    } );

    const gravityNode = new HBox( {
      spacing: arrowSpacing,
      children: [
        new AlignBox( new Checkbox( new Text( gravityNameString, labelOptions ), model.showGravityForceProperty, checkboxOptions ), {
          group: forceAlignGroup,
          xAlign: 'left'
        } ),
        new ArrowNode( 0, 0, arrowLength, 0, merge( {
          fill: DensityBuoyancyCommonColorProfile.gravityForceProperty
        }, arrowOptions ) )
      ]
    } );

    const buoyancyNode = new HBox( {
      spacing: arrowSpacing,
      children: [
        new AlignBox( new Checkbox( new Text( buoyancyString, labelOptions ), model.showBuoyancyForceProperty, checkboxOptions ), {
          group: forceAlignGroup,
          xAlign: 'left'
        } ),
        new ArrowNode( 0, 0, arrowLength, 0, merge( {
          fill: DensityBuoyancyCommonColorProfile.buoyancyForceProperty
        }, arrowOptions ) )
      ]
    } );

    const contactNode = new HBox( {
      spacing: arrowSpacing,
      children: [
        new AlignBox( new Checkbox( new Text( contactString, labelOptions ), model.showContactForceProperty, checkboxOptions ), {
          group: forceAlignGroup,
          xAlign: 'left'
        } ),
        new ArrowNode( 0, 0, arrowLength, 0, merge( {
          fill: DensityBuoyancyCommonColorProfile.contactForceProperty
        }, arrowOptions ) )
      ]
    } );

    const massesNode = new Checkbox( new Text( massesString, labelOptions ), model.showMassesProperty, checkboxOptions );
    const forceValuesNode = new Checkbox( new Text( forceValuesString, labelOptions ), model.showForceValuesProperty, checkboxOptions );

    const separator = new Line( 0, 0, Math.max(
      forcesText.width,
      gravityNode.width,
      buoyancyNode.width,
      contactNode.width,
      massesNode.width,
      forceValuesNode.width
    ), 0, {
      stroke: 'gray'
    } );

    options.children = [
      forcesText,
      new VBox( {
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
          separator,
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