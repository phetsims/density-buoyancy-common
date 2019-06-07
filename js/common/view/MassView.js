// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );

  class MassView extends THREE.Mesh {
    /**
     * @param {Mass} mass
     * @param {THREE.Geometry} geometry
     */
    constructor( mass, initialGeometry ) {
      super( initialGeometry, new THREE.MeshLambertMaterial( {
        color: 0xffaa44
      } ) );

      // @public {Mass}
      this.mass = mass;

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

      super.dispose();
    }
  }

  return densityBuoyancyCommon.register( 'MassView', MassView );
} );
