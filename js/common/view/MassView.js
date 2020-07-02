// Copyright 2019-2020, University of Colorado Boulder

/**
 * The base type for 3D views of any type of mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityMaterials from './DensityMaterials.js';

class MassView extends THREE.Mesh {
  /**
   * @param {Mass} mass
   * @param {THREE.Geometry} initialGeometry
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( mass, initialGeometry, reflectedTexture, refractedTexture ) {
    const materialView = DensityMaterials.getMaterialView( reflectedTexture, refractedTexture, mass.materialProperty.value );

    super( initialGeometry, materialView.material );

    // @public {Mass}
    this.mass = mass;

    // @private {MaterialView}
    this.materialView = materialView;

    // @private {Material}
    this.material = materialView.material;

    mass.materialProperty.lazyLink( material => {
      this.materialView.dispose();
      this.materialView = DensityMaterials.getMaterialView( reflectedTexture, refractedTexture, material );
      this.material = this.materialView.material;
    } );

    // @private {function}
    this.positionListener = () => {
      const position = mass.matrix.translation;

      this.position.x = position.x;
      this.position.y = position.y;
    };

    this.mass.transformedEmitter.addListener( this.positionListener );
    this.positionListener();
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.mass.transformedEmitter.removeListener( this.positionListener );
  }
}

densityBuoyancyCommon.register( 'MassView', MassView );
export default MassView;