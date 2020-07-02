// Copyright 2020, University of Colorado Boulder

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

    const boatOneLiterGeometry = BoatDesign.getPrimaryGeometry( 1 );

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

    const crossSectionPositionArray = BoatDesign.createCrossSectionVertexArray();
    const crossSectionNormalArray = new Float32Array( crossSectionPositionArray.length );
    for ( let i = 1; i < crossSectionNormalArray.length; i += 3 ) {
      crossSectionNormalArray[ i ] = 1; // normals should all be 0,1,0
    }

    const interiorSurfaceGeometry = new THREE.BufferGeometry();
    interiorSurfaceGeometry.addAttribute( 'position', new THREE.BufferAttribute( crossSectionPositionArray, 3 ) );
    interiorSurfaceGeometry.addAttribute( 'normal', new THREE.BufferAttribute( crossSectionNormalArray, 3 ) );

    // TODO: unlink
    Property.multilink( [ boat.basin.liquidYInterpolatedProperty, boat.basin.liquidVolumeProperty ], ( y, volume ) => {
      BoatDesign.fillCrossSectionVertexArray( y - boat.matrix.translation.y, boat.displacementVolumeProperty.value / 0.001, crossSectionPositionArray );
      interiorSurfaceGeometry.attributes.position.needsUpdate = true;
      interiorSurfaceGeometry.computeBoundingSphere();
    } );

    const interiorSurfaceMaterial = new THREE.MeshPhongMaterial( {
      color: 0x33FF33,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    } );
    const interiorSurface = new THREE.Mesh( interiorSurfaceGeometry, interiorSurfaceMaterial );

    new DynamicProperty( boat.liquidMaterialProperty, {
      derive: 'liquidColor'
    } ).link( color => {
      const threeColor = ThreeUtils.colorToThree( color );
      const alpha = color.alpha;

      interiorSurfaceMaterial.color = threeColor;
      interiorSurfaceMaterial.opacity = alpha;
    } );

    this.add( interiorSurface );

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

densityBuoyancyCommon.register( 'BoatView', BoatView );
export default BoatView;