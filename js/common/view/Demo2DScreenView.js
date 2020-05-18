// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DemoMassNode from './DemoMassNode.js';

class Demo2DScreenView extends ScreenView {

  /**
   * @param {DensityBuoyancyModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super();

    const scale = 600;

    // @private {DensityBuoyancyModel}
    this.model = model;

    // @private {ModelViewTransform2}
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, this.layoutBounds.center, scale );

    // @private {Path}
    this.waterPath = new Path( null, {
      fill: 'rgba(0,128,255,0.3)'
    } );
    this.addChild( this.waterPath );

    // @private {Path}
    this.boatWaterPath = new Path( null, {
      fill: 'rgba(0,128,255,0.3)'
    } );
    this.addChild( this.boatWaterPath );

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

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.waterPath.shape = Shape.bounds( this.modelViewTransform.modelToViewBounds( new Bounds2(
      this.model.poolBounds.minX, this.model.poolBounds.minY,
      this.model.poolBounds.maxX, this.model.pool.liquidYProperty.value
    ) ) );
  }
}

densityBuoyancyCommon.register( 'Demo2DScreenView', Demo2DScreenView );
export default Demo2DScreenView;