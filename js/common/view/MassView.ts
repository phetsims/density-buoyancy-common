// Copyright 2019-2024, University of Colorado Boulder

/**
 * The base type for 3D views of any type of mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass from '../model/Mass.js';
import Material from '../model/Material.js';
import DensityMaterials from './DensityMaterials.js';
import MaterialView from './MaterialView.js';
import { InteractiveHighlighting, KeyboardDragListener, Node, Path } from '../../../../scenery/js/imports.js';
import { Shape } from '../../../../kite/js/imports.js';
import MassTagNode from './MassTagNode.js';
import ConvexHull2 from '../../../../dot/js/ConvexHull2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import grabSoundPlayer from '../../../../tambo/js/shared-sound-players/grabSoundPlayer.js';
import releaseSoundPlayer from '../../../../tambo/js/shared-sound-players/releaseSoundPlayer.js';
import { MassDecorationLayer } from './DensityBuoyancyScreenView.js';
import Disposable from '../../../../axon/js/Disposable.js';
import { TReadOnlyEmitter } from '../../../../axon/js/TEmitter.js';
import MassTag from '../model/MassTag.js';

export type ModelPoint3ToViewPoint2 = ( point: Vector3 ) => Vector2;

const INVERT_Y_TRANSFORM = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, Vector2.ZERO, 1 );

// TODO: It would be clearer if the class that extends "Mesh" was named as such, and composed in the class, https://github.com/phetsims/buoyancy/issues/117
export default abstract class MassView extends THREE.Mesh {

  // TODO: once we change the supertype to compose, please extend Disposable, https://github.com/phetsims/buoyancy/issues/117
  private disposable = new Disposable();
  public readonly disposeEmitter: TReadOnlyEmitter;

  public readonly mass: Mass;
  public materialView: MaterialView;
  private readonly materialListener: ( material: Material ) => void;
  private readonly positionListener: () => void;

  private readonly massTagNode: Node | null = null;
  protected readonly tagOffsetProperty: Property<Vector3> = new Property<Vector3>( Vector3.ZERO );

  public readonly focusablePath: Path | null;

  protected constructor( mass: Mass, initialGeometry: THREE.BufferGeometry,
                         protected readonly modelToViewPoint: ModelPoint3ToViewPoint2,
                         dragBoundsProperty: TReadOnlyProperty<Bounds3> ) {
    const materialView = DensityMaterials.getMaterialView( mass.materialProperty.value );

    super( initialGeometry, materialView.material );
    this.disposeEmitter = this.disposable.disposeEmitter;

    this.mass = mass;
    this.materialView = materialView;

    this.material = materialView.material;

    this.materialListener = material => {
      this.materialView.dispose();
      this.materialView = DensityMaterials.getMaterialView( material );
      this.material = this.materialView.material;
    };
    this.mass.materialProperty.lazyLink( this.materialListener );

    const repositionMassTagNode = () => {
      assert && assert( this.massTagNode, 'do not reposition massTagNode if you do not have a massTag' );
      this.massTagNode!.translation = this.modelToViewPoint( mass.matrix.translation.toVector3().plus( this.tagOffsetProperty.value ).plusXYZ( 0, 0, 0.0001 ) );
    };

    if ( mass.tag !== MassTag.NONE ) {
      this.massTagNode = new MassTagNode( this.mass.tag );
      this.tagOffsetProperty.lazyLink( repositionMassTagNode );
      this.disposeEmitter.addListener( () => this.tagOffsetProperty.unlink( repositionMassTagNode ) );
    }

    this.positionListener = () => {
      const position = mass.matrix.translation;

      // LHS is NOT a Vector2, don't try to simplify this
      this.position.x = position.x;
      this.position.y = position.y;

      if ( this.focusablePath && !this.focusablePath.isDisposed ) {

        const shiftedBbox = mass.getBounds();

        // To support dragging while zoomed in, KeyboardDragListener will keep the position of the focusablePath in view.
        this.focusablePath.center = modelToViewPoint( shiftedBbox.center );

        // The points that make up the corners of the Bounds3 in THREE.js space, applied onto a 2d plane for scenery.
        const massViewPoints = [
          modelToViewPoint( new Vector3( shiftedBbox.minX, shiftedBbox.minY, shiftedBbox.minZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.minX, shiftedBbox.minY, shiftedBbox.maxZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.minX, shiftedBbox.maxY, shiftedBbox.minZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.minX, shiftedBbox.maxY, shiftedBbox.maxZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.maxX, shiftedBbox.minY, shiftedBbox.minZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.maxX, shiftedBbox.minY, shiftedBbox.maxZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.maxX, shiftedBbox.maxY, shiftedBbox.minZ ) ),
          modelToViewPoint( new Vector3( shiftedBbox.maxX, shiftedBbox.maxY, shiftedBbox.maxZ ) )
        ];

        // Update the shape based on the current view of the mass in 3d space
        this.focusablePath.focusHighlight = this.focusablePath.shape = Shape.polygon( ConvexHull2.grahamScan( massViewPoints, false ) );
      }

      this.massTagNode && repositionMassTagNode();
    };

    this.focusablePath = null;

    if ( mass.canMove ) {

      this.focusablePath = new InteractiveHighlightingPath( new Shape(), {
        accessibleName: this.mass.nameProperty.value ? this.mass.nameProperty.value : 'Mass',
        cursor: 'pointer',
        tagName: 'div',
        focusable: true
      } );
      const endKeyboardInteraction = () => {
        keyboardDragListener.interrupt();
        mass.interruptedEmitter.removeListener( endKeyboardInteraction );
        this.focusablePath!.removeInputListener( blurListener );
        releaseSoundPlayer.play();
        mass.endDrag();
      };

      const blurListener = {
        blur: endKeyboardInteraction
      };

      this.focusablePath.addInputListener( {
        focus: () => {

          // We want the newer interaction to take precedent, so tabbing to the item should interrupt the previous mouse drag (if applicable).
          mass.userControlledProperty.value && mass.interruptedEmitter.emit();

          mass.interruptedEmitter.addListener( endKeyboardInteraction );
          this.focusablePath!.addInputListener( blurListener );
          grabSoundPlayer.play();
          mass.startDrag( mass.matrix.translation );
        }
      } );

      const keyboardDragListener = new KeyboardDragListener( {
        // In model units per second
        dragSpeed: 3,
        shiftDragSpeed: 0.5,

        // This is needed for keyboard but not for mouse/touch because keyboard input applies deltas, not absolute positions
        transform: INVERT_Y_TRANSFORM,
        drag: ( vectorDelta: Vector2 ) => {
          mass.updateDrag( mass.matrix.translation.add( vectorDelta ) );
        },
        tandem: Tandem.OPT_OUT
      } );

      this.focusablePath.addInputListener( keyboardDragListener );
    }

    this.mass.transformedEmitter.addListener( this.positionListener );
    this.positionListener();
  }

  public get tagHeight(): number | null {
    // return this.massTagNode ? this.massTagNode.height : null;
    return 0.03; // TODO: view-> model coords would be nice. https://github.com/phetsims/density-buoyancy-common/issues/113
  }

  // Override in subclasses to add subclass-specific behavior
  public step( dt: number ): void {

    // no-op by default
  }

  /**
   * Called after construction of the MassView, for supporting adding supplemental, non-THREE content to the screen view to render the Mass.
   */
  public decorate( decorationLayer: MassDecorationLayer ): void {

    this.massTagNode && decorationLayer.massTagsLayer.addChild( this.massTagNode );
  }

  /**
   * Releases references.
   */
  public dispose(): void {
    this.mass.transformedEmitter.removeListener( this.positionListener );
    this.mass.materialProperty.unlink( this.materialListener );

    this.materialView.dispose();

    this.focusablePath && this.focusablePath.dispose();

    this.massTagNode && this.massTagNode.dispose();

    this.disposable.dispose();
    // @ts-expect-error
    super.dispose && super.dispose();
  }
}

/**
 * Intermediate class to create a Path with InteractiveHighlightingNode.
 */
class InteractiveHighlightingPath extends InteractiveHighlighting( Path ) {}

densityBuoyancyCommon.register( 'MassView', MassView );