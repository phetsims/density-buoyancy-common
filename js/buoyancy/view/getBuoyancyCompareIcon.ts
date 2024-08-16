// Copyright 2024, University of Colorado Boulder

/**
 * The icon for Buoyancy's Compare screen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
import Vector3 from '../../../../dot/js/Vector3.js';
import { DensityMaterials } from '../../common/view/MaterialView.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import FluidIconMesh from '../../common/view/FluidIconMesh.js';
import { Node } from '../../../../scenery/js/imports.js';
import MobiusScreenView from '../../../../mobius/js/MobiusScreenView.js';

const getBuoyancyCompareIcon = (): Node => {
  return MobiusScreenView.getAngledIcon( 4, new Vector3( 0, -0.05, 0 ), scene => {

    const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

    const box1 = new THREE.Mesh( boxGeometry, new THREE.MeshStandardMaterial( {
      map: DensityMaterials.woodColorTexture,
      normalMap: DensityMaterials.woodNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: DensityMaterials.woodRoughnessTexture,
      metalness: 0
      // NOTE: Removed the environment map for now
    } ) );
    box1.position.copy( ThreeUtils.vectorToThree( new Vector3( 0.08, -0.02, 0 ) ) );

    scene.add( box1 );

    const box2 = new THREE.Mesh( boxGeometry, new THREE.MeshStandardMaterial( {
      map: DensityMaterials.brickColorTexture,
      normalMap: DensityMaterials.brickNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      metalness: 0
      // NOTE: Removed the environment map for now
    } ) );
    box2.position.copy( ThreeUtils.vectorToThree( new Vector3( -0.08, -0.1, 0 ) ) );

    scene.add( box2 );

    scene.add( new FluidIconMesh( new Vector3( 0, -0.5, 0.12 ) ) );
  } );
};

export default getBuoyancyCompareIcon;