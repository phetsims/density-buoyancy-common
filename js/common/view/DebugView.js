// Copyright 2020, University of Colorado Boulder

/**
 * Shows a 2d version of the model, with assorted debugging information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const scratchMatrix = new Matrix3();

class DebugView extends Node {
  /**
   * @param {DensityBuoyancyModel} model
   * @param {Bounds2} layoutBounds
   */
  constructor( model, layoutBounds ) {
    super();

    // @private {DensityBuoyancyModel}
    this.model = model;

    // @private {Bounds2}
    this.layoutBounds = layoutBounds;

    // @private {ModelViewTransform2}
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, this.layoutBounds.center, 600 );

    this.addChild( Rectangle.bounds( layoutBounds, {
      fill: 'rgba(255,255,255,0.5)'
    } ) );

    // @private {Path}
    this.poolPath = new Path( null, {
      fill: 'rgba(0,128,255,0.5)',
      stroke: 'black'
    } );
    this.addChild( this.poolPath );

    // // @private {Path}
    // this.boatWaterPath = new Path( null, {
    //   fill: 'rgba(0,128,255,0.3)'
    // } );
    // this.addChild( this.boatWaterPath );

    const modelPoolShape = Shape.polygon( model.groundPoints );
    const viewPoolShape = this.modelViewTransform.modelToViewShape( modelPoolShape );

    this.addChild( new Path( viewPoolShape, {
      fill: 'rgba(161,101,47,0.5)',
      stroke: 'black'
    } ) );

    // @private {Array.<DebugMassNode>}
    this.massNodes = [];

    const onMassAdded = mass => {
      const massNode = new DebugMassNode( mass, this.modelViewTransform );
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

    // @private {Path}
    this.poolAreaPath = new Path( null, {
      stroke: 'red'
    } );
    this.addChild( this.poolAreaPath );

    // @private {Path}
    this.poolVolumePath = new Path( null, {
      stroke: 'green'
    } );
    this.addChild( this.poolVolumePath );
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    if ( !this.visible ) {
      return;
    }

    let poolShape = Shape.bounds( new Bounds2(
      this.model.poolBounds.minX, this.model.poolBounds.minY,
      this.model.poolBounds.maxX, this.model.pool.liquidYProperty.value
    ) );
    this.model.masses.forEach( mass => {
      try {
        poolShape = poolShape.shapeDifference( mass.shapeProperty.value.transformed( mass.matrix ) );
      } catch ( e ) {
        console.log( e );
      }
    } );
    poolShape = this.modelViewTransform.modelToViewShape( poolShape );
    this.poolPath.shape = poolShape;

    const poolYValues = _.range( this.model.pool.stepBottom, this.model.pool.stepTop, 0.002 );

    const poolAreaShape = new Shape();
    poolYValues.map( y => new Vector2( this.model.pool.getDisplacedArea( y ), y ) ).forEach( point => {
      poolAreaShape.lineTo( this.modelViewTransform.modelToViewX( this.model.pool.bounds.maxX ) + point.x * 2000, this.modelViewTransform.modelToViewY( point.y ) );
    } );
    this.poolAreaPath.shape = poolAreaShape;

    const poolVolumeShape = new Shape();
    poolYValues.map( y => new Vector2( this.model.pool.getDisplacedVolume( y ), y ) ).forEach( point => {
      poolVolumeShape.lineTo( this.modelViewTransform.modelToViewX( this.model.pool.bounds.maxX ) + point.x * 10000, this.modelViewTransform.modelToViewY( point.y ) );
    } );
    this.poolVolumePath.shape = poolVolumeShape;
  }
}

class DebugMassNode extends Node {
  /**
   * @param {Mass} mass
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( mass, modelViewTransform ) {
    super( {
      cursor: 'pointer'
    } );

    const path = new Path( null, {
      fill: 'rgba(160,255,100,0.5)',
      stroke: 'black'
    } );
    this.addChild( path );

    // @public {Mass}
    this.mass = mass;

    // @private {Emitter}
    this.disposeEmitter = new Emitter();

    const shapeListener = shape => {
      const matrix = scratchMatrix.set( modelViewTransform.getMatrix() );

      // Zero out the translation
      matrix.set02( 0 );
      matrix.set12( 0 );

      path.shape = shape.transformed( matrix );
    };
    mass.shapeProperty.link( shapeListener );
    this.disposeEmitter.addListener( () => {
      mass.shapeProperty.unlink( shapeListener );
    } );

    const transformListener = () => {
      const viewMatrix = scratchMatrix.set( modelViewTransform.getMatrix() ).multiplyMatrix( mass.matrix );
      this.translation = viewMatrix.translation;
      this.rotation = viewMatrix.rotation;
    };
    mass.transformedEmitter.addListener( transformListener );
    this.disposeEmitter.addListener( () => {
      mass.transformedEmitter.removeListener( transformListener );
    } );
    transformListener();

    // @public {DragListener}
    this.dragListener = new DragListener( {
      transform: modelViewTransform,
      applyOffset: false,
      start: ( event, listener ) => {
        mass.startDrag( listener.modelPoint );
      },
      drag: ( event, listener ) => {
        mass.updateDrag( listener.modelPoint );
      },
      end: ( event, listener ) => {
        mass.endDrag();
      }
    } );
    this.addInputListener( this.dragListener );
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.disposeEmitter.emit();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'DebugView', DebugView );
export default DebugView;