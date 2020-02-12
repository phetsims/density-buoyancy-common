// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const densityKgLString = require( 'string!DENSITY_BUOYANCY_COMMON/densityKgL' );
  const materialString = require( 'string!DENSITY_BUOYANCY_COMMON/material' );

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

      const materialHeader = new Text( materialString, { font: headerFont } );
      const densityHeader = new Text( densityKgLString, { font: headerFont } );

      const materialNodes = materials.map( material => new Text( material.name, {
        font: bodyFont,
        maxWidth: 200
      } ) );
      const densityNodes = materials.map( material => new Text( ( material.density / 1000 ).toFixed( 2 ), {
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

      const highlightBackground = new Rectangle( 0, 0, fullWidth, headerCellHeight, {
        fill: DensityBuoyancyCommonColorProfile.chartHeaderProperty
      } );

      this.children = [
        highlightBackground,
        gridPath,
        materialHeader,
        densityHeader,
        ...materialNodes,
        ...densityNodes
      ];
    }
  }

  return densityBuoyancyCommon.register( 'DensityTableNode', DensityTableNode );
} );
