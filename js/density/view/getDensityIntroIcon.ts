// Copyright 2019-2024, University of Colorado Boulder

/**
 * The icon for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import { Node } from '../../../../scenery/js/imports.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { DensityMaterials } from '../../common/view/MaterialView.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import FluidIconMesh from '../../common/view/FluidIconMesh.js';

const getDensityIntroIcon = (): Node => {

  return DensityBuoyancyScreenView.getAngledIcon( 5.5, new Vector3( 0, 0, 0 ), scene => {

    const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

    const box = new THREE.Mesh( boxGeometry, new THREE.MeshStandardMaterial( {
      map: DensityMaterials.woodColorTexture,
      normalMap: DensityMaterials.woodNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: DensityMaterials.woodRoughnessTexture,
      metalness: 0
      // NOTE: Removed the environment map for now
    } ) );
    box.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0, 0 ) ) );

    scene.add( box );

    scene.add( new FluidIconMesh( new Vector3( 0, -0.5, 0 ), new THREE.BoxGeometry( 1, 1, 0.12 ) ) );
  } );
};

export default getDensityIntroIcon;