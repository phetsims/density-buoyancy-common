// Copyright 2019-2022, University of Colorado Boulder

/**
 * A table of common densities shown for reference.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { GridBackgroundNode } from '../../../../scenery/js/imports.js';
import { GridBox } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';

// constants
const headerFont = new PhetFont( { size: 12, weight: 'bold' } );
const bodyFont = new PhetFont( { size: 12 } );
const materials = _.sortBy( DensityBuoyancyCommonConstants.DENSITY_MYSTERY_MATERIALS, material => material.density );

class DensityTableNode extends Node {
  constructor() {
    super();

    const layoutOptions = {
      xMargin: 5,
      yMargin: 2
    };

    const gridBox = new GridBox( {
      children: [
        new Text( densityBuoyancyCommonStrings.material.name, {
          font: headerFont,
          maxWidth: 160,
          layoutOptions: merge( { x: 0, y: 0, xAlign: 'left' }, layoutOptions )
        } ),
        new Text( densityBuoyancyCommonStrings.densityKgL, {
          font: headerFont,
          maxWidth: 160,
          layoutOptions: merge( { x: 1, y: 0, xAlign: 'right' }, layoutOptions )
        } ),
        ...materials.map( ( material, index ) => new Text( material.name, {
          font: bodyFont,
          maxWidth: 200,
          layoutOptions: merge( { x: 0, y: index + 1, xAlign: 'left' }, layoutOptions )
        } ) ),
        ...materials.map( ( material, index ) => new Text( Utils.toFixed( material.density / 1000, 2 ), {
          font: bodyFont,
          maxWidth: 150,
          layoutOptions: merge( { x: 1, y: index + 1, xAlign: 'right' }, layoutOptions )
        } ) )
      ]
    } );

    const gridBackground = new GridBackgroundNode( gridBox.constraint, {
      createCellBackground: cell => {
        return Rectangle.bounds( cell.lastAvailableBounds, {
          fill: cell.position.get( Orientation.VERTICAL ) === 0 ? DensityBuoyancyCommonColors.chartHeaderColorProperty : 'white',
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