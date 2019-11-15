// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bottle = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/Bottle' );
  const Color = require( 'SCENERY/util/Color' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityMaterials = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityMaterials' );
  const MassView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassView' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const ThreeUtil = require( 'MOBIUS/ThreeUtil' );

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

      const backTopMaterial = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        clippingPlanes: [ topClipPlane ]
      } );
      const backTop = new THREE.Mesh( primaryGeometry, backTopMaterial );
      this.add( backTop );

      const backBottomMaterial = new THREE.MeshPhongMaterial( {
        color: 0x33FF33,
        opacity: 0.8,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        clippingPlanes: [ bottomClipPlane ]
      } );
      const backBottom = new THREE.Mesh( primaryGeometry, backBottomMaterial );
      this.add( backBottom );

      const frontTopMaterial = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
        clippingPlanes: [ topClipPlane ]
      } );
      const frontTop = new THREE.Mesh( primaryGeometry, frontTopMaterial );
      this.add( frontTop );

      const frontBottomMaterial = new THREE.MeshPhongMaterial( {
        color: 0x33FF33,
        opacity: 0.8,
        transparent: true,
        side: THREE.FrontSide,
        // depthWrite: false, // TODO: hmmm?
        clippingPlanes: [ bottomClipPlane ]
      } );
      const frontBottom = new THREE.Mesh( primaryGeometry, frontBottomMaterial );
      this.add( frontBottom );

      // TODO: optimize
      const frontBottomForDepth = new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
        color: 0xFF0000,
        opacity: 0,
        transparent: true,
        side: THREE.FrontSide,
        clippingPlanes: [ bottomClipPlane ]
      } ) );
      this.add( frontBottomForDepth );

      const frontTopForDepth = new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
        color: 0xFF0000,
        opacity: 0,
        transparent: true,
        side: THREE.FrontSide,
        clippingPlanes: [ topClipPlane ]
      } ) );
      this.add( frontTopForDepth );

      const cap = new THREE.Mesh( Bottle.getCapGeometry(), new THREE.MeshLambertMaterial( {
        color: 0xFF3333
      } ) );
      this.add( cap );

      const crossSectionPositionArray = Bottle.createCrossSectionVertexArray();
      const crossSectionNormalArray = new Float32Array( crossSectionPositionArray.length );
      for ( let i = 1; i < crossSectionNormalArray.length; i += 3 ) {
        crossSectionNormalArray[ i ] = 1; // normals should all be 0,1,0
      }

      const interiorSurfaceGeometry = new THREE.BufferGeometry();
      interiorSurfaceGeometry.addAttribute( 'position', new THREE.BufferAttribute( crossSectionPositionArray, 3 ) );
      interiorSurfaceGeometry.addAttribute( 'normal', new THREE.BufferAttribute( crossSectionNormalArray, 3 ) );

      const setCrossSectionRelativeY = y => {
        Bottle.fillCrossSectionVertexArray( y, crossSectionPositionArray );
        interiorSurfaceGeometry.attributes.position.needsUpdate = true;
        interiorSurfaceGeometry.computeBoundingSphere();
      };
      // TODO: unlink
      bottle.interiorVolumeProperty.link( volume => {
        setCrossSectionRelativeY( Bottle.getYFromVolume( volume ) );
      } );

      // TODO: unlink
      const adjustClipPlanes = () => {
        const modelY = bottle.matrix.translation.y + Bottle.getYFromVolume( bottle.interiorVolumeProperty.value );

        bottomClipPlane.constant = modelY;
        topClipPlane.constant = -modelY;
      };
      bottle.transformedEmitter.addListener( adjustClipPlanes );
      bottle.interiorVolumeProperty.lazyLink( adjustClipPlanes );
      adjustClipPlanes();

      const interiorSurfaceMaterial = new THREE.MeshPhongMaterial( {
        color: 0x33FF33,
        opacity: 0.8,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      } );
      const interiorSurface = new THREE.Mesh( interiorSurfaceGeometry, interiorSurfaceMaterial );

      this.add( interiorSurface );

      backTop.renderOrder = -7;
      backBottom.renderOrder = -6;
      frontBottom.renderOrder = -5;
      frontBottomForDepth.renderOrder = -4;
      interiorSurface.renderOrder = -3;
      frontTop.renderOrder = -2;
      frontTopForDepth.renderOrder = -1;

      bottle.interiorMaterialProperty.link( material => {
        let color = 0xffffff;
        let opacity = 0.4;

        if ( material === Material.WATER ) {
          color = ThreeUtil.colorToThree( new Color( 0, 128, 255 ) );
          opacity = 0.4;
        }
        else if ( material === Material.GASOLINE ) {
          color = ThreeUtil.colorToThree( new Color( 230, 255, 0 ) );
          opacity = 0.4;
        }
        else if ( material === Material.OIL ) {
          color = ThreeUtil.colorToThree( new Color( 170, 255, 0 ) );
          opacity = 0.6;
        }
        else if ( material === Material.SAND ) {
          color = ThreeUtil.colorToThree( new Color( 194, 178, 128 ) );
          opacity = 1;
        }
        else if ( material === Material.CEMENT ) {
          color = ThreeUtil.colorToThree( new Color( 128, 130, 133 ) );
          opacity = 1;
        }
        else if ( material === Material.COPPER ) {
          color = ThreeUtil.colorToThree( new Color( 184, 115, 51 ) );
          opacity = 1;
        }
        else if ( material === Material.LEAD ) {
          color = ThreeUtil.colorToThree( new Color( 80, 85, 90 ) );
          opacity = 1;
        }
        else if ( material === Material.MERCURY ) {
          color = ThreeUtil.colorToThree( new Color( 219, 206, 202 ) );
          opacity = 1;
        }
        else if ( material.custom ) {
          const lightness = DensityMaterials.getCustomLightness( material.density );
          color = ThreeUtil.colorToThree( new Color( lightness, lightness, lightness ) );
          opacity = 1;
        }

        interiorSurfaceMaterial.color = color;
        backBottomMaterial.color = color;
        frontBottomMaterial.color = color;
        interiorSurfaceMaterial.opacity = opacity;
        backBottomMaterial.opacity = opacity;
        frontBottomMaterial.opacity = opacity;
      } );

      // @public {Bottle}
      this.bottle = bottle;
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

  return densityBuoyancyCommon.register( 'BottleView', BottleView );
} );
