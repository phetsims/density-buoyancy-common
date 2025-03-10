// Copyright 2019-2025, University of Colorado Boulder

/**
 * A table of common densities shown for reference.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import GridBackgroundNode from '../../../../scenery/js/layout/nodes/GridBackgroundNode.js';
import GridBox from '../../../../scenery/js/layout/nodes/GridBox.js';
import TLayoutOptions from '../../../../scenery/js/layout/TLayoutOptions.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';

// constants
const headerFont = new PhetFont( { size: 12, weight: 'bold' } );
const bodyFont = new PhetFont( { size: 12 } );
const materials = _.sortBy( Material.DENSITY_MYSTERY_SCREEN_MATERIALS, material => material.density );

export default class DensityTableNode extends Node {
  public constructor() {
    super();

    const layoutOptions = {
      xMargin: 5,
      yMargin: 2
    };

    const gridBox = new GridBox( {
      children: [
        new Text( DensityBuoyancyCommonStrings.material.nameStringProperty, {
          font: headerFont,
          maxWidth: 160,
          layoutOptions: combineOptions<TLayoutOptions>( { column: 0, row: 0, xAlign: 'left' }, layoutOptions )
        } ),

        new RichText( new DerivedProperty( [
          DensityBuoyancyCommonPreferences.volumeUnitsProperty,
          DensityBuoyancyCommonStrings.densityKgLStringProperty,
          DensityBuoyancyCommonStrings.densityKgdm3StringProperty
        ], ( units, litersString, decimetersCubedString ) => {
          return units === 'liters' ? litersString : decimetersCubedString;
        } ), {
          font: headerFont,
          maxWidth: 160,
          layoutOptions: combineOptions<TLayoutOptions>( { column: 1, row: 0, xAlign: 'right' }, layoutOptions )
        } ),
        ...materials.map( ( material, index ) => new Text( material.nameProperty, {
          font: bodyFont,
          maxWidth: 200,
          layoutOptions: combineOptions<TLayoutOptions>( { column: 0, row: index + 1, xAlign: 'left' }, layoutOptions )
        } ) ),
        ...materials.map( ( material, index ) => new Text( Utils.toFixed( material.density / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER, 2 ), {
          font: bodyFont,
          maxWidth: 150,
          layoutOptions: combineOptions<TLayoutOptions>( { column: 1, row: index + 1, xAlign: 'right' }, layoutOptions )
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