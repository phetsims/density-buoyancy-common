// Copyright 2024, University of Colorado Boulder

/**
 * MeasurableMassView adds visual decorations such as the mass label and force diagram layer.
 *
 * Note the ScaleView is a sibling of this class, and does not show these decorations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import MassView, { ModelPoint3ToViewPoint2 } from './MassView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass from '../model/Mass.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import { MassDecorationLayer } from './DensityBuoyancyScreenView.js';
import ForceDiagramNode from './ForceDiagramNode.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import MassLabelNode from './MassLabelNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';

const scratchVector2 = new Vector2( 0, 0 );

export default class MeasurableMassView extends MassView {

  private readonly forceDiagramNode: ForceDiagramNode;
  private readonly massLabelNode: MassLabelNode;

  protected constructor( mass: Mass, initialGeometry: THREE.BufferGeometry,
                         modelToViewPoint: ModelPoint3ToViewPoint2,
                         dragBoundsProperty: TReadOnlyProperty<Bounds3>,
                         showGravityForceProperty: TReadOnlyProperty<boolean>,
                         showBuoyancyForceProperty: TReadOnlyProperty<boolean>,
                         showContactForceProperty: TReadOnlyProperty<boolean>,
                         showForceValuesProperty: TReadOnlyProperty<boolean>,
                         forceScaleProperty: TReadOnlyProperty<number>,
                         showMassesProperty: TReadOnlyProperty<boolean> ) {

    super( mass, initialGeometry, modelToViewPoint, dragBoundsProperty );

    this.forceDiagramNode = new ForceDiagramNode(
      mass,
      showGravityForceProperty,
      showBuoyancyForceProperty,
      showContactForceProperty,
      showForceValuesProperty,
      forceScaleProperty
    );

    this.massLabelNode = new MassLabelNode( mass, showMassesProperty );
  }

  public override step( dt: number ): void {
    this.forceDiagramNode.update();

    const modelOrigin = this.mass.matrix.translation.toVector3().plus( this.mass.forceOffsetProperty.value );
    const viewOrigin = this.modelToViewPoint( modelOrigin );

    this.forceDiagramNode.matrix = Matrix3.rowMajor(
      1, 0, viewOrigin.x,
      0, 1, viewOrigin.y,
      0, 0, 1
    );

    const modelPoint = this.modelToViewPoint( this.mass.matrix.translation.toVector3().plus( this.mass.massLabelOffsetProperty.value ) );
    const offsetPoint = scratchVector2.setXY( this.massLabelNode.width / 2, this.massLabelNode.height / 2 ).componentMultiply( this.mass.massLabelOffsetOrientationProperty.value );
    this.massLabelNode.translation = modelPoint.plus( offsetPoint );
  }

  public override decorate( decorationLayer: MassDecorationLayer ): void {
    super.decorate( decorationLayer );

    decorationLayer.forceDiagramLayer.addChild( this.forceDiagramNode );
    decorationLayer.massLabelLayer.addChild( this.massLabelNode );
  }

  public override dispose(): void {
    super.dispose();

    // also removes from the parent
    this.forceDiagramNode.dispose();
    this.massLabelNode.dispose();
  }
}

densityBuoyancyCommon.register( 'MeasurableMassView', MeasurableMassView );