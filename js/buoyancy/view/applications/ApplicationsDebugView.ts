// Copyright 2024, University of Colorado Boulder
/**
 * ApplicationsDebugView extends DebugView, which shows a 2d version of the model in a semi-transparent overlay.
 * In this case, used for the boat's shape.
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
import ApplicationsDebugMassNode from './ApplicationsDebugMassNode.js';

export default class ApplicationsDebugView extends DebugView {

  // Path illustrating displaced area of the boat with a red stroke.
  // proportional to the area at that level that is displaced in the boat
  private readonly boatAreaPath: Path;

  // Path illustrating displaced volume of the boat with a green stroke.
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

    // Special handling for the boat, but only if it is visible
    const boat = this.model.visibleMasses.find( mass => mass instanceof Boat );
    if ( boat instanceof Boat ) {

      // Range of y-values to evaluate displacement
      const boatYValues = _.range( boat.stepBottom, boat.stepTop, 0.002 );

      // Finding the visual node associated with the boat mass
      const boatNode = _.find( this.massNodes, massNode => massNode.mass === boat )!;

      // Create a boat area shape based on displaced area at each evaluated y level
      const boatAreaShape = new Shape();
      boatYValues.map( y => new Vector2( boat.basin.getDisplacedArea( y ), y ) ).forEach( point => {
        boatAreaShape.lineTo( boatNode.right + point.x * 2000, this.modelViewTransform.modelToViewY( point.y ) );
      } );
      this.boatAreaPath.shape = boatAreaShape;

      // Create a boat volume shape based on displaced volume at each evaluated y level
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

densityBuoyancyCommon.register( 'ApplicationsDebugView', ApplicationsDebugView );