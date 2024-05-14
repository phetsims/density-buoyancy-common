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
import { HBox, Line, ManualConstraint, Node, NodeOptions, Rectangle, RichText, Text, TextOptions, TPaint, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';

// Type declarations: DisplayDensity is the object which will construct the marker and the legend
export type DisplayDensity = {
  densityProperty: TReadOnlyProperty<number>;
  nameProperty: TReadOnlyProperty<string>;
  visibleProperty: TReadOnlyProperty<boolean>;
  isHiddenProperty: TReadOnlyProperty<boolean>;
  color: TPaint;
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
  showNumericValue?: boolean;
};

// Constants and Functions
const WIDTH = 540;
const HEIGHT = 22;
const MAX_DENSITY = 10000;

// To display name: xxx kg/L dynamically
const createDensityStringProperty = (
  densityNumberProperty: TReadOnlyProperty<number>,
  nameStringProperty: TReadOnlyProperty<string>,
  isHiddenProperty: TReadOnlyProperty<boolean> ) => {
  // This is densityProperty kg/L (units depending on preferences)
  const valueUnitsStringProperty = new PatternStringProperty( DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY, {
    value: densityNumberProperty
  }, {
    maps: {
      value: ( density: number ) => density / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
    },
    tandem: Tandem.OPT_OUT,
    decimalPlaces: 2
  } );

  // This is name: valueUnitsStringProperty
  const nameColonValueStringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.nameColonValueUnitsPatternStringProperty, {
    name: nameStringProperty,
    valueWithUnits: new DerivedProperty(
      [ isHiddenProperty, DensityBuoyancyCommonStrings.questionMarkStringProperty, valueUnitsStringProperty ],
      ( isHidden, questionMark, valueUnitsString ) => {
      return isHidden ? questionMark : valueUnitsString;
    } )
  } );

  return nameColonValueStringProperty;
};

const arrowOptions = {
  headHeight: 12,
  headWidth: 15,
  tailWidth: 3,
  stroke: null
};

const createArrow = ( index: number, color: TPaint ) => {
  return new ArrowNode( 0, index === 0 ? -7 : 7, 0, 0, combineOptions<ArrowNodeOptions>( {
    fill: color
  }, arrowOptions ) );
};

export type DensityNumberLineNodeOptions = SelfOptions & NodeOptions;

export default class DensityNumberLineNode extends Node {

  private readonly modelViewTransform: ( density: number ) => number;

  private markerNodes: Node[] = [];

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
      maxLabelWidth: 80,
      showNumericValue: true
    }, providedOptions );

    super();

    this.modelViewTransform = ( density: number ) => {
      return options.width * Math.min( density, options.maxDensity ) / options.maxDensity;
    };

    const background = new Rectangle( 0, 0, options.width, options.height, {
      fill: 'white',
      stroke: 'black'
    } );
    this.addChild( background );

    // Include the width necessary for the labels
    background.localBounds = new Bounds2( 0, 0, options.width, options.height ).dilatedX( options.maxLabelWidth / 2 );

    const lineOptions = { stroke: 'black' };
    options.materials.forEach( ( material, index ) => {
      const x = this.modelViewTransform( material.density );
      const label = new Text( material.nameProperty, {
        font: new PhetFont( 12 ),
        maxWidth: index < options.materialsMaxWidths.length ? options.materialsMaxWidths[ index ] : 70
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

    this.createContents( options );

    this.markerNodes.forEach( markerNode => this.addChild( markerNode ) );

    this.mutate( options );
  }

  public createContents( options: DensityNumberLineNodeOptions ): void {

    const labelOptions = {
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      maxWidth: options.maxLabelWidth
    };

    const markerNodes: Node[] = [];

    options.displayDensities.forEach( (
      {
        densityProperty,
        nameProperty,
        visibleProperty,
        isHiddenProperty,
        color
      }, index ) => {

      const arrow = createArrow( index, color );

      const densityStringProperty = options.showNumericValue ? createDensityStringProperty( densityProperty, nameProperty, isHiddenProperty ) : nameProperty;

      const label = new RichText( densityStringProperty, combineOptions<TextOptions>( {
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
      markerNodes.push( marker );

      ManualConstraint.create( this, [ labelContainer, arrow ], ( labelContainerProxy, arrowProxy ) => {
        if ( index === 0 ) {
          labelContainerProxy.centerBottom = arrowProxy.centerTop;
        }
        else {
          labelContainerProxy.centerTop = arrowProxy.centerBottom;
        }
      } );

      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      Multilink.multilink( [
        densityProperty,
        visibleProperty,
        isHiddenProperty
      ], ( density, isVisible, isHidden ) => {
        marker.x = this.modelViewTransform( density );
        marker.visible = isVisible && !isHidden && density < options.maxDensity! + 1e-5;
      } );
    } );

    this.markerNodes = markerNodes;
  }
}

export class DensityNumberLineLegend extends VBox {
  public constructor( displayDensities: DisplayDensity[] ) {

    const legendChildren: Node[][] = [];

    const legendVisibilities: TReadOnlyProperty<boolean>[] = [];

    displayDensities.forEach( (
      {
        densityProperty,
        nameProperty,
        visibleProperty,
        isHiddenProperty,
        color
      }, index ) => {

      legendChildren.push( [
        createArrow( index, color ),
        new RichText( createDensityStringProperty( densityProperty, nameProperty, isHiddenProperty ), {
          font: new PhetFont( 16 ),
          maxWidth: 110
        } )
      ] );

      legendVisibilities.push( visibleProperty );
    } );

    super( {
      children: legendChildren.map( ( children, index ) => new HBox(
        { children: children, spacing: 5, visibleProperty: legendVisibilities[ index ] } ) ),
      spacing: 5,
      align: 'left'
    } );
  }
}

densityBuoyancyCommon.register( 'DensityNumberLineNode', DensityNumberLineNode );