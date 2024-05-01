// Copyright 2019-2024, University of Colorado Boulder

/**
 * Displays a bar-scale with interactive density labels above/below and named reference values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, ManualConstraint, Node, NodeOptions, Rectangle, RichText, Text, TextOptions } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';

type SelfOptions = {
  materials?: Material[];
  materialsMaxWidths?: number[];
  width?: number;
  height?: number;
  maxDensity?: number;
  linePadding?: number;
  mvt?: ( density: number ) => number;
  maxLabelWidth?: number;
};

const WIDTH = 400;
const HEIGHT = 22;
const MAX_DENSITY = 10000;

type DensityNumberLineNodeOptions = SelfOptions & NodeOptions;

export default class DensityNumberLineNode extends Node {

  public constructor( densityAProperty: TReadOnlyProperty<number>, densityBProperty: TReadOnlyProperty<number>,
                      secondaryMassVisibleProperty: TReadOnlyProperty<boolean>, providedOptions?: DensityNumberLineNodeOptions ) {

    const options = optionize<DensityNumberLineNodeOptions, SelfOptions, NodeOptions>()( {
      materials: [
        Material.HUMAN,
        Material.GLASS,
        Material.TITANIUM,
        Material.STEEL,
        Material.COPPER
      ],
      // We need different maxWidths for each, since some are closer to others
      materialsMaxWidths: [
        70, 70, 70, 45, 45
      ],
      width: WIDTH,
      height: HEIGHT,
      maxDensity: MAX_DENSITY,
      linePadding: 2,
      mvt: ( density: number ) => WIDTH * Math.min( density, MAX_DENSITY ) / MAX_DENSITY,
      maxLabelWidth: 80
    }, providedOptions );

    super();

    const background = new Rectangle( 0, 0, options.width, options.height, {
      fill: 'white',
      stroke: 'black'
    } );
    this.addChild( background );

    // Include the width necessary for the labels
    background.localBounds = new Bounds2( 0, 0, options.width, options.height ).dilatedX( options.maxLabelWidth / 2 );

    const lineOptions = { stroke: 'black' };
    options.materials.forEach( ( material, index ) => {
      const x = options.mvt( material.density );
      const label = new Text( material.nameProperty, {
        font: new PhetFont( 12 ),
        maxWidth: options.materialsMaxWidths[ index ]
      } );

      // Avoid infinite loops like https://github.com/phetsims/axon/issues/447 by applying the maxWidth to a different Node
      // than the one that is used for layout.
      const labelContainer = new Node( { children: [ label ] } );
      ManualConstraint.create( this, [ labelContainer ], labelContainerProxy => {
        labelContainerProxy.centerX = x;
        labelContainerProxy.centerY = options.height / 2;
      } );
      this.addChild( labelContainer );
      this.addChild( new Line( x, 0, x, labelContainer.top - options.linePadding, lineOptions ) );
      this.addChild( new Line( x, options.height, x, labelContainer.bottom + options.linePadding, lineOptions ) );
    } );

    this.addChild( new Text( '0', {
      right: -10,
      centerY: background.centerY,
      font: DensityBuoyancyCommonConstants.ITEM_FONT
    } ) );

    this.addChild( new Text( '10', {
      left: options.width + 10,
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
      maxWidth: options.maxLabelWidth
    };

    const primaryArrow = new ArrowNode( 0, -7, 0, 0, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.labelPrimaryProperty
    }, arrowOptions ) );

    const createDensityStringProperty = ( densityProperty: TReadOnlyProperty<number> ) => new PatternStringProperty( DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY, {
      value: densityProperty
    }, {
      maps: {
        value: ( density: number ) => density / 1000
      },
      tandem: Tandem.OPT_OUT,
      decimalPlaces: 2
    } );

    const primaryLabel = new RichText( createDensityStringProperty( densityAProperty ), combineOptions<TextOptions>( {
      fill: DensityBuoyancyCommonColors.labelPrimaryProperty
    }, labelOptions ) );

    // Avoid infinite loops like https://github.com/phetsims/axon/issues/447 by applying the maxWidth to a different Node
    // than the one that is used for layout.
    const primaryLabelContainer = new Node( { children: [ primaryLabel ] } );
    const primaryMarker = new Node( {
      children: [
        primaryArrow,
        primaryLabelContainer
      ]
    } );
    this.addChild( primaryMarker );

    const secondaryArrow = new ArrowNode( 0, 7, 0, 0, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.labelSecondaryProperty
    }, arrowOptions ) );
    const secondaryLabel = new RichText( createDensityStringProperty( densityBProperty ), combineOptions<TextOptions>( {
      fill: DensityBuoyancyCommonColors.labelSecondaryProperty
    }, labelOptions ) );

    // Avoid infinite loops like https://github.com/phetsims/axon/issues/447 by applying the maxWidth to a different Node
    // than the one that is used for layout.
    const secondaryLabelContainer = new Node( { children: [ secondaryLabel ] } );
    const secondaryMarker = new Node( {
      children: [
        secondaryArrow,
        secondaryLabelContainer
      ],
      y: options.height
    } );
    this.addChild( secondaryMarker );

    // Density links
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    densityAProperty.link( density => {
      primaryMarker.x = options.mvt( density );
    } );
    ManualConstraint.create( this, [ primaryLabelContainer, primaryArrow ], ( primaryLabelContainerProxy, primaryArrowProxy ) => {
      primaryLabelContainerProxy.centerBottom = primaryArrowProxy.centerTop;
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    densityBProperty.link( density => {
      secondaryMarker.x = options.mvt( density );
    } );
    ManualConstraint.create( this, [ secondaryLabelContainer, secondaryArrow ], ( secondaryLabelContainerProxy, secondaryArrowProxy ) => {
      secondaryLabelContainerProxy.centerTop = secondaryArrowProxy.centerBottom;
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

densityBuoyancyCommon.register( 'DensityNumberLineNode', DensityNumberLineNode );