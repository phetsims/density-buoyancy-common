// Copyright 2024, University of Colorado Boulder

/**
 * BackgroundEventTargetListener supports dragging masses around the screen and changing the cursor when it is over a
 * draggable mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { Mouse, SceneryEvent, TInputListener } from '../../../../scenery/js/imports.js';
import grabSoundPlayer from '../../../../tambo/js/shared-sound-players/grabSoundPlayer.js';
import Plane3 from '../../../../dot/js/Plane3.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import releaseSoundPlayer from '../../../../tambo/js/shared-sound-players/releaseSoundPlayer.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Mass from '../model/Mass.js';
import PhetioAction from '../../../../tandem/js/PhetioAction.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import EventType from '../../../../tandem/js/EventType.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import MassView from './MassView.js';
import DensityBuoyancyScreenView from './DensityBuoyancyScreenView.js';
import DensityBuoyancyModel from '../model/DensityBuoyancyModel.js';
import ThreeIsometricNode from '../../../../mobius/js/ThreeIsometricNode.js';

export default class BackgroundEventTargetListener {

  // Using a "create" function here because that makes it easier to implement TInputListener
  public static create( massViews: MassView[],
                        getMassUnderPointer: DensityBuoyancyScreenView<DensityBuoyancyModel>['getMassUnderPointer'],
                        getRayFromScreenPoint: ThreeIsometricNode['getRayFromScreenPoint'],
                        modelToGlobalViewPoint: ( point: Vector3 ) => Vector2,
                        updateCursor: ( mouse: Mouse ) => void,
                        tandem: Tandem ): TInputListener {

    const draggedMasses: Mass[] = [];

    const startDragAction = new PhetioAction( ( mass: Mass, position: Vector2 ) => {
      mass.startDrag( position );
    }, {
      tandem: tandem.createTandem( 'startDragAction' ),
      phetioDocumentation: 'Starts the dragging of a mass',
      phetioReadOnly: true,
      phetioEventType: EventType.USER,
      parameters: [ {
        name: 'mass',
        phetioType: Mass.MassIO
      }, {
        name: 'position',
        phetioType: Vector2.Vector2IO
      } ]
    } );

    const updateDragAction = new PhetioAction( ( mass: Mass, position: Vector2 ) => {
      mass.updateDrag( position );
    }, {
      tandem: tandem.createTandem( 'updateDragAction' ),
      phetioDocumentation: 'Continues the dragging of a mass',
      phetioReadOnly: true,
      phetioEventType: EventType.USER,
      parameters: [ {
        name: 'mass',
        phetioType: Mass.MassIO
      }, {
        name: 'position',
        phetioType: Vector2.Vector2IO
      } ]
    } );

    const endDragAction = new PhetioAction( ( mass: Mass ) => {
      mass.endDrag();
    }, {
      tandem: tandem.createTandem( 'endDragAction' ),
      phetioDocumentation: 'Continues the dragging of a mass',
      phetioReadOnly: true,
      phetioEventType: EventType.USER,
      parameters: [ {
        name: 'mass',
        phetioType: Mass.MassIO
      } ]
    } );

    return {
      mousemove: event => {
        assert && assert( event.pointer instanceof Mouse );
        updateCursor( event.pointer as Mouse );
      },
      down: ( event: SceneryEvent<MouseEvent | TouchEvent | PointerEvent> ) => {
        if ( !event.canStartPress() ) { return; }

        const pointer = event.pointer;
        const isTouch = !( pointer instanceof Mouse );
        const mass = getMassUnderPointer( pointer, isTouch );

        if ( mass && mass.canMove ) {

          // Newer interactions take precedent, so clean up any old ones first. This also makes mouse/keyboard
          // cross-interaction much simpler.
          mass.interruptedEmitter.emit();

          grabSoundPlayer.play();

          const initialRay = getRayFromScreenPoint( pointer.point );
          const initialT = mass.intersect( initialRay, isTouch );
          if ( initialT === null ) {
            return;
          }
          const initialPosition = initialRay.pointAtDistance( initialT );
          const initialPlane = new Plane3( Vector3.Z_UNIT, initialPosition.z );

          startDragAction.execute( mass, initialPosition.toVector2() );
          pointer.cursor = 'pointer';

          const endDrag = () => {
            pointer.removeInputListener( listener );
            arrayRemove( draggedMasses, mass );
            mass.interruptedEmitter.removeListener( endDrag );
            pointer.cursor = null;
            releaseSoundPlayer.play();
            endDragAction.execute( mass );
          };
          const listener = {
            // end drag on either up or cancel (not supporting full cancel behavior)
            up: endDrag,
            cancel: endDrag,
            interrupt: endDrag,

            move: () => {
              const ray = getRayFromScreenPoint( pointer.point );
              const position = initialPlane.intersectWithRay( ray );

              updateDragAction.execute( mass, position.toVector2() );
            },

            createPanTargetBounds: () => {
              return draggedMasses.reduce( ( bounds: Bounds2, mass: Mass ): Bounds2 => {
                const massView = _.find( massViews, massView => massView.mass === mass )!;
                const bbox = new THREE.Box3().setFromObject( massView.massMesh );

                // Include all 8 corners of the bounding box
                bounds = bounds.withPoint( modelToGlobalViewPoint( new Vector3( bbox.min.x, bbox.min.y, bbox.min.z ) ) );
                bounds = bounds.withPoint( modelToGlobalViewPoint( new Vector3( bbox.min.x, bbox.min.y, bbox.max.z ) ) );
                bounds = bounds.withPoint( modelToGlobalViewPoint( new Vector3( bbox.min.x, bbox.max.y, bbox.min.z ) ) );
                bounds = bounds.withPoint( modelToGlobalViewPoint( new Vector3( bbox.min.x, bbox.max.y, bbox.max.z ) ) );
                bounds = bounds.withPoint( modelToGlobalViewPoint( new Vector3( bbox.max.x, bbox.min.y, bbox.min.z ) ) );
                bounds = bounds.withPoint( modelToGlobalViewPoint( new Vector3( bbox.max.x, bbox.min.y, bbox.max.z ) ) );
                bounds = bounds.withPoint( modelToGlobalViewPoint( new Vector3( bbox.max.x, bbox.max.y, bbox.min.z ) ) );
                bounds = bounds.withPoint( modelToGlobalViewPoint( new Vector3( bbox.max.x, bbox.max.y, bbox.max.z ) ) );

                return bounds;
              }, Bounds2.NOTHING );
            }
          };
          pointer.reserveForDrag();
          pointer.addInputListener( listener, true );
          draggedMasses.push( mass );

          mass.interruptedEmitter.addListener( endDrag );
        }
      },

      // Support interruption by subtree
      interrupt: () => {
        draggedMasses.slice().forEach( mass => mass.interruptedEmitter.emit() );
      }
    };
  }
}

densityBuoyancyCommon.register( 'BackgroundEventTargetListener', BackgroundEventTargetListener );