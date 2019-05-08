// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const Emitter = require( 'AXON/Emitter' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );

  // constants
  const scratchMatrix = new Matrix3();

  class DemoMassNode extends Node {

    /**
     * @param {Mass} mass
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( mass, modelViewTransform ) {
      super( {
        cursor: 'pointer'
      } );

      const path = new Path( null, {
        fill: '#aaa',
        stroke: 'red'
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

  return densityBuoyancyCommon.register( 'DemoMassNode', DemoMassNode );
} );
