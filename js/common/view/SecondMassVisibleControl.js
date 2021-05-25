// Copyright 2020-2021, University of Colorado Boulder

/**
 * Controls whether the second mass is visible.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import ThreeStage from '../../../../mobius/js/ThreeStage.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import doubleCuboidIcon from '../../../mipmaps/double-cuboid-icon_png.js';
import singleCuboidIcon from '../../../mipmaps/single-cuboid-icon_png.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import DensityBuoyancyCommonColorProfile from './DensityBuoyancyCommonColorProfile.js';

const aMaterial = new THREE.MeshLambertMaterial();
const bMaterial = new THREE.MeshLambertMaterial();

DensityBuoyancyCommonColorProfile.labelAProperty.link( labelColor => {
  aMaterial.color = ThreeUtils.colorToThree( labelColor );
} );
DensityBuoyancyCommonColorProfile.labelBProperty.link( labelColor => {
  bMaterial.color = ThreeUtils.colorToThree( labelColor );
} );

class SecondMassVisibleControl extends RectangularRadioButtonGroup {
  /**
   * @param {Property.<boolean>} secondaryMassVisibleProperty
   */
  constructor( secondaryMassVisibleProperty ) {
    super( secondaryMassVisibleProperty, [
      {
        value: false,
        node: SecondMassVisibleControl.getSingleCuboidIcon()
      },
      {
        value: true,
        node: SecondMassVisibleControl.getDoubleCuboidIcon()
      }
    ], {
      orientation: 'horizontal',
      baseColor: 'rgb( 230, 231, 232 )',
      // buttonContentXMargin: 3,
      // buttonContentYMargin: 3,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    } );
  }

  /**
   * Creates a box mesh for use in icons.
   * @private
   *
   * @param {THREE.Material} material
   * @param {Vector3} position
   * @returns {THREE.Mesh}
   */
  static createBox( material, position ) {
    const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

    const box = new THREE.Mesh( boxGeometry, material );
    box.position.copy( ThreeUtils.vectorToThree( position ) );

    const connect = ( a, b ) => {
      const delta = b.minus( a );

      const edgeGeometry = new THREE.CylinderGeometry( 0.002, 0.002, delta.magnitude, 8, 1 );
      const edge = new THREE.Mesh( edgeGeometry, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );

      edge.position.copy( ThreeUtils.vectorToThree( a.average( b ) ) );

      if ( a.z !== b.z ) {
        edge.rotation.x += Math.PI / 2;
      }
      if ( a.x !== b.x ) {
        edge.rotation.z += Math.PI / 2;
      }

      box.add( edge );
    };

    connect( new Vector3( 0.05, 0.05, 0.05 ), new Vector3( 0.05, 0.05, -0.05 ) );
    connect( new Vector3( -0.05, 0.05, 0.05 ), new Vector3( -0.05, 0.05, -0.05 ) );
    connect( new Vector3( -0.05, -0.05, 0.05 ), new Vector3( -0.05, -0.05, -0.05 ) );
    connect( new Vector3( 0.05, -0.05, 0.05 ), new Vector3( 0.05, -0.05, -0.05 ) );

    connect( new Vector3( 0.05, 0.05, 0.05 ), new Vector3( 0.05, -0.05, 0.05 ) );
    connect( new Vector3( -0.05, 0.05, 0.05 ), new Vector3( -0.05, -0.05, 0.05 ) );
    connect( new Vector3( -0.05, 0.05, -0.05 ), new Vector3( -0.05, -0.05, -0.05 ) );
    connect( new Vector3( 0.05, 0.05, -0.05 ), new Vector3( 0.05, -0.05, -0.05 ) );

    connect( new Vector3( 0.05, 0.05, 0.05 ), new Vector3( -0.05, 0.05, 0.05 ) );
    connect( new Vector3( 0.05, -0.05, 0.05 ), new Vector3( -0.05, -0.05, 0.05 ) );
    connect( new Vector3( 0.05, -0.05, -0.05 ), new Vector3( -0.05, -0.05, -0.05 ) );
    connect( new Vector3( 0.05, 0.05, -0.05 ), new Vector3( -0.05, 0.05, -0.05 ) );

    return box;
  }

  /**
   * Returns an icon for selection, given a scene setup callback.
   * @private
   *
   * @param {number} zoom
   * @param {function(THREE.Scene)} setupScene
   * @returns {Node}
   */
  static getIcon( zoom, setupScene ) {
    const stage = new ThreeStage( { fov: 50 } );

    const ambientLight = new THREE.AmbientLight( 0x333333 );
    stage.threeScene.add( ambientLight );

    const sunLight = new THREE.DirectionalLight( 0xffffff, 1 );
    sunLight.position.set( -1, 1.5, 0.8 );
    stage.threeScene.add( sunLight );

    const moonLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
    moonLight.position.set( 2.0, -1.0, 1.0 );
    stage.threeScene.add( moonLight );

    stage.threeCamera.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0.3, 1 ) ) );
    stage.threeCamera.zoom = zoom;
    stage.threeCamera.lookAt( ThreeUtils.vectorToThree( new Vector3( 0, -0.003, 0 ) ) );
    stage.threeCamera.updateProjectionMatrix();

    setupScene( stage.threeScene );

    stage.threeCamera.fov = 50;
    stage.threeCamera.aspect = 1;
    stage.setDimensions( 256, 256 );
    stage.threeCamera.near = 0.03;
    stage.threeCamera.updateProjectionMatrix();
    stage.render( undefined );

    const canvas = stage.renderToCanvas( 3 );

    stage.dispose();

    console.log( canvas.toDataURL() );

    const image = new Image( canvas.toDataURL(), {
      mipmap: true,
      initialWidth: canvas.width,
      initialHeight: canvas.height
    } );
    image.setScaleMagnitude( 0.2, -0.2 );
    return image;
  }

  /**
   * Returns an icon that shows a single cuboid.
   * @public
   *
   * @returns {Node}
   */
  static getSingleCuboidIcon() {
    if ( DensityBuoyancyCommonQueryParameters.generateIconImages ) {
      return SecondMassVisibleControl.getIcon( 5.5, scene => {
        scene.add( SecondMassVisibleControl.createBox( aMaterial, new Vector3( 0, 0, 0 ) ) );
      } );
    }
    else {
      return new Image( singleCuboidIcon, { scale: 0.2 } );
    }
  }

  /**
   * Returns an icon that shows a single cuboid.
   * @public
   *
   * @returns {Node}
   */
  static getDoubleCuboidIcon() {
    if ( DensityBuoyancyCommonQueryParameters.generateIconImages ) {
      return SecondMassVisibleControl.getIcon( 4, scene => {
        scene.add( SecondMassVisibleControl.createBox( aMaterial, new Vector3( -0.039, 0.015, -0.07 ) ) );
        scene.add( SecondMassVisibleControl.createBox( bMaterial, new Vector3( 0.03, -0.005, 0.07 ) ) );
      } );
    }
    else {
      return new Image( doubleCuboidIcon, { scale: 0.2 } );
    }
  }
}

densityBuoyancyCommon.register( 'SecondMassVisibleControl', SecondMassVisibleControl );
export default SecondMassVisibleControl;