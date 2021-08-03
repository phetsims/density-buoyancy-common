// Copyright 2019-2021, University of Colorado Boulder

/**
 * The view for a 3d demo screen, used for debugging
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
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

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    this.addChild( new Panel( new DisplayOptionsNode( model ), merge( {
      left: this.layoutBounds.left + MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) ) );

    this.addChild( new Panel( new DensityControlNode( model.liquidMaterialProperty, [
      Material.GASOLINE,
      Material.WATER,
      Material.SEAWATER,
      Material.HONEY,
      Material.MERCURY,
      Material.DENSITY_X,
      Material.DENSITY_Y
    ], this.popupLayer ), merge( {
      right: this.layoutBounds.centerX - MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) ) );

    this.addChild( new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer ), merge( {
      left: this.layoutBounds.centerX + MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) ) );

    this.addChild( new AlignBox( new Panel( new DebugEditNode( this.currentMassProperty, this.popupLayer ), DensityBuoyancyCommonConstants.PANEL_OPTIONS ), {
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