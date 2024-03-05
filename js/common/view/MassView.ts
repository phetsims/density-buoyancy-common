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
import { InteractiveHighlighting, KeyboardDragListener, Path } from '../../../../scenery/js/imports.js';
import { Shape } from '../../../../kite/js/imports.js';
import MassTagView from './MassTagView.js';
import ConvexHull2 from '../../../../dot/js/ConvexHull2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import MappedProperty from '../../../../axon/js/MappedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import MassTag from '../model/MassTag.js';
import grabSoundPlayer from '../../../../tambo/js/shared-sound-players/grabSoundPlayer.js';
import releaseSoundPlayer from '../../../../tambo/js/shared-sound-players/releaseSoundPlayer.js';

export type ModelPoint3ToViewPoint2 = ( point: Vector3 ) => Vector2;

const INVERT_Y_TRANSFORM = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, Vector2.ZERO, 1 );

export default abstract class MassView extends THREE.Mesh {

  public readonly mass: Mass;
  public materialView: MaterialView;
  private readonly materialListener: ( material: Material ) => void;
  private readonly positionListener: () => void;

  private readonly massTagView: MassTagView | null = null;
  protected readonly tagOffsetProperty: Property<Vector3> = new Property<Vector3>( Vector3.ZERO );

  public readonly focusablePath: Path | null;

  protected constructor( mass: Mass, initialGeometry: THREE.BufferGeometry, modelToViewPoint: ModelPoint3ToViewPoint2,
                         dragBoundsProperty: TReadOnlyProperty<Bounds3> ) {
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

    this.positionListener = () => {
      const position = mass.matrix.translation;

      // LHS is NOT a Vector2, don't try to simplify this
      this.position.x = position.x;
      this.position.y = position.y;

      if ( this.focusablePath && !this.focusablePath.isDisposed ) {

        const shiftedBbox = mass.getLocalBounds().shifted( position.toVector3() );

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
    };

    this.focusablePath = null;

    if ( mass.canMove ) {

      this.focusablePath = new InteractiveHighlightingPath( new Shape(), {
        accessibleName: this.mass.nameProperty.value ? this.mass.nameProperty.value : 'Mass',
        cursor: 'pointer',
        tagName: 'div',
        focusable: true
      } );

      this.focusablePath.addInputListener( {
        focus: () => {
          mass.startDrag( mass.matrix.translation );
        },
        blur: () => {
          mass.endDrag();
        }
      } );

      const keyboardDragListener = new KeyboardDragListener( {
        // In model units per second
        dragSpeed: 3,
        shiftDragSpeed: 0.5,

        // This is needed for keyboard but not for mouse/touch because keyboard input applies deltas, not absolute positions
        transform: INVERT_Y_TRANSFORM,
        dragBoundsProperty: new MappedProperty( dragBoundsProperty, { map: bounds3 => Bounds2.create( bounds3 ) } ),
        drag: ( vectorDelta: Vector2 ) => {
          mass.updateDrag( mass.matrix.translation.add( vectorDelta ) );
        },
        start: () => grabSoundPlayer.play(),
        end: () => releaseSoundPlayer.play(),

        tandem: Tandem.OPT_OUT
      } );

      mass.interruptedEmitter.addListener( () => {
        keyboardDragListener.interrupt();
      } );

      this.focusablePath.addInputListener( keyboardDragListener );
    }

    this.mass.transformedEmitter.addListener( this.positionListener );
    this.positionListener();
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

    this.focusablePath && this.focusablePath.dispose();

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
