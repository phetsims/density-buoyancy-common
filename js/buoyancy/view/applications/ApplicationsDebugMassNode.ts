// Copyright 2024, University of Colorado Boulder
/**
 * Extends DebugView, which shows a 2d version of the model in a semi-transparent overlay. In this case, used for the
 * boat's shape.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import { DebugMassNode } from '../../../common/view/DebugView.js';
import DensityBuoyancyModel from '../../../common/model/DensityBuoyancyModel.js';
import Mass from '../../../common/model/Mass.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import Boat from '../../model/applications/Boat.js';
import { Path } from '../../../../../scenery/js/imports.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import { Shape } from '../../../../../kite/js/imports.js';
import Bounds2 from '../../../../../dot/js/Bounds2.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';

// constants
const scratchMatrix = new Matrix3();
const LINE_WIDTH = 0.1;

export default class ApplicationsDebugMassNode extends DebugMassNode {

  public constructor( private model: DensityBuoyancyModel, mass: Mass, private readonly modelViewTransform: ModelViewTransform2 ) {
    assert && assert( !!modelViewTransform, 'modelViewTransform must be provided' );

    super( mass, modelViewTransform );

    this.specialBoatCase( mass );
  }

  protected specialBoatCase( mass: Mass ): void {

    // Since this can be called from the super constructor,
    if ( mass instanceof Boat && this.modelViewTransform ) {
      const fluidPath = new Path( null, {
        fill: 'rgba(0,128,255,0.5)',
        stroke: 'black',
        lineWidth: LINE_WIDTH
      } );
      this.addChild( fluidPath );

      const hitPath = new Path( null, {
        stroke: 'red',
        pickable: false
      } );
      this.addChild( hitPath );

      const displacementListener = ( volume: number ) => {
        const matrix = scratchMatrix.set( this.modelViewTransform.getMatrix() );

        // Zero out the translation
        matrix.set02( 0 );
        matrix.set12( 0 );

        const multiplier = Math.pow( volume / 0.001, 1 / 3 );
        const basinShape = mass.basin.oneLiterShape.transformed( Matrix3.scaling( multiplier ) );

        hitPath.shape = basinShape.transformed( matrix );
      };
      mass.maxVolumeDisplacedProperty.link( displacementListener );
      this.disposeEmitter.addListener( () => {
        mass.maxVolumeDisplacedProperty.unlink( displacementListener );
      } );

      // @ts-expect-error
      const block = this.model.block;
      const fluidListener = () => {
        const y = mass.basin.fluidYInterpolatedProperty.value;

        if ( mass.basin.fluidVolumeProperty.value > 0 ) {
          const matrix = scratchMatrix.set( this.modelViewTransform.getMatrix() );

          // Zero out the translation
          matrix.set02( 0 );
          matrix.set12( 0 );

          const invertedMatrix = mass.matrix.inverted();

          const multiplier = Math.pow( mass.maxVolumeDisplacedProperty.value / 0.001, 1 / 3 );
          const basinShape = mass.basin.oneLiterShape.transformed( Matrix3.scaling( multiplier ) );
          const rectangleShape = Shape.bounds( new Bounds2( -10, -10, 10, y ) ).transformed( invertedMatrix );

          let fluidShape = rectangleShape.shapeIntersection( basinShape );

          // assume BuoyancyApplicationsModel
          try {
            const blockShape = block.shapeProperty.value.transformed( block.matrix ).transformed( invertedMatrix );
            fluidShape = fluidShape.shapeDifference( blockShape );
          }
          catch( e ) {
            console.log( e );
          }

          fluidPath.shape = fluidShape.transformed( matrix );
        }
        else {
          fluidPath.shape = null;
        }
      };
      mass.basin.fluidYInterpolatedProperty.link( fluidListener );
      block.shapeProperty.lazyLink( fluidListener );
      block.transformedEmitter.addListener( fluidListener );
      this.disposeEmitter.addListener( () => {
        mass.basin.fluidYInterpolatedProperty.unlink( fluidListener );
        block.shapeProperty.unlink( fluidListener );
        block.transformedEmitter.removeListener( fluidListener );
      } );
    }
  }

  protected override getPathForMass( mass: Mass, path: Path, intersectionPath: Path, shape: Shape, matrix: Matrix3 ): Path {
    if ( mass instanceof Boat ) {
      const multiplier = Math.pow( mass.maxVolumeDisplacedProperty.value / 0.001, 1 / 3 );
      const basinShape = mass.basin.oneLiterShape.transformed( Matrix3.scaling( multiplier ) );
      path.shape = shape.shapeDifference( basinShape ).transformed( matrix );
      intersectionPath.shape = shape.transformed( matrix );
    }
    else {
      path.shape = shape.transformed( matrix );
    }
    return path;
  }
}

densityBuoyancyCommon.register( 'ApplicationsDebugMassNode', ApplicationsDebugMassNode );