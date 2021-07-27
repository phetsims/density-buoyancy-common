// Copyright 2019-2021, University of Colorado Boulder

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
   */
  constructor( mass, initialGeometry ) {
    const materialView = DensityMaterials.getMaterialView( mass.materialProperty.value );

    super( initialGeometry, materialView.material );

    // @public {Mass}
    this.mass = mass;

    // @private {MaterialView}
    this.materialView = materialView;

    // @private {Material}
    this.material = materialView.material;

    // @private {function}
    this.materialListener = material => {
      this.materialView.dispose();
      this.materialView = DensityMaterials.getMaterialView( material );
      this.material = this.materialView.material;
    };
    this.mass.materialProperty.lazyLink( this.materialListener );

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
    this.mass.materialProperty.unlink( this.materialListener );

    this.materialView.dispose();
  }
}

densityBuoyancyCommon.register( 'MassView', MassView );
export default MassView;