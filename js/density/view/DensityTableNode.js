// Copyright 2019-2021, University of Colorado Boulder

/**
 * A table of common densities shown for reference.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommonColorProfile from '../../common/view/densityBuoyancyCommonColorProfile.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';

// constants
const headerFont = new PhetFont( { size: 12, weight: 'bold' } );
const bodyFont = new PhetFont( { size: 12 } );
const materials = _.sortBy( [
  Material.WOOD,
  Material.GASOLINE,
  Material.APPLE,
  Material.ICE,
  Material.HUMAN,
  Material.WATER,
  Material.GLASS,
  Material.DIAMOND,
  Material.TITANIUM,
  Material.STEEL,
  Material.COPPER,
  Material.LEAD,
  Material.GOLD
], material => material.density );

class DensityTableNode extends Node {
  constructor() {
    super();

    const materialHeader = new Text( densityBuoyancyCommonStrings.material.name, { font: headerFont, maxWidth: 160 } );
    const densityHeader = new Text( densityBuoyancyCommonStrings.densityKgL, { font: headerFont, maxWidth: 160 } );

    const materialNodes = materials.map( material => new Text( material.name, {
      font: bodyFont,
      maxWidth: 200
    } ) );
    const densityNodes = materials.map( material => new Text( Utils.toFixed( material.density / 1000, 2 ), {
      font: bodyFont,
      maxWidth: 150
    } ) );

    const maxHeight = Math.max( ...materialNodes.concat( densityNodes ).map( node => node.height ) );
    const maxMaterialWidth = Math.max( materialHeader.width, ...materialNodes.map( node => node.width ) );
    const maxDensityWidth = Math.max( densityHeader.width, ...densityNodes.map( node => node.width ) );
    const sidePadding = 5;
    const topPadding = 2;
    const bottomPadding = 2;

    const cellHeight = maxHeight + topPadding + bottomPadding;
    const headerCellHeight = Math.max( materialHeader.height, densityHeader.height ) + topPadding + bottomPadding;
    const materialCellWidth = maxMaterialWidth + 2 * sidePadding;
    const densityCellWidth = maxDensityWidth + 2 * sidePadding;
    const fullWidth = materialCellWidth + densityCellWidth;
    const fullHeight = headerCellHeight + cellHeight * materials.length;

    const gridShape = new Shape();

    // top horizontal line
    gridShape.moveTo( 0, 0 ).lineTo( fullWidth, 0 );

    // vertical lines
    gridShape.moveTo( 0, 0 ).lineTo( 0, fullHeight );
    gridShape.moveTo( materialCellWidth, 0 ).lineTo( materialCellWidth, fullHeight );
    gridShape.moveTo( fullWidth, 0 ).lineTo( fullWidth, fullHeight );

    // horizontal grid lines
    _.range( 0, materials.length + 1 ).forEach( n => {
      const y = headerCellHeight + n * cellHeight;
      gridShape.moveTo( 0, y ).lineTo( fullWidth, y );
    } );

    const gridPath = new Path( gridShape, {
      stroke: 'black'
    } );

    // label positioning
    materialHeader.left = sidePadding;
    materialHeader.top = topPadding;
    densityHeader.left = materialCellWidth + sidePadding;
    densityHeader.top = topPadding;
    materialNodes.forEach( ( node, n ) => {
      node.left = sidePadding;
      node.top = topPadding + headerCellHeight + n * cellHeight;
    } );
    densityNodes.forEach( ( node, n ) => {
      node.left = materialCellWidth + sidePadding;
      node.top = topPadding + headerCellHeight + n * cellHeight;
    } );

    const defaultBackground = new Rectangle( 0, 0, fullWidth, fullHeight, {
      fill: 'white'
    } );
    const highlightBackground = new Rectangle( 0, 0, fullWidth, headerCellHeight, {
      fill: densityBuoyancyCommonColorProfile.chartHeaderProperty
    } );

    this.children = [
      defaultBackground,
      highlightBackground,
      gridPath,
      materialHeader,
      densityHeader,
      ...materialNodes,
      ...densityNodes
    ];
  }
}

densityBuoyancyCommon.register( 'DensityTableNode', DensityTableNode );
export default DensityTableNode;