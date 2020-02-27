// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import DebugEditNode from './DebugEditNode.js';
import DensityBuoyancyScreenView from './DensityBuoyancyScreenView.js';
import DensityControlNode from './DensityControlNode.js';
import DisplayOptionsNode from './DisplayOptionsNode.js';
import GravityControlNode from './GravityControlNode.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class Demo3DScreenView extends DensityBuoyancyScreenView {

  /**
   * @param {DensityBuoyancyModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem );

    if ( !this.enabled ) {
      return this;
    }

    this.addChild( new Panel( new DisplayOptionsNode( model ), {
      xMargin: 10,
      yMargin: 10,
      left: this.layoutBounds.left + MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    } ) );

    this.addChild( new Panel( new DensityControlNode( model.liquidMaterialProperty, [
      Material.AIR,
      Material.GASOLINE,
      Material.WATER,
      Material.SEAWATER,
      Material.HONEY,
      Material.MERCURY,
      Material.DENSITY_X,
      Material.DENSITY_Y
    ], this.popupLayer ), {
      xMargin: 10,
      yMargin: 10,
      right: this.layoutBounds.centerX - MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    } ) );

    this.addChild( new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer ), {
      xMargin: 10,
      yMargin: 10,
      left: this.layoutBounds.centerX + MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    } ) );

    this.addChild( new AlignBox( new Panel( new DebugEditNode( this.currentMassProperty, this.popupLayer ) ), {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'bottom',
      xMargin: 10,
      yMargin: 70
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'Demo3DScreenView', Demo3DScreenView );
export default Demo3DScreenView;