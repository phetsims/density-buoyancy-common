// Copyright 2024, University of Colorado Boulder

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import FluidDensityControlNode from '../../common/view/FluidDensityControlNode.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import { Node } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

/**
 * Panel that allows the user to adjust the fluid density.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class FluidDensityPanel extends Panel {
  public constructor( model: DensityBuoyancyModel, invisibleMaterials: Material[], popupLayer: Node, tandem: Tandem ) {
    const fluidMaterialProperty = model.pool.fluidMaterialProperty;
    const fluidDensityControlNode = new FluidDensityControlNode( fluidMaterialProperty, fluidMaterialProperty.availableValues,
      popupLayer, {
        invisibleMaterials: invisibleMaterials,

        // The ComboNumberControl masquerades as the parent Panel so that we can avoid unnecessary nesting in the tandem tree.
        // Hence this tandem is passed to children but deleted before the FluidDensityControlNode is itself instrumented.
        tandem: tandem
      } );
    super( fluidDensityControlNode, combineOptions<PanelOptions>( {
      tandem: tandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );
  }
}

densityBuoyancyCommon.register( 'FluidDensityPanel', FluidDensityPanel );