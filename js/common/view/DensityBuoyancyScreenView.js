// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const MobiusSceneNode = require( 'MOBIUS/MobiusSceneNode' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );

  class DensityBuoyancyScreenView extends ScreenView {

    /**
     * @param {DensityBuoyancyModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      // @private {DensityBuoyancyModel}
      this.model = model;

      // @private {Array.<DemoMassNode>}
      this.massNodes = [];

      // @private {MobiusSceneNode}
      this.sceneNode = new MobiusSceneNode( this.layoutBounds, {

      } );
      this.addChild( this.sceneNode );

      // const onMassAdded = mass => {
      //   const massNode = new DemoMassNode( mass, this.modelViewTransform );
      //   this.addChild( massNode );
      //   this.massNodes.push( massNode );
      // };
      // model.masses.addItemAddedListener( onMassAdded );
      // model.masses.forEach( onMassAdded );

      // model.masses.addItemRemovedListener( mass => {
      //   const massNode = _.find( this.massNodes, massNode => massNode.mass === mass );
      //   this.removeChild( massNode );
      //   massNode.dispose();
      // } );

      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
        },
        right: this.layoutBounds.maxX - 10,
        bottom: this.layoutBounds.maxY - 10,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );
    }

    /**
     * @override
     * @param {number} width
     * @param {number} height
     */
    layout( width, height ) {
      super.layout( width, height );

      this.sceneNode.layout( width, height );
    }

    // @public
    step( dt ) {
      // const waterShape = Shape.bounds( this.modelViewTransform.modelToViewBounds( new Bounds2(
      //   this.model.poolBounds.minX, this.model.poolBounds.minY,
      //   this.model.poolBounds.maxX, this.model.liquidYProperty.value
      // ) ) );
      // this.waterPath.shape = waterShape;

      this.sceneNode.render( undefined );
    }
  }

  return densityBuoyancyCommon.register( 'DensityBuoyancyScreenView', DensityBuoyancyScreenView );
} );
