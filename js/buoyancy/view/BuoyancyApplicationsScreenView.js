// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bottle = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Bottle' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );

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

      window.Bottle = Bottle;

      const mainBottleMesh = new THREE.Mesh( Bottle.getPrimaryGeometry(), new THREE.MeshLambertMaterial( {
        color: 0xCCCCCC
      } ) );
      mainBottleMesh.add( new THREE.Mesh( Bottle.getCapGeometry(), new THREE.MeshLambertMaterial( {
        color: 0xFF3333
      } ) ) );
      mainBottleMesh.position.x = -0.4;
      mainBottleMesh.scale.x = 2;
      mainBottleMesh.scale.y = 2;
      mainBottleMesh.scale.z = 2;
      this.sceneNode.stage.threeScene.add( mainBottleMesh );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );
} );
