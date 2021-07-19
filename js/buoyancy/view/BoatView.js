// Copyright 2020-2021, University of Colorado Boulder

/**
 * The 3D view for a Boat.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import MassView from '../../common/view/MassView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BoatDesign from '../model/BoatDesign.js';

class BoatView extends MassView {
  /**
   * @param {Boat} boat
   * @param {Property.<number>} liquidYInterpolatedProperty
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( boat, liquidYInterpolatedProperty, reflectedTexture, refractedTexture ) {

    super( boat, new THREE.Geometry(), reflectedTexture, refractedTexture );

    const bottomClipPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
    const topClipPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );

    const boatOneLiterGeometry = BoatDesign.getPrimaryGeometry( 1 );

    const boatGroup = new THREE.Group();
    this.add( boatGroup );

    boat.displacementVolumeProperty.link( volume => {
      const scale = Math.pow( volume / 0.001, 1 / 3 );
      boatGroup.scale.x = scale;
      boatGroup.scale.y = scale;
      boatGroup.scale.z = scale;
    } );

    const backTopMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      clippingPlanes: [ topClipPlane ]
    } );
    const backTop = new THREE.Mesh( boatOneLiterGeometry, backTopMaterial );
    boatGroup.add( backTop );

    const backBottomMaterial = new THREE.MeshPhongMaterial( {
      color: 0x33FF33,
      opacity: 0.8,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      clippingPlanes: [ bottomClipPlane ]
    } );
    const backBottom = new THREE.Mesh( boatOneLiterGeometry, backBottomMaterial );
    boatGroup.add( backBottom );

    const frontTopMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      clippingPlanes: [ topClipPlane ]
    } );
    const frontTop = new THREE.Mesh( boatOneLiterGeometry, frontTopMaterial );
    boatGroup.add( frontTop );

    const frontBottomMaterial = new THREE.MeshPhongMaterial( {
      color: 0x33FF33,
      opacity: 0.8,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      clippingPlanes: [ bottomClipPlane ]
    } );
    const frontBottom = new THREE.Mesh( boatOneLiterGeometry, frontBottomMaterial );
    boatGroup.add( frontBottom );

    const frontForDepth = new THREE.Mesh( boatOneLiterGeometry, new THREE.MeshPhongMaterial( {
      color: 0xFF0000,
      opacity: 0,
      transparent: true,
      side: THREE.FrontSide
    } ) );
    boatGroup.add( frontForDepth );

    const crossSectionPositionArray = BoatDesign.createCrossSectionVertexArray();
    const crossSectionNormalArray = new Float32Array( crossSectionPositionArray.length );
    for ( let i = 1; i < crossSectionNormalArray.length; i += 3 ) {
      crossSectionNormalArray[ i ] = 1; // normals should all be 0,1,0
    }

    const interiorSurfaceGeometry = new THREE.BufferGeometry();
    interiorSurfaceGeometry.addAttribute( 'position', new THREE.BufferAttribute( crossSectionPositionArray, 3 ) );
    interiorSurfaceGeometry.addAttribute( 'normal', new THREE.BufferAttribute( crossSectionNormalArray, 3 ) );

    // @private {Multilink}
    this.liquidMultilink = Property.multilink( [
      boat.basin.liquidYInterpolatedProperty,
      boat.displacementVolumeProperty,
      boat.basin.liquidVolumeProperty
    ], ( y, boatDisplacement, boatLiquidVolume ) => {
      const maximumVolume = boat.getBasinVolume( Number.POSITIVE_INFINITY );
      const volume = boat.basin.liquidVolumeProperty.value;
      const isFull = volume >= maximumVolume - 1e-7;
      if ( boatLiquidVolume > 0 && ( !isFull || BoatDesign.shouldBoatWaterDisplayIfFull( liquidYInterpolatedProperty.value - boat.matrix.translation.y, boatDisplacement / 0.001 ) ) ) {
        BoatDesign.fillCrossSectionVertexArray( y - boat.matrix.translation.y, boatDisplacement / 0.001, crossSectionPositionArray );
      }
      else {
        crossSectionPositionArray.fill( 0 );
      }
      interiorSurfaceGeometry.attributes.position.needsUpdate = true;
      interiorSurfaceGeometry.computeBoundingSphere();

      bottomClipPlane.constant = boat.basin.liquidYInterpolatedProperty.value;
      topClipPlane.constant = -boat.basin.liquidYInterpolatedProperty.value;
    } );

    const interiorSurfaceMaterial = new THREE.MeshPhongMaterial( {
      color: 0x33FF33,
      opacity: 0.8,
      transparent: true,
      depthWrite: false
    } );
    const interiorSurface = new THREE.Mesh( interiorSurfaceGeometry, interiorSurfaceMaterial );

    new DynamicProperty( boat.liquidMaterialProperty, {
      derive: 'liquidColor'
    } ).link( color => {
      const threeColor = ThreeUtils.colorToThree( color );
      const alpha = color.alpha;

      interiorSurfaceMaterial.color = threeColor;
      interiorSurfaceMaterial.opacity = alpha;
      backBottomMaterial.color = threeColor;
      frontBottomMaterial.color = threeColor;
      backBottomMaterial.opacity = alpha;
      frontBottomMaterial.opacity = alpha;
    } );

    this.add( interiorSurface );

    // Set render order for all elements
    [
      frontForDepth,
      interiorSurface,
      frontBottom,
      frontTop,
      backBottom,
      backTop
    ].forEach( ( view, index ) => {
      view.renderOrder = -( index + 1 );
    } );

    // @public {Boat}
    this.boat = boat;
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.liquidMultilink.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'BoatView', BoatView );
export default BoatView;