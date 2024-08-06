// Copyright 2019-2024, University of Colorado Boulder

/**
 * The icon for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
import { Node } from '../../../../../scenery/js/imports.js';
import DensityBuoyancyScreenView from '../../../common/view/DensityBuoyancyScreenView.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import ConeView from './ConeView.js';
import Cone from '../../model/shapes/Cone.js';
import { DensityMaterials } from '../../../common/view/MaterialView.js';
import ThreeUtils from '../../../../../mobius/js/ThreeUtils.js';
import FluidIconMesh from '../../../common/view/FluidIconMesh.js';

const getBuoyancyShapesIcon = (): Node => {

  return DensityBuoyancyScreenView.getAngledIcon( 5.5, new Vector3( 0, 0, 0 ), scene => {

    const coneGeometry = ConeView.getConeGeometry( Cone.getRadiusFromRatio( 0.2 ), Cone.getHeightFromRatio( 0.35 ), true );

    const cone = new THREE.Mesh( coneGeometry, new THREE.MeshStandardMaterial( {
      map: DensityMaterials.woodColorTexture,
      normalMap: DensityMaterials.woodNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: DensityMaterials.woodRoughnessTexture,
      metalness: 0
      // NOTE: Removed the environment map for now
    } ) );
    cone.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.02, 0 ) ) );

    scene.add( cone );
    scene.add( new FluidIconMesh() );
  } );
};

export default getBuoyancyShapesIcon;