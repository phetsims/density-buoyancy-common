// Copyright 2019-2020, University of Colorado Boulder

/**
 * Displays a bar-scale with interactive density labels above/below and named reference values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColorProfile from '../../common/view/DensityBuoyancyCommonColorProfile.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';

// constants
const materials = [
  Material.HUMAN,
  Material.GLASS,
  Material.TITANIUM,
  Material.STEEL,
  Material.COPPER
];
const WIDTH = 400;
const HEIGHT = 22;
const MAX_DENSITY = 10000;
const LINE_PADDING = 2;
const mvt = density => WIDTH * Math.min( density, MAX_DENSITY ) / MAX_DENSITY;
const MAX_LABEL_WIDTH = 80;

class DensityReadoutNode extends Node {

  /**
   * @param {Property.<number>} densityAProperty
   * @param {Property.<number>} densityBProperty
   * @param {Property.<boolean>} secondaryMassVisibleProperty
   */
  constructor( densityAProperty, densityBProperty, secondaryMassVisibleProperty ) {
    super();

    const background = new Rectangle( 0, 0, WIDTH, HEIGHT, {
      fill: 'white',
      stroke: 'black'
    } );
    this.addChild( background );

    // Include the width necessary for the labels
    background.localBounds = new Bounds2( 0, 0, WIDTH, HEIGHT ).dilatedX( MAX_LABEL_WIDTH / 2 );

    const lineOptions = { stroke: 'black' };
    materials.forEach( material => {
      const x = mvt( material.density );
      const label = new Text( material.name, {
        font: new PhetFont( 12 ),
        centerX: x,
        centerY: HEIGHT / 2,
        maxWidth: 160
      } );
      this.addChild( label );
      this.addChild( new Line( x, 0, x, label.top - LINE_PADDING, lineOptions ) );
      this.addChild( new Line( x, HEIGHT, x, label.bottom + LINE_PADDING, lineOptions ) );
    } );

    this.addChild( new Text( '0', {
      right: -10,
      centerY: background.centerY,
      font: new PhetFont( { size: 14, weight: 'bold' } )
    } ) );

    this.addChild( new Text( '10', {
      left: WIDTH + 10,
      centerY: background.centerY,
      font: new PhetFont( { size: 14, weight: 'bold' } )
    } ) );

    const arrowOptions = {
      headHeight: 4,
      headWidth: 5,
      tailWidth: 1,
      stroke: null
    };
    const labelOptions = {
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      maxWidth: MAX_LABEL_WIDTH
    };

    const primaryArrow = new ArrowNode( 0, -7, 0, 0, merge( {
      fill: DensityBuoyancyCommonColorProfile.labelAProperty
    }, arrowOptions ) );
    const primaryLabel = new Text( '', merge( {
      fill: DensityBuoyancyCommonColorProfile.labelAProperty
    }, labelOptions ) );
    const primaryMarker = new Node( {
      children: [
        primaryArrow,
        primaryLabel
      ]
    } );
    this.addChild( primaryMarker );

    const secondaryArrow = new ArrowNode( 0, 7, 0, 0, merge( {
      fill: DensityBuoyancyCommonColorProfile.labelBProperty
    }, arrowOptions ) );
    const secondaryLabel = new Text( '', merge( {
      fill: DensityBuoyancyCommonColorProfile.labelBProperty
    }, labelOptions ) );
    const secondaryMarker = new Node( {
      children: [
        secondaryArrow,
        secondaryLabel
      ],
      y: HEIGHT
    } );
    this.addChild( secondaryMarker );

    // Density links
    densityAProperty.link( density => {
      primaryMarker.x = mvt( density );
      primaryLabel.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPerLiterPattern, {
        value: Utils.toFixed( density / 1000, 2 )
      } );
      primaryLabel.centerBottom = primaryArrow.centerTop;
    } );
    densityBProperty.link( density => {
      secondaryMarker.x = mvt( density );
      secondaryLabel.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPerLiterPattern, {
        value: Utils.toFixed( density / 1000, 2 )
      } );
      secondaryLabel.centerTop = secondaryArrow.centerBottom;
    } );

    densityAProperty.link( density => {
      primaryMarker.visible = density < MAX_DENSITY + 1e-5; // Allow rounding error
    } );
    Property.multilink( [ secondaryMassVisibleProperty, densityBProperty ], ( visible, density ) => {
      secondaryMarker.visible = visible && density < MAX_DENSITY + 1e-5; // Allow rounding error
    } );
  }
}

densityBuoyancyCommon.register( 'DensityReadoutNode', DensityReadoutNode );
export default DensityReadoutNode;