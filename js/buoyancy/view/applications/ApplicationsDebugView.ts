// Copyright 2024, University of Colorado Boulder
/**
 * Extends DebugView, which shows a 2d version of the model. In this case, used for the boat's shape.
 * TODO: Document how to show the debug view here. see https://github.com/phetsims/density-buoyancy-common/issues/257
 * TODO: This file is overly-complicated and under-documented, see https://github.com/phetsims/density-buoyancy-common/issues/123
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DebugView, { DebugMassNode } from '../../../common/view/DebugView.js';
import { Path } from '../../../../../scenery/js/imports.js';
import BuoyancyApplicationsModel from '../../model/applications/BuoyancyApplicationsModel.js';
import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Boat from '../../model/applications/Boat.js';
import { Shape } from '../../../../../kite/js/imports.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import DensityBuoyancyModel from '../../../common/model/DensityBuoyancyModel.js';
import Mass from '../../../common/model/Mass.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';

// constants
const scratchMatrix = new Matrix3();
const LINE_WIDTH = 0.1;

export default class ApplicationsDebugView extends DebugView {

  // proportional to the area at that level that is displaced in the boat
  private readonly boatAreaPath: Path;

  // proportional to the volume up to that level that is displaced in the boat
  private readonly boatVolumePath: Path;

  public constructor( model: BuoyancyApplicationsModel, layoutBounds: Bounds2 ) {
    super( model, layoutBounds );

    this.boatAreaPath = new Path( null, {
      stroke: 'red'
    } );
    this.addChild( this.boatAreaPath );

    this.boatVolumePath = new Path( null, {
      stroke: 'green'
    } );
    this.addChild( this.boatVolumePath );
  }

  /**
   * Steps forward in time.
   */
  public override step( dt: number ): void {
    super.step( dt );

    // TODO: Change this to say this.applicationsModel.boat instead of searches and instanceof operations, see https://github.com/phetsims/density-buoyancy-common/issues/123
    const boat = this.model.masses.find( mass => mass instanceof Boat );
    if ( boat instanceof Boat ) {
      const boatYValues = _.range( boat.stepBottom, boat.stepTop, 0.002 );

      const boatNode = _.find( this.massNodes, massNode => massNode.mass === boat )!;

      const boatAreaShape = new Shape();
      boatYValues.map( y => new Vector2( boat.basin.getDisplacedArea( y ), y ) ).forEach( point => {
        boatAreaShape.lineTo( boatNode.right + point.x * 2000, this.modelViewTransform.modelToViewY( point.y ) );
      } );
      this.boatAreaPath.shape = boatAreaShape;

      const boatVolumeShape = new Shape();
      boatYValues.map( y => new Vector2( boat.basin.getDisplacedVolume( y ), y ) ).forEach( point => {
        boatVolumeShape.lineTo( boatNode.right + point.x * 10000, this.modelViewTransform.modelToViewY( point.y ) );
      } );
      this.boatVolumePath.shape = boatVolumeShape;
    }
    else {
      this.boatAreaPath.shape = null;
      this.boatVolumePath.shape = null;
    }
  }

  protected override createDebugMassNode( model: DensityBuoyancyModel, mass: Mass, modelViewTransform: ModelViewTransform2 ): DebugMassNode {
    return new ApplicationsDebugMassNode( model, mass, modelViewTransform );
  }

  protected override mutatePoolShape( mass: Mass, poolShape: Shape ): Shape {
    try {
      poolShape = poolShape.shapeDifference( mass.shapeProperty.value.transformed( mass.matrix ) );
      if ( mass instanceof Boat ) {
        const multiplier = Math.pow( mass.maxVolumeDisplacedProperty.value / 0.001, 1 / 3 );
        poolShape = poolShape.shapeDifference( mass.basin.oneLiterShape.transformed( Matrix3.scaling( multiplier ) ).transformed( mass.matrix ) );
      }
    }
    catch( e ) {
      console.log( e );
    }
    return poolShape;
  }
}

class ApplicationsDebugMassNode extends DebugMassNode {

  public constructor( private model: DensityBuoyancyModel, mass: Mass, private modelViewTransform: ModelViewTransform2 ) {
    super( model, mass, modelViewTransform );
  }

  protected override specialBoatCase( mass: Mass ): void {
    if ( mass instanceof Boat ) {
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

  protected override boatShapeListener( mass: Mass, path: Path, intersectionPath: Path, shape: Shape, matrix: Matrix3 ): Path {
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

densityBuoyancyCommon.register( 'ApplicationsDebugView', ApplicationsDebugView );