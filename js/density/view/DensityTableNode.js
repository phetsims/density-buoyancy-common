// Copyright 2019-2021, University of Colorado Boulder

/**
 * A table of common densities shown for reference.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import GridBackgroundNode from '../../../../scenery/js/layout/GridBackgroundNode.js';
import GridBox from '../../../../scenery/js/layout/GridBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
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

    const layoutOptions = {
      xMargin: 5,
      yMargin: 2,
      xAlign: 'left'
    };

    const gridBox = new GridBox( {
      children: [
        new Text( densityBuoyancyCommonStrings.material.name, {
          font: headerFont,
          maxWidth: 160,
          layoutOptions: merge( { x: 0, y: 0 }, layoutOptions )
        } ),
        new Text( densityBuoyancyCommonStrings.densityKgL, {
          font: headerFont,
          maxWidth: 160,
          layoutOptions: merge( { x: 1, y: 0 }, layoutOptions )
        } ),
        ...materials.map( ( material, index ) => new Text( material.name, {
          font: bodyFont,
          maxWidth: 200,
          layoutOptions: merge( { x: 0, y: index + 1 }, layoutOptions )
        } ) ),
        ...materials.map( ( material, index ) => new Text( Utils.toFixed( material.density / 1000, 2 ), {
          font: bodyFont,
          maxWidth: 150,
          layoutOptions: merge( { x: 1, y: index + 1 }, layoutOptions )
        } ) )
      ]
    } );

    const gridBackground = new GridBackgroundNode( gridBox.constraint, {
      createCellBackground: cell => {
        return Rectangle.bounds( cell.lastAvailableBounds, {
          fill: cell.position.vertical === 0 ? DensityBuoyancyCommonColors.chartHeaderColorProperty : 'white',
          stroke: 'black'
        } );
      }
    } );

    this.children = [
      gridBackground,
      gridBox
    ];
  }
}

densityBuoyancyCommon.register( 'DensityTableNode', DensityTableNode );
export default DensityTableNode;