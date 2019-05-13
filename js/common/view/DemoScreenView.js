// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const DemoMassNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DemoMassNode' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Path = require( 'SCENERY/nodes/Path' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  class DemoScreenView extends ScreenView {

    /**
     * @param {DensityBuoyancyModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      const scale = 75;

      // @private {DensityBuoyancyModel}
      this.model = model;

      // @private {ModelViewTransform2}
      this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, this.layoutBounds.center, scale );

      // @private {Path}
      this.waterPath = new Path( null, {
        fill: 'rgba(0,128,255,0.3)'
      } );
      this.addChild( this.waterPath );

      const modelPoolShape = Shape.polygon( model.groundPoints );
      const viewPoolShape = this.modelViewTransform.modelToViewShape( modelPoolShape );

      this.addChild( new Path( viewPoolShape, {
        stroke: 'black'
      } ) );

      // @private {Array.<DemoMassNode>}
      this.massNodes = [];

      const onMassAdded = mass => {
        const massNode = new DemoMassNode( mass, this.modelViewTransform );
        this.addChild( massNode );
        this.massNodes.push( massNode );
      };
      model.masses.addItemAddedListener( onMassAdded );
      model.masses.forEach( onMassAdded );

      model.masses.addItemRemovedListener( mass => {
        const massNode = _.find( this.massNodes, massNode => massNode.mass === mass );
        this.removeChild( massNode );
        massNode.dispose();
      } );

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

    // @public
    step( dt ) {
      const waterShape = Shape.bounds( this.modelViewTransform.modelToViewBounds( new Bounds2(
        this.model.poolBounds.minX, this.model.poolBounds.minY,
        this.model.poolBounds.maxX, this.model.liquidYProperty.value
      ) ) );
      this.waterPath.shape = waterShape;
    }
  }

  return densityBuoyancyCommon.register( 'DemoScreenView', DemoScreenView );
} );
