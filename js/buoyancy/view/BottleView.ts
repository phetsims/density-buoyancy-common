// Copyright 2019-2024, University of Colorado Boulder

/**
 * The 3D view for a Bottle.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import MassView, { ModelPoint3ToViewPoint2 } from '../../common/view/MassView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Bottle from '../model/Bottle.js';
import Material from '../../common/model/Material.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';

type BottleDrawingData = {
  group: THREE.Group;
  backBottomMaterial: THREE.MeshBasicMaterial;
  frontBottomMaterial: THREE.MeshBasicMaterial;
};


export default class BottleView extends MassView {

  public readonly bottle: Bottle;

  public constructor( bottle: Bottle, modelToViewPoint: ModelPoint3ToViewPoint2,
                      dragBoundsProperty: TReadOnlyProperty<Bounds3> ) {

    // @ts-expect-error
    super( bottle, new THREE.Geometry(), modelToViewPoint, dragBoundsProperty );

    const bottomClipPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
    const topClipPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );

    const bottleDrawingData = BottleView.getBottleDrawingData( bottomClipPlane, topClipPlane );

    const bottleGroup = bottleDrawingData.group;
    this.add( bottleGroup );

    const crossSectionPositionArray = Bottle.createCrossSectionVertexArray();
    const crossSectionNormalArray = new Float32Array( crossSectionPositionArray.length );
    for ( let i = 1; i < crossSectionNormalArray.length; i += 3 ) {
      crossSectionNormalArray[ i ] = 1; // normals should all be 0,1,0
    }

    const interiorSurfaceGeometry = new THREE.BufferGeometry();
    interiorSurfaceGeometry.addAttribute( 'position', new THREE.BufferAttribute( crossSectionPositionArray, 3 ) );
    interiorSurfaceGeometry.addAttribute( 'normal', new THREE.BufferAttribute( crossSectionNormalArray, 3 ) );

    const setCrossSectionRelativeY = ( y: number ) => {
      Bottle.fillCrossSectionVertexArray( y, crossSectionPositionArray );
      interiorSurfaceGeometry.attributes.position.needsUpdate = true;
      interiorSurfaceGeometry.computeBoundingSphere();
    };
    // TODO: unlink https://github.com/phetsims/density-buoyancy-common/issues/86
    bottle.interiorVolumeProperty.link( volume => {
      setCrossSectionRelativeY( Bottle.getYFromVolume( volume ) );
    } );

    // TODO: unlink https://github.com/phetsims/density-buoyancy-common/issues/86
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

    bottleGroup.add( interiorSurface );

    interiorSurface.renderOrder = 2;

    Material.linkLiquidColor( bottle.interiorMaterialProperty, interiorSurfaceMaterial );
    Material.linkLiquidColor( bottle.interiorMaterialProperty, bottleDrawingData.backBottomMaterial );
    Material.linkLiquidColor( bottle.interiorMaterialProperty, bottleDrawingData.frontBottomMaterial );

    this.bottle = bottle;
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    // TODO: dispose everything from above https://github.com/phetsims/density-buoyancy-common/issues/86

    super.dispose();
  }

  /**
   * Factored out way to get the view object of the bottle. (mostly for use as an icon)
   */
  public static getBottleDrawingData(
    bottomClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 ),
    topClipPlane: THREE.Plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 )
  ): BottleDrawingData {

    const primaryGeometry = Bottle.getPrimaryGeometry();

    const bottleGroup = new THREE.Group();

    const backTopMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      clippingPlanes: [ topClipPlane ]
    } );
    const backTop = new THREE.Mesh( primaryGeometry, backTopMaterial );
    bottleGroup.add( backTop );

    const backBottomMaterial = new THREE.MeshPhongMaterial( {
      color: 0xFFFFFF,
      opacity: 0.8,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      clippingPlanes: [ bottomClipPlane ]
    } );
    const backBottom = new THREE.Mesh( primaryGeometry, backBottomMaterial );
    bottleGroup.add( backBottom );

    const frontTopMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      opacity: 0.4,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      clippingPlanes: [ topClipPlane ]
    } );
    const frontTop = new THREE.Mesh( primaryGeometry, frontTopMaterial );
    bottleGroup.add( frontTop );

    const frontBottomMaterial = new THREE.MeshPhongMaterial( {
      color: Material.WATER.liquidColor!.value.toHexString(),
      opacity: 0.5,
      transparent: true,
      side: THREE.FrontSide,
      // depthWrite: false, // TODO: hmmm? https://github.com/phetsims/density-buoyancy-common/issues/86
      clippingPlanes: [ bottomClipPlane ]
    } );
    const frontBottom = new THREE.Mesh( primaryGeometry, frontBottomMaterial );
    bottleGroup.add( frontBottom );

    // TODO: optimize https://github.com/phetsims/density-buoyancy-common/issues/86
    const frontBottomForDepth = new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
      color: 0xFF0000,
      opacity: 0,
      transparent: true,
      side: THREE.FrontSide,
      clippingPlanes: [ bottomClipPlane ]
    } ) );
    bottleGroup.add( frontBottomForDepth );

    const frontTopForDepth = new THREE.Mesh( primaryGeometry, new THREE.MeshPhongMaterial( {
      color: 0xFF0000,
      opacity: 0,
      transparent: true,
      side: THREE.FrontSide,
      clippingPlanes: [ topClipPlane ]
    } ) );
    bottleGroup.add( frontTopForDepth );

    const cap = new THREE.Mesh( Bottle.getCapGeometry(), new THREE.MeshPhongMaterial( {
      color: 0xFF3333,
      side: THREE.DoubleSide
    } ) );
    bottleGroup.add( cap );

    // Set render order for all elements
    [
      frontTopForDepth,
      frontTop,
      null, // renderOrder place holder for interiorSurface
      frontBottomForDepth,
      frontBottom,
      backBottom,
      backTop
    ].forEach( ( view, index ) => {
      if ( view ) {
        view.renderOrder = -( index + 1 );
      }
    } );

    return {
      group: bottleGroup,
      backBottomMaterial: backBottomMaterial,
      frontBottomMaterial: frontBottomMaterial
    };
  }
}

densityBuoyancyCommon.register( 'BottleView', BottleView );