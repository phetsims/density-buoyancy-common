// Copyright 2019-2024, University of Colorado Boulder

/**
 * The base type for 3D views of any type of mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { MassTag } from '../model/Mass.js';
import Material from '../model/Material.js';
import DensityMaterials from './DensityMaterials.js';
import MaterialView from './MaterialView.js';
import { InteractiveHighlighting, KeyboardDragListener, Path } from '../../../../scenery/js/imports.js';
import { Shape } from '../../../../kite/js/imports.js';
import MassTagView from './MassTagView.js';
import ConvexHull2 from '../../../../dot/js/ConvexHull2.js';
import Vector2 from '../../../../dot/js/Vector2.js';

export type ModelPoint3ToViewPoint2 = ( point: Vector3 ) => Vector2;

export default abstract class MassView extends THREE.Mesh {

  public readonly mass: Mass;
  public materialView: MaterialView;
  private readonly materialListener: ( material: Material ) => void;
  private readonly positionListener: () => void;

  private readonly massTagView: MassTagView | null = null;
  protected readonly tagOffsetProperty: Property<Vector3> = new Property<Vector3>( Vector3.ZERO );

  public focusablePath: Path;

  protected constructor( mass: Mass, initialGeometry: THREE.BufferGeometry, modelToViewPoint: ModelPoint3ToViewPoint2 ) {
    const materialView = DensityMaterials.getMaterialView( mass.materialProperty.value );

    super( initialGeometry, materialView.material );

    this.mass = mass;
    this.materialView = materialView;

    this.material = materialView.material;

    this.materialListener = material => {
      this.materialView.dispose();
      this.materialView = DensityMaterials.getMaterialView( material );
      this.material = this.materialView.material;
    };
    this.mass.materialProperty.lazyLink( this.materialListener );

    if ( mass.tag !== MassTag.NONE ) {
      this.massTagView = new MassTagView( mass, this.tagOffsetProperty );
      this.add( this.massTagView );
    }

    this.focusablePath = new InteractiveHighlightingPath( new Shape(), {
      accessibleName: this.mass.nameProperty.value ? this.mass.nameProperty.value : 'Mass',
      cursor: 'pointer',
      tagName: 'div',
      focusable: true
    } );

    this.positionListener = () => {
      const position = mass.matrix.translation;

      // LHS is NOT a Vector2, don't try to simplify this
      this.position.x = position.x;
      this.position.y = position.y;

      if ( !this.focusablePath.isDisposed ) {

        const shiftedBbox = mass.getLocalBounds().shifted( position.toVector3() );

        const viewPoints = [
          modelToViewPoint( new Vector3( shiftedBbox.minX, shiftedBbox.minY, shiftedBbox.minZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.minX, shiftedBbox.minY, shiftedBbox.maxZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.minX, shiftedBbox.maxY, shiftedBbox.minZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.minX, shiftedBbox.maxY, shiftedBbox.maxZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.maxX, shiftedBbox.minY, shiftedBbox.minZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.maxX, shiftedBbox.minY, shiftedBbox.maxZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.maxX, shiftedBbox.maxY, shiftedBbox.minZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.maxX, shiftedBbox.maxY, shiftedBbox.maxZ ) )
        ];

        this.focusablePath.focusHighlight = this.focusablePath.shape = Shape.polygon( ConvexHull2.grahamScan( viewPoints, false ) );
      }
    };

    this.mass.transformedEmitter.addListener( this.positionListener );
    this.positionListener();

    // TODO: mass && mass.canMove && !mass.userControlledProperty.value as a starting condition? Basically this is a multi touch/pointer problem?
    // TODO: grab sound // Look into BASE, RAP, FEL for precedent
    // TODO: release sound
    // TODO: zoomed in dragging shouldn't get lost
    // TODO: invert Y so up is up (not down)

    this.focusablePath.addInputListener( {
      focus: () => {
        mass.startDrag( mass.matrix.translation );

        // TODO: Provide Property via parameter?
        this.screenView.currentMassProperty.value = mass;
      },
      blur: () => {
        mass.endDrag();
      }
    } );

    // TODO: Drag bounds
    const keyboardDragListener = new KeyboardDragListener( {
      dragDelta: 0.05, // TODO: a bit more tweaking probably
      shiftDragDelta: 0.025,
      drag: ( vectorDelta: Vector2 ) => {
        mass.updateDrag( mass.matrix.translation.add( vectorDelta ) );
      },
      start: () => { }, // TODO: anything here?
      end: () => { }
    } );

    mass.interruptedEmitter.addListener( () => {
      keyboardDragListener.interrupt();
    } );

    this.focusablePath.addInputListener( keyboardDragListener );
  }

  public get tagHeight(): number | null {
    return this.massTagView ? this.massTagView.tagHeight : null;
  }

  /**
   * Releases references.
   */
  public dispose(): void {
    this.mass.transformedEmitter.removeListener( this.positionListener );
    this.mass.materialProperty.unlink( this.materialListener );

    this.materialView.dispose();

    this.focusablePath.dispose();

    this.massTagView && this.massTagView.dispose();

    // @ts-expect-error
    super.dispose && super.dispose();
  }
}

/**
 * Intermediate class to create a Path with InteractiveHighlightingNode.
 */
class InteractiveHighlightingPath extends InteractiveHighlighting( Path ) {}

densityBuoyancyCommon.register( 'MassView', MassView );
