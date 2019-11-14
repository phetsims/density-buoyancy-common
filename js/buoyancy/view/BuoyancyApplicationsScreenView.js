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
  const DensityMaterials = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityMaterials' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );

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

      // const offsetMaterial = new THREE.MeshLambertMaterial( {
      //   color: 0xcccccc,
      //   polygonOffset: true,
      //   polygonOffsetFactor: 1,
      //   polygonOffsetUnits: 1,
      //   // opacity: 0.5,
      //   // transparent: true,
      //   // side: THREE.DoubleSide,
      //   // depthWrite: false
      // } );

      // const bottleMaterialView = DensityMaterials.getBottleMaterialView();
      const bottleMaterialView = DensityMaterials.getMaterialView( Material.ICE );
      bottleMaterialView.update( {
        visible: true,
        position: new THREE.Vector3( 0, 0, 0 )
      }, this.sceneNode.stage.threeScene, this.sceneNode.stage.threeRenderer );

      const group = new THREE.Group();

      const bottleGeometry = Bottle.getPrimaryGeometry();

      // group.add( new THREE.Mesh( bottleGeometry, offsetMaterial ) );


      group.add( new THREE.Mesh( bottleGeometry, new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        opacity: 0.4,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false
      } ), {
        renderOrder: 1
      } ) );
      group.add( new THREE.Mesh( bottleGeometry, new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        opacity: 0.4,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false
      } ), {
        renderOrder: 2
      } ) );

      group.add( new THREE.Mesh( Bottle.getCapGeometry(), new THREE.MeshLambertMaterial( {
        color: 0xFF3333
      } ) ) );

      // group.add( new THREE.LineSegments( new THREE.EdgesGeometry( bottleGeometry ), new THREE.LineBasicMaterial( {
      //   color: 0x000000,
      //   lineWidth: 2
      // } ) ) );

      // group.position.x = -0.4;
      // group.scale.x = 2;
      // group.scale.y = 2;
      // group.scale.z = 2;
      // group.rotation.y = -Math.PI / 4;
      this.sceneNode.stage.threeScene.add( group );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyApplicationsScreenView', BuoyancyApplicationsScreenView );
} );
