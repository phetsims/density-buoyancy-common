// Copyright 2019-2024, University of Colorado Boulder

/**
 * The 3D view for a Scale.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Scale from '../model/Scale.js';
import CuboidView from './CuboidView.js';
import MassView from './MassView.js';
import VerticalCylinderView from './VerticalCylinderView.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import ScaleReadoutNode from './ScaleReadoutNode.js';
import Gravity from '../model/Gravity.js';
import MassDecorationLayer from './MassDecorationLayer.js';
import { THREEModelViewTransform } from './DensityBuoyancyScreenView.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export default class ScaleView extends MassView {

  private readonly scaleGeometry: THREE.BufferGeometry;
  private readonly scaleReadoutNode: ScaleReadoutNode;

  public constructor( mass: Scale, modelViewTransform: THREEModelViewTransform, dragBoundsProperty: TReadOnlyProperty<Bounds3>,
                      gravityProperty: TReadOnlyProperty<Gravity> ) {

    const scaleGeometry = ScaleView.getScaleGeometry();
    super( mass, scaleGeometry, modelViewTransform, dragBoundsProperty );

    this.scaleGeometry = scaleGeometry;
    this.scaleReadoutNode = new ScaleReadoutNode( mass, gravityProperty );

    // Update the decoration layer when phet-io state is set
    const updateDecorationLayer = () => this.updateDecorationLayer();
    if ( Tandem.PHET_IO_ENABLED ) {
      phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener( updateDecorationLayer );
      this.disposeEmitter.addListener( () => {
        phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.removeListener( updateDecorationLayer );
      } );
    }

    updateDecorationLayer();
  }

  public override decorate( decorationLayer: MassDecorationLayer ): void {
    super.decorate( decorationLayer );

    decorationLayer.scaleReadoutLayer.addChild( this.scaleReadoutNode );
  }

  private updateDecorationLayer(): void {
    const withOffsetPoint = this.scaleReadoutNode.mass.matrix.translation.toVector3().plus( Scale.SCALE_FRONT_OFFSET );
    this.scaleReadoutNode.translation = this.modelViewTransform.modelToViewPoint( withOffsetPoint );
  }

  public override step( dt: number ): void {
    super.step( dt );

    this.updateDecorationLayer();
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.scaleGeometry.dispose();

    super.dispose();

    this.scaleReadoutNode.dispose();
  }

  /**
   * Returns the geometry used for the scale
   */
  public static getScaleGeometry(): THREE.BufferGeometry {
    const cuboidElements = 18 * 3;
    const cylinderElements = 12 * 64;
    const numElements = cuboidElements + cylinderElements;

    const positionArray = new Float32Array( numElements * 3 );
    const normalArray = new Float32Array( numElements * 3 );
    const uvArray = new Float32Array( numElements * 2 );

    const topOffset = new Vector3(
      0,
      ( Scale.SCALE_HEIGHT - Scale.SCALE_TOP_HEIGHT ) / 2,
      0
    );

    CuboidView.updateArrays( positionArray, normalArray, uvArray, Scale.SCALE_BASE_BOUNDS );
    VerticalCylinderView.updateArrays( positionArray, normalArray, uvArray, Scale.SCALE_WIDTH / 2, Scale.SCALE_TOP_HEIGHT, cuboidElements, topOffset );

    const scaleGeometry = new THREE.BufferGeometry();
    scaleGeometry.addAttribute( 'position', new THREE.BufferAttribute( positionArray, 3 ) );
    scaleGeometry.addAttribute( 'normal', new THREE.BufferAttribute( normalArray, 3 ) );
    scaleGeometry.addAttribute( 'uv', new THREE.BufferAttribute( uvArray, 2 ) );

    return scaleGeometry;
  }
}

densityBuoyancyCommon.register( 'ScaleView', ScaleView );