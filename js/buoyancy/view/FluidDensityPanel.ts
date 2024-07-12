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
 * TODO: Delete this file and move it into the FluidDensityControlNode, https://github.com/phetsims/density-buoyancy-common/issues/256
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class FluidDensityPanel extends Panel {
  public constructor( model: DensityBuoyancyModel, customMaterial: Material, invisibleMaterials: Material[], popupLayer: Node, tandem: Tandem ) {
    const fluidDensityControlNode = new FluidDensityControlNode( model.pool.fluidMaterialProperty, [
        ...Material.BUOYANCY_FLUID_MATERIALS,
        customMaterial,
        ...Material.BUOYANCY_FLUID_MYSTERY_MATERIALS
      ], customMaterial,
      popupLayer, {
        invisibleMaterials: invisibleMaterials,
        tandem: tandem
      } );
    super( fluidDensityControlNode, combineOptions<PanelOptions>( { tandem: tandem }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );
  }
}

densityBuoyancyCommon.register( 'FluidDensityPanel', FluidDensityPanel );