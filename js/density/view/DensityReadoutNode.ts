// Copyright 2019-2022, University of Colorado Boulder

/**
 * Displays a bar-scale with interactive density labels above/below and named reference values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, NodeOptions } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
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
// We need different maxWidths for each, since some are closer to others
const materialsMaxWidths = [
  70, 70, 70, 45, 45
];
const WIDTH = 400;
const HEIGHT = 22;
const MAX_DENSITY = 10000;
const LINE_PADDING = 2;
const mvt = ( density: number ) => WIDTH * Math.min( density, MAX_DENSITY ) / MAX_DENSITY;
const MAX_LABEL_WIDTH = 80;

export default class DensityReadoutNode extends Node {

  constructor( densityAProperty: IReadOnlyProperty<number>, densityBProperty: IReadOnlyProperty<number>, secondaryMassVisibleProperty: IReadOnlyProperty<boolean>, options?: NodeOptions ) {
    super();

    const background = new Rectangle( 0, 0, WIDTH, HEIGHT, {
      fill: 'white',
      stroke: 'black'
    } );
    this.addChild( background );

    // Include the width necessary for the labels
    background.localBounds = new Bounds2( 0, 0, WIDTH, HEIGHT ).dilatedX( MAX_LABEL_WIDTH / 2 );

    const lineOptions = { stroke: 'black' };
    materials.forEach( ( material, index ) => {
      const x = mvt( material.density );
      const label = new Text( material.name, {
        font: new PhetFont( 12 ),
        centerX: x,
        centerY: HEIGHT / 2,
        maxWidth: materialsMaxWidths[ index ]
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
      fill: DensityBuoyancyCommonColors.labelAProperty
    }, arrowOptions ) );
    const primaryLabel = new Text( '', merge( {
      fill: DensityBuoyancyCommonColors.labelAProperty
    }, labelOptions ) );
    const primaryMarker = new Node( {
      children: [
        primaryArrow,
        primaryLabel
      ]
    } );
    this.addChild( primaryMarker );

    const secondaryArrow = new ArrowNode( 0, 7, 0, 0, merge( {
      fill: DensityBuoyancyCommonColors.labelBProperty
    }, arrowOptions ) );
    const secondaryLabel = new Text( '', merge( {
      fill: DensityBuoyancyCommonColors.labelBProperty
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
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    densityAProperty.link( density => {
      primaryMarker.x = mvt( density );
      primaryLabel.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPerLiterPattern, {
        value: Utils.toFixed( density / 1000, 2 )
      } );
      primaryLabel.centerBottom = primaryArrow.centerTop;
    } );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    densityBProperty.link( density => {
      secondaryMarker.x = mvt( density );
      secondaryLabel.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPerLiterPattern, {
        value: Utils.toFixed( density / 1000, 2 )
      } );
      secondaryLabel.centerTop = secondaryArrow.centerBottom;
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    densityAProperty.link( density => {
      primaryMarker.visible = density < MAX_DENSITY + 1e-5; // Allow rounding error
    } );
    Property.multilink( [ secondaryMassVisibleProperty, densityBProperty ], ( visible, density ) => {
      secondaryMarker.visible = visible && density < MAX_DENSITY + 1e-5; // Allow rounding error
    } );

    this.mutate( options );
  }
}

densityBuoyancyCommon.register( 'DensityReadoutNode', DensityReadoutNode );
