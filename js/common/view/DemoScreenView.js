// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  class DemoScreenView extends ScreenView {

    /**
     * @param {DemoModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      const scale = 0.75;

      // @private {DemoModel}
      this.model = model;

      // @private {ModelViewTransform2}
      this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, this.layoutBounds.center, scale );

      const modelPoolShape = Shape.polygon( [
        new Vector2( model.farLeftX, model.groundY ),
        new Vector2( model.leftX, model.groundY ),
        new Vector2( model.leftX, model.poolY ),
        new Vector2( model.rightX, model.poolY ),
        new Vector2( model.rightX, model.groundY ),
        new Vector2( model.farRightX, model.groundY ),
        new Vector2( model.farRightX, model.farBelow ),
        new Vector2( model.farLeftX, model.farBelow )
      ] );
      const viewPoolShape = this.modelViewTransform.modelToViewShape( modelPoolShape );

      this.mobile1 = Rectangle.bounds( new Bounds2( -50 * scale, -50 * scale, 50 * scale, 50 * scale ), { stroke: 'red' } );
      this.addChild( this.mobile1 );
      // TODO: init

      this.addChild( new Path( viewPoolShape, {
        stroke: 'black'
      } ) );

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
      this.mobile1.rotation = -this.model.mobileBodies[ 0 ].angle;
      const position = this.model.mobileBodies[ 0 ].position;
      this.mobile1.translation = this.modelViewTransform.modelToViewPosition( new Vector2( position.x, position.y ) );
      //TODO Handle view animation here.
    }
  }

  return densityBuoyancyCommon.register( 'DemoScreenView', DemoScreenView );
} );
