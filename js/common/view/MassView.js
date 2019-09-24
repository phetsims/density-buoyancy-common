// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityMaterials = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityMaterials' );

  class MassView extends THREE.Mesh {
    /**
     * @param {Mass} mass
     * @param {THREE.Geometry} geometry
     */
    constructor( mass, initialGeometry ) {
      const materialView = DensityMaterials.getMaterialView( mass.materialProperty.value );

      super( initialGeometry, materialView.material );

      // @public {Mass}
      this.mass = mass;

      // @private {MaterialView}
      this.materialView = materialView;

      mass.materialProperty.lazyLink( material => {
        // TODO: No MaterialView disposal?

        this.materialView = DensityMaterials.getMaterialView( material );
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
     * Updates the mass's view before main rendering
     * @public
     *
     * @param {THREE.Scene} scene
     * @param {THREE.Renderer} renderer
     */
    update( scene, renderer ) {
      this.materialView.update( this, scene, renderer );
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

  return densityBuoyancyCommon.register( 'MassView', MassView );
} );
