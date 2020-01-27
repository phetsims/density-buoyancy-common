// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Boat = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Boat' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );

  class BoatView extends MassView {
    /**
     * @param {Boat} boat
     * @param {Property.<number>} liquidYProperty
     */
    constructor( boat, liquidYProperty ) {

      super( boat, new THREE.Geometry() );

      const boatOneLiterGeometry = Boat.getPrimaryGeometry( 1 );

      const boatGroup = new THREE.Group();
      this.add( boatGroup );

      boat.displacementVolumeProperty.link( volume => {
        const scale = Math.pow( volume / 0.001, 1 / 3 );
        boatGroup.scale.x = scale;
        boatGroup.scale.y = scale;
        boatGroup.scale.z = scale;
      } );

      const backMaterial = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false
      } );
      const back = new THREE.Mesh( boatOneLiterGeometry, backMaterial );
      boatGroup.add( back );

      const frontMaterial = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false
      } );
      const front = new THREE.Mesh( boatOneLiterGeometry, frontMaterial );
      boatGroup.add( front );

      const frontForDepth = new THREE.Mesh( boatOneLiterGeometry, new THREE.MeshPhongMaterial( {
        color: 0xFF0000,
        opacity: 0,
        transparent: true,
        side: THREE.FrontSide
      } ) );
      boatGroup.add( frontForDepth );

      // @public {Boat}
      this.boat = boat;
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      // TODO: hook up disposal

      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'BoatView', BoatView );
} );
