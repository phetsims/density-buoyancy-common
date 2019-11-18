// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const DebugEditNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DebugEditNode' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityControlNode' );
  const DisplayOptionsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DisplayOptionsNode' );
  const GravityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/GravityControlNode' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Panel = require( 'SUN/Panel' );

  // constants
  const MARGIN = 10;

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

  return densityBuoyancyCommon.register( 'Demo3DScreenView', Demo3DScreenView );
} );
