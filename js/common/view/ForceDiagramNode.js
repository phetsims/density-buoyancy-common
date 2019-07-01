// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const Node = require( 'SCENERY/nodes/Node' );

  // constants
  const arrowOptions = {
    stroke: null
  };
  const forceScale = 5;
  const arrowSpacing = 15;

  class ForceDiagramNode extends Node {
    /**
     * @param {Mass} mass
     * @param {Property.<boolean>} showGravityForceProperty
     * @param {Property.<boolean>} showBuoyancyForceProperty
     * @param {Property.<boolean>} showContactForceProperty
     * @param {Property.<boolean>} showForceValuesProperty
     */
    constructor( mass, showGravityForceProperty, showBuoyancyForceProperty, showContactForceProperty, showForceValuesProperty ) {
      super();

      // @public {Mass}
      this.mass = mass;

      // @private {Property.<boolean>}
      this.showGravityForceProperty = showGravityForceProperty;
      this.showBuoyancyForceProperty = showBuoyancyForceProperty;
      this.showContactForceProperty = showContactForceProperty;
      this.showForceValuesProperty = showForceValuesProperty;

      // @private {ArrowNode}
      this.gravityArrowNode = new ArrowNode( 0, 0, 0, 0, _.extend( {
        fill: DensityBuoyancyCommonColorProfile.gravityForceProperty
      }, arrowOptions ) );
      this.buoyancyArrowNode = new ArrowNode( 0, 0, 0, 0, _.extend( {
        fill: DensityBuoyancyCommonColorProfile.buoyancyForceProperty
      }, arrowOptions ) );
      this.contactArrowNode = new ArrowNode( 0, 0, 0, 0, _.extend( {
        fill: DensityBuoyancyCommonColorProfile.contactForceProperty
      }, arrowOptions ) );
    }

    /**
     * Updates the displayed view.
     */
    update() {
      const upwardArrows = [];
      const downwardArrows = [];

      function updateArrow( forceProperty, showForceProperty, arrowNode ) {
        const y = forceProperty.value.y;
        if ( showForceProperty.value && Math.abs( y ) > 1e-5 ) {
          arrowNode.setTip( 0, -y * forceScale );
          ( y > 0 ? upwardArrows : downwardArrows ).push( arrowNode );
        }
      }

      updateArrow( this.mass.gravityForceProperty, this.showGravityForceProperty, this.gravityArrowNode );
      updateArrow( this.mass.buoyancyForceProperty, this.showBuoyancyForceProperty, this.buoyancyArrowNode );
      updateArrow( this.mass.contactForceProperty, this.showContactForceProperty, this.contactArrowNode );

      this.children = [
        ...upwardArrows,
        ...downwardArrows
      ];

      // Layout arrows with spacing
      for ( let i = 0; i < upwardArrows.length; i++ ) {
        upwardArrows[ i ].x = ( i - ( upwardArrows.length - 1 ) / 2 ) * arrowSpacing;
      }
      for ( let i = 0; i < downwardArrows.length; i++ ) {
        downwardArrows[ i ].x = ( i - ( downwardArrows.length - 1 ) / 2 ) * arrowSpacing;
      }
    }
  }

  return densityBuoyancyCommon.register( 'ForceDiagramNode', ForceDiagramNode );
} );
