// Copyright 2024, University of Colorado Boulder

/**
 * The icon for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
import { Node } from '../../../../scenery/js/imports.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import FluidIconMesh from '../../common/view/FluidIconMesh.js';
import MobiusScreenView from '../../../../mobius/js/MobiusScreenView.js';

const getDensityCompareIcon = (): Node => {

  return MobiusScreenView.getAngledIcon( 4.6, new Vector3( 0, -0.02, 0 ), scene => {

    const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

    const leftBox = new THREE.Mesh( boxGeometry, new THREE.MeshLambertMaterial( {
      color: 0xffff00
    } ) );
    leftBox.position.copy( ThreeUtils.vectorToThree( new Vector3( -0.07, 0, 0 ) ) );
    scene.add( leftBox );

    const rightBox = new THREE.Mesh( boxGeometry, new THREE.MeshLambertMaterial( {
      color: 0xff0000
    } ) );
    rightBox.position.copy( ThreeUtils.vectorToThree( new Vector3( 0.07, -0.06, 0 ) ) );
    scene.add( rightBox );

    scene.add( new FluidIconMesh( new Vector3( 0, -0.5, 0 ), new THREE.BoxGeometry( 1, 1, 0.12 ) ) );
  } );
};

export default getDensityCompareIcon;