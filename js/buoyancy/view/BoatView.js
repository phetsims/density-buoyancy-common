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
      const boatMesh = new THREE.Mesh( boatOneLiterGeometry, new THREE.MeshLambertMaterial( {
        // side: THREE.DoubleSide,
        color: 0xffaa44
      } ) );
      this.add( boatMesh );

      boat.displacementVolumeProperty.link( volume => {
        const scale = Math.pow( volume / 0.001, 1 / 3 );
        boatMesh.scale.x = scale;
        boatMesh.scale.y = scale;
        boatMesh.scale.z = scale;
      } );

      // const bottomClipPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
      // const topClipPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );

      // const backTopMaterial = new THREE.MeshPhongMaterial( {
      //   color: 0xffffff,
      //   opacity: 0.4,
      //   transparent: true,
      //   side: THREE.BackSide,
      //   depthWrite: false,
      //   clippingPlanes: [ topClipPlane ]
      // } );
      // const backTop = new THREE.Mesh( primaryGeometry, backTopMaterial );
      // this.add( backTop );

      // const backBottomMaterial = new THREE.MeshPhongMaterial( {
      //   color: 0x33FF33,
      //   opacity: 0.8,
      //   transparent: true,
      //   side: THREE.BackSide,
      //   depthWrite: false,
      //   clippingPlanes: [ bottomClipPlane ]
      // } );
      // const backBottom = new THREE.Mesh( primaryGeometry, backBottomMaterial );
      // this.add( backBottom );

      // const frontTopMaterial = new THREE.MeshPhongMaterial( {
      //   color: 0xffffff,
      //   opacity: 0.4,
      //   transparent: true,
      //   side: THREE.FrontSide,
      //   depthWrite: false,
      //   clippingPlanes: [ topClipPlane ]
      // } );
      // const frontTop = new THREE.Mesh( primaryGeometry, frontTopMaterial );
      // this.add( frontTop );

      // const frontBottomMaterial = new THREE.MeshPhongMaterial( {
      //   color: 0x33FF33,
      //   opacity: 0.8,
      //   transparent: true,
      //   side: THREE.FrontSide,
      //   // depthWrite: false, // TODO: hmmm?
      //   clippingPlanes: [ bottomClipPlane ]
      // } );
      // const frontBottom = new THREE.Mesh( primaryGeometry, frontBottomMaterial );
      // this.add( frontBottom );

      // // TODO: optimize
      // const frontBottomForDepth = new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
      //   color: 0xFF0000,
      //   opacity: 0,
      //   transparent: true,
      //   side: THREE.FrontSide,
      //   clippingPlanes: [ bottomClipPlane ]
      // } ) );
      // this.add( frontBottomForDepth );

      // const frontTopForDepth = new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
      //   color: 0xFF0000,
      //   opacity: 0,
      //   transparent: true,
      //   side: THREE.FrontSide,
      //   clippingPlanes: [ topClipPlane ]
      // } ) );
      // this.add( frontTopForDepth );

      // const cap = new THREE.Mesh( Boat.getCapGeometry(), new THREE.MeshPhongMaterial( {
      //   color: 0xFF3333,
      //   side: THREE.DoubleSide
      // } ) );
      // this.add( cap );

      // const crossSectionPositionArray = Boat.createCrossSectionVertexArray();
      // const crossSectionNormalArray = new Float32Array( crossSectionPositionArray.length );
      // for ( let i = 1; i < crossSectionNormalArray.length; i += 3 ) {
      //   crossSectionNormalArray[ i ] = 1; // normals should all be 0,1,0
      // }

      // const interiorSurfaceGeometry = new THREE.BufferGeometry();
      // interiorSurfaceGeometry.addAttribute( 'position', new THREE.BufferAttribute( crossSectionPositionArray, 3 ) );
      // interiorSurfaceGeometry.addAttribute( 'normal', new THREE.BufferAttribute( crossSectionNormalArray, 3 ) );

      // const setCrossSectionRelativeY = y => {
      //   Boat.fillCrossSectionVertexArray( y, crossSectionPositionArray );
      //   interiorSurfaceGeometry.attributes.position.needsUpdate = true;
      //   interiorSurfaceGeometry.computeBoundingSphere();
      // };
      // // TODO: unlink
      // boat.interiorVolumeProperty.link( volume => {
      //   setCrossSectionRelativeY( Boat.getYFromVolume( volume ) );
      // } );

      // // TODO: unlink
      // const adjustClipPlanes = () => {
      //   const modelY = boat.matrix.translation.y + Boat.getYFromVolume( boat.interiorVolumeProperty.value );

      //   bottomClipPlane.constant = modelY;
      //   topClipPlane.constant = -modelY;
      // };
      // boat.transformedEmitter.addListener( adjustClipPlanes );
      // boat.interiorVolumeProperty.lazyLink( adjustClipPlanes );
      // adjustClipPlanes();

      // const interiorSurfaceMaterial = new THREE.MeshPhongMaterial( {
      //   color: 0x33FF33,
      //   opacity: 0.8,
      //   transparent: true,
      //   depthWrite: false,
      //   side: THREE.DoubleSide
      // } );
      // const interiorSurface = new THREE.Mesh( interiorSurfaceGeometry, interiorSurfaceMaterial );

      // this.add( interiorSurface );

      // backTop.renderOrder = -7;
      // backBottom.renderOrder = -6;
      // frontBottom.renderOrder = -5;
      // frontBottomForDepth.renderOrder = -4;
      // interiorSurface.renderOrder = -3;
      // frontTop.renderOrder = -2;
      // frontTopForDepth.renderOrder = -1;

      // new DynamicProperty( boat.interiorMaterialProperty, {
      //   derive: 'liquidColor'
      // } ).link( color => {
      //   const threeColor = ThreeUtils.colorToThree( color );
      //   const alpha = color.alpha;

      //   interiorSurfaceMaterial.color = threeColor;
      //   backBottomMaterial.color = threeColor;
      //   frontBottomMaterial.color = threeColor;
      //   interiorSurfaceMaterial.opacity = alpha;
      //   backBottomMaterial.opacity = alpha;
      //   frontBottomMaterial.opacity = alpha;
      // } );

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
