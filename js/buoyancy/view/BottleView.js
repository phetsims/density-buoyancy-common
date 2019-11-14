// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bottle = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Bottle' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );

  class BottleView extends MassView {
    /**
     * @param {Bottle} bottle
     * @param {Property.<number>} liquidYProperty
     */
    constructor( bottle, liquidYProperty ) {

      const primaryGeometry = Bottle.getPrimaryGeometry();
      // const capGeometry = Bottle.getCapGeometry();

      super( bottle, new THREE.Geometry() );

      const bottomClipPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
      const topClipPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );

      liquidYProperty.link( y => {
        bottomClipPlane.constant = y;
        topClipPlane.constant = -y;
      } );

      // this.add( new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
      //   color: 0xcccccc,
      //   clippingPlanes: [ bottomClipPlane ]
      // } ) ) );

      // this.add( new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
      //   color: 0x888888,
      //   clippingPlanes: [ topClipPlane ]
      // } ) ) );

      // Back top
      this.add( new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.BackSide,
        // depthWrite: false,
        clippingPlanes: [ topClipPlane ]
      } ), {
        renderOrder: 1
      } ) );

      // Back bottom
      this.add( new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.BackSide,
        // depthWrite: false,
        clippingPlanes: [ bottomClipPlane ]
      } ), {
        renderOrder: 2
      } ) );

      // Front top
      this.add( new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.FrontSide,
        // depthWrite: false,
        clippingPlanes: [ topClipPlane ]
      } ), {
        renderOrder: 3
      } ) );

      // Front bottom
      this.add( new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.FrontSide,
        // depthWrite: false,
        clippingPlanes: [ bottomClipPlane ]
      } ), {
        renderOrder: 4
      } ) );

      this.add( new THREE.Mesh( Bottle.getCapGeometry(), new THREE.MeshLambertMaterial( {
        color: 0xFF3333
      } ) ) );

      // @public {Bottle}
      this.bottle = bottle;
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'BottleView', BottleView );
} );
