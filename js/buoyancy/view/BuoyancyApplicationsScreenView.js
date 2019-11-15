// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const MaterialMassVolumeControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/MaterialMassVolumeControlNode' );
  const Panel = require( 'SUN/Panel' );

  class BuoyancyApplicationsScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {BuoyancyIntroModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem );

      if ( !this.enabled ) {
        return this;
      }

      // For clipping planes in BottleView
      this.sceneNode.stage.threeRenderer.localClippingEnabled = true;

      const bottleControl = new MaterialMassVolumeControlNode( model.bottle.interiorMaterialProperty, model.bottle.interiorMassProperty, model.bottle.interiorVolumeProperty, [
        Material.GASOLINE,
        Material.OIL,
        Material.WATER,
        Material.SAND,
        Material.CEMENT,
        Material.COPPER,
        Material.LEAD,
        Material.MERCURY
      ], volume => model.bottle.interiorVolumeProperty.set( volume ), this.popupLayer, {
        minMass: 0,
        maxCustomMass: 100,
        maxMass: Material.MERCURY.density * 0.01,

        // TODO: better units?
        minVolumeLiters: 0,
        maxVolumeLiters: 10
      } );

      this.addChild( new AlignBox( new Panel( bottleControl ), {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'bottom',
        xMargin: 10,
        yMargin: 60
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );
} );
