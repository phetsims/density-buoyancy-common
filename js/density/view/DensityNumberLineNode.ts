// Copyright 2019-2024, University of Colorado Boulder

/**
 * Displays a bar-scale with interactive density labels above/below and named reference values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, ManualConstraint, Node, NodeOptions, Rectangle, RichText, Text, TextOptions, TPaint } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export type DisplayDensity = {
  densityProperty: TReadOnlyProperty<number>;
  visibleProperty?: TReadOnlyProperty<boolean>;
  color?: TPaint;
};

type SelfOptions = {
  displayDensities: DisplayDensity[];
  materials?: Material[];
  materialsMaxWidths?: number[];
  width?: number;
  height?: number;
  maxDensity?: number;
  linePadding?: number;
  maxLabelWidth?: number;
};

const WIDTH = 400;
const HEIGHT = 22;
const MAX_DENSITY = 10000;

export type DensityNumberLineNodeOptions = SelfOptions & NodeOptions;

export default class DensityNumberLineNode extends Node {

  public constructor( providedOptions?: DensityNumberLineNodeOptions ) {

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
      maxLabelWidth: 80
    }, providedOptions );

    const modelViewTransform = ( density: number ) => {
      return options.width * Math.min( density, options.maxDensity ) / options.maxDensity;
    };

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
      const x = modelViewTransform( material.density );
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

    this.addChild( new Text( options.maxDensity / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER, {
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

    const createDensityStringProperty = ( densityProperty: TReadOnlyProperty<number> ) => new PatternStringProperty( DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY, {
      value: densityProperty
    }, {
      maps: {
        value: ( density: number ) => density / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
      },
      tandem: Tandem.OPT_OUT,
      decimalPlaces: 2
    } );

    options.displayDensities.forEach( ( { densityProperty, visibleProperty, color }, index ) => {

      const arrow = new ArrowNode( 0, index === 0 ? -7 : 7, 0, 0, combineOptions<ArrowNodeOptions>( {
        fill: color
      }, arrowOptions ) );

      const label = new RichText( createDensityStringProperty( densityProperty ), combineOptions<TextOptions>( {
        fill: color
      }, labelOptions ) );

      // Avoid infinite loops like https://github.com/phetsims/axon/issues/447 by applying the maxWidth to a different Node
      // than the one that is used for layout.
      const labelContainer = new Node( { children: [ label ] } );
      const marker = new Node( {
        children: [
          arrow,
          labelContainer
        ],
        y: index === 0 ? 0 : options.height
      } );
      this.addChild( marker );

      // Density links
      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      densityProperty.link( density => {
        marker.x = modelViewTransform( density );
        marker.visible = density < options.maxDensity + 1e-5; // Allow rounding error
      } );
      ManualConstraint.create( this, [ labelContainer, arrow ], ( labelContainerProxy, arrowProxy ) => {
        if ( index === 0 ) {
          labelContainerProxy.centerBottom = arrowProxy.centerTop;
        }
        else {
          labelContainerProxy.centerTop = arrowProxy.centerBottom;
        }
      } );

      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      visibleProperty && visibleProperty.link( visible => {
        marker.visible = visible;
      } );
    } );

    this.mutate( options );
  }
}

densityBuoyancyCommon.register( 'DensityNumberLineNode', DensityNumberLineNode );