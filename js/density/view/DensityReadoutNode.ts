// Copyright 2019-2022, University of Colorado Boulder

/**
 * Displays a bar-scale with interactive density labels above/below and named reference values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, ManualConstraint, Node, NodeOptions, Rectangle, Text, TextOptions } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

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

  public constructor( densityAProperty: TReadOnlyProperty<number>, densityBProperty: TReadOnlyProperty<number>, secondaryMassVisibleProperty: TReadOnlyProperty<boolean>, options?: NodeOptions ) {
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
      font: DensityBuoyancyCommonConstants.ITEM_FONT
    } ) );

    this.addChild( new Text( '10', {
      left: WIDTH + 10,
      centerY: background.centerY,
      font: DensityBuoyancyCommonConstants.ITEM_FONT
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

    const primaryArrow = new ArrowNode( 0, -7, 0, 0, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.labelAProperty
    }, arrowOptions ) );
    const primaryLabel = new Text( new DerivedProperty( [
      densityAProperty,
      densityBuoyancyCommonStrings.kilogramsPerLiterPatternProperty
    ], ( density, pattern ) => {
      return StringUtils.fillIn( pattern, {
        value: Utils.toFixed( density / 1000, 2 )
      } );
    } ), combineOptions<TextOptions>( {
      fill: DensityBuoyancyCommonColors.labelAProperty
    }, labelOptions ) );
    const primaryMarker = new Node( {
      children: [
        primaryArrow,
        primaryLabel
      ]
    } );
    this.addChild( primaryMarker );

    const secondaryArrow = new ArrowNode( 0, 7, 0, 0, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.labelBProperty
    }, arrowOptions ) );
    const secondaryLabel = new Text( new DerivedProperty( [
      densityBProperty,
      densityBuoyancyCommonStrings.kilogramsPerLiterPatternProperty
    ], ( density, pattern ) => {
      return StringUtils.fillIn( pattern, {
        value: Utils.toFixed( density / 1000, 2 )
      } );
    } ), combineOptions<TextOptions>( {
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
    } );
    ManualConstraint.create( this, [ primaryLabel, primaryArrow ], ( primaryLabelProxy, primaryArrowProxy ) => {
      primaryLabelProxy.centerBottom = primaryArrowProxy.centerTop;
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    densityBProperty.link( density => {
      secondaryMarker.x = mvt( density );
    } );
    ManualConstraint.create( this, [ secondaryLabel, secondaryArrow ], ( secondaryLabelProxy, secondaryArrowProxy ) => {
      secondaryLabelProxy.centerTop = secondaryArrowProxy.centerBottom;
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    densityAProperty.link( density => {
      primaryMarker.visible = density < MAX_DENSITY + 1e-5; // Allow rounding error
    } );
    Multilink.multilink( [ secondaryMassVisibleProperty, densityBProperty ], ( visible, density ) => {
      secondaryMarker.visible = visible && density < MAX_DENSITY + 1e-5; // Allow rounding error
    } );

    this.mutate( options );
  }
}

densityBuoyancyCommon.register( 'DensityReadoutNode', DensityReadoutNode );
