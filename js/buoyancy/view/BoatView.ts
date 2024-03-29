// Copyright 2020-2024, University of Colorado Boulder

/**
 * The 3D view for a Boat.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink, { UnknownMultilink } from '../../../../axon/js/Multilink.js';
import Material from '../../common/model/Material.js';
import MassView, { ModelPoint3ToViewPoint2 } from '../../common/view/MassView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Boat from '../model/Boat.js';
import BoatDesign from '../model/BoatDesign.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';

type BoatDrawingData = {
  backMiddleMaterial: THREE.MeshBasicMaterial;
  group: THREE.Group;
};

const VOLUME_TOLERANCE = DensityBuoyancyCommonConstants.TOLERANCE;


export default class BoatView extends MassView {
  private readonly liquidMultilink: UnknownMultilink;

  public readonly boat: Boat;

  public constructor( boat: Boat, modelToViewPoint: ModelPoint3ToViewPoint2, dragBoundsProperty: TReadOnlyProperty<Bounds3>,
                      liquidYInterpolatedProperty: TReadOnlyProperty<number> ) {

    // @ts-expect-error
    super( boat, new THREE.Geometry(), modelToViewPoint, dragBoundsProperty );

    // Clip planes at the boat's water level
    const topBoatClipPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );
    const bottomBoatClipPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );

    // Clip planes at the pool's water level
    const topPoolClipPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );
    const bottomPoolClipPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );

    const boatDrawingData = BoatView.getBoatDrawingData(
      topBoatClipPlane,
      bottomBoatClipPlane,
      topPoolClipPlane,
      bottomPoolClipPlane
    );

    const boatGroup = boatDrawingData.group;
    this.add( boatGroup );

    boat.displacementVolumeProperty.link( volume => {
      const scale = Math.pow( volume / 0.001, 1 / 3 );
      boatGroup.scale.x = scale;
      boatGroup.scale.y = scale;
      boatGroup.scale.z = scale;
    } );

    const topLiquidPositionArray = BoatDesign.createCrossSectionVertexArray();
    const topLiquidNormalArray = new Float32Array( topLiquidPositionArray.length );
    for ( let i = 1; i < topLiquidNormalArray.length; i += 3 ) {
      topLiquidNormalArray[ i ] = 1; // normals should all be 0,1,0
    }
    const topLiquidGeometry = new THREE.BufferGeometry();
    topLiquidGeometry.addAttribute( 'position', new THREE.BufferAttribute( topLiquidPositionArray, 3 ) );
    topLiquidGeometry.addAttribute( 'normal', new THREE.BufferAttribute( topLiquidNormalArray, 3 ) );

    const topLiquidMaterial = new THREE.MeshPhongMaterial( {
      color: 0x33FF33, // will be replaced with liquid color below
      opacity: 0.8,
      transparent: true,
      depthWrite: false
    } );
    const topLiquid = new THREE.Mesh( topLiquidGeometry, topLiquidMaterial );
    this.add( topLiquid );

    this.liquidMultilink = Multilink.multilink( [
      boat.basin.liquidYInterpolatedProperty,
      boat.displacementVolumeProperty,
      boat.basin.liquidVolumeProperty
    ], ( boatLiquidY, boatDisplacement, boatLiquidVolume ) => {
      const poolLiquidY = liquidYInterpolatedProperty.value;
      const liters = boatDisplacement / 0.001;

      const relativeBoatLiquidY = boatLiquidY - boat.matrix.translation.y;

      const maximumVolume = boat.basin.getEmptyVolume( Number.POSITIVE_INFINITY );
      const volume = boat.basin.liquidVolumeProperty.value;
      const isFull = volume >= maximumVolume - VOLUME_TOLERANCE;
      if ( boatLiquidVolume > 0 && ( !isFull || BoatDesign.shouldBoatWaterDisplayIfFull( liquidYInterpolatedProperty.value - boat.matrix.translation.y, liters ) ) ) {
        BoatDesign.fillCrossSectionVertexArray( relativeBoatLiquidY, liters, topLiquidPositionArray );
      }
      else {
        topLiquidPositionArray.fill( 0 );
      }
      topLiquidGeometry.attributes.position.needsUpdate = true;
      topLiquidGeometry.computeBoundingSphere();

      if ( boat.basin.liquidVolumeProperty.value > VOLUME_TOLERANCE ) {
        bottomBoatClipPlane.constant = boatLiquidY;
        topBoatClipPlane.constant = -boatLiquidY;
      }
      else {
        bottomBoatClipPlane.constant = -1000;
        topBoatClipPlane.constant = 1000;
      }
      bottomPoolClipPlane.constant = poolLiquidY;
      topPoolClipPlane.constant = -poolLiquidY;
    } );

    Material.linkLiquidColor( boat.liquidMaterialProperty, topLiquidMaterial );
    Material.linkLiquidColor( boat.liquidMaterialProperty, boatDrawingData.backMiddleMaterial );

    // see the static function for the rest of render orders
    topLiquid.renderOrder = 3;

    this.boat = boat;
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    // TODO: dispose everything from above https://github.com/phetsims/density-buoyancy-common/issues/86

    this.liquidMultilink.dispose();

    super.dispose();
  }

  /**
   * Factored out way to get the view object of the boat. (mostly for use as an icon)
   */
  public static getBoatDrawingData(
    topBoatClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 ),
    bottomBoatClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 ),
    topPoolClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 ),
    bottomPoolClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 )
  ): BoatDrawingData {

    const boatOneLiterInteriorGeometry = BoatDesign.getPrimaryGeometry( 1, false, false, true, false );
    const boatOneLiterExteriorGeometry = BoatDesign.getPrimaryGeometry( 1, true, true, false, false );

    const boatOneLiterGeometry = BoatDesign.getPrimaryGeometry( 1 );

    const boatGroup = new THREE.Group();

    const backExteriorMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false
    } );
    const backExterior = new THREE.Mesh( boatOneLiterExteriorGeometry, backExteriorMaterial );
    boatGroup.add( backExterior );

    const backTopMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      clippingPlanes: [ topBoatClipPlane ]
    } );
    const backTop = new THREE.Mesh( boatOneLiterInteriorGeometry, backTopMaterial );
    boatGroup.add( backTop );

    const backMiddleMaterial = new THREE.MeshBasicMaterial( {
      color: 0xffffff, // will be replaced with liquid color from Property updates
      opacity: 0.8,
      transparent: true,
      side: THREE.BackSide, // better appearance with this
      depthWrite: false,
      clippingPlanes: [ bottomBoatClipPlane, topPoolClipPlane ]
    } );

    const backMiddle = new THREE.Mesh( boatOneLiterInteriorGeometry, backMiddleMaterial );
    boatGroup.add( backMiddle );

    const backBottomMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      clippingPlanes: [ bottomBoatClipPlane, bottomPoolClipPlane ]
    } );
    const backBottom = new THREE.Mesh( boatOneLiterInteriorGeometry, backBottomMaterial );
    boatGroup.add( backBottom );

    const frontExteriorMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false
    } );
    const frontExterior = new THREE.Mesh( boatOneLiterExteriorGeometry, frontExteriorMaterial );
    boatGroup.add( frontExterior );

    const frontTopMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      clippingPlanes: [ topBoatClipPlane ]
    } );
    const frontTop = new THREE.Mesh( boatOneLiterInteriorGeometry, frontTopMaterial );
    boatGroup.add( frontTop );

    const frontForDepth = new THREE.Mesh( boatOneLiterGeometry, new THREE.MeshPhongMaterial( {
      color: 0xFF0000,
      opacity: 0,
      transparent: true,
      side: THREE.FrontSide
    } ) );
    boatGroup.add( frontForDepth );

    // pool liquid will be at a higher value
    frontForDepth.renderOrder = 4;
    frontTop.renderOrder = 2;
    frontExterior.renderOrder = 1;
    // block will be at 0
    backBottom.renderOrder = -1;
    backMiddle.renderOrder = -1;
    backTop.renderOrder = -1;
    backExterior.renderOrder = -2;

    return {
      group: boatGroup,
      backMiddleMaterial: backMiddleMaterial
    };
  }
}

densityBuoyancyCommon.register( 'BoatView', BoatView );