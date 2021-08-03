// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main base ScreenView for all Density/Buoyancy screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Action from '../../../../axon/js/Action.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Plane3 from '../../../../dot/js/Plane3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import TextureQuad from '../../../../mobius/js/TextureQuad.js';
import ThreeIsometricNode from '../../../../mobius/js/ThreeIsometricNode.js';
import ThreeStage from '../../../../mobius/js/ThreeStage.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Mouse from '../../../../scenery/js/input/Mouse.js';
import animatedPanZoomSingleton from '../../../../scenery/js/listeners/animatedPanZoomSingleton.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import EventType from '../../../../tandem/js/EventType.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Boat from '../../buoyancy/model/Boat.js';
import BoatDesign from '../../buoyancy/model/BoatDesign.js';
import Bottle from '../../buoyancy/model/Bottle.js';
import BoatView from '../../buoyancy/view/BoatView.js';
import BottleView from '../../buoyancy/view/BottleView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import Cone from '../model/Cone.js';
import Cuboid from '../model/Cuboid.js';
import Ellipsoid from '../model/Ellipsoid.js';
import HorizontalCylinder from '../model/HorizontalCylinder.js';
import Mass from '../model/Mass.js';
import Scale from '../model/Scale.js';
import VerticalCylinder from '../model/VerticalCylinder.js';
import ConeView from './ConeView.js';
import CuboidView from './CuboidView.js';
import DebugView from './DebugView.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import DensityMaterials from './DensityMaterials.js';
import EllipsoidView from './EllipsoidView.js';
import ForceDiagramNode from './ForceDiagramNode.js';
import HorizontalCylinderView from './HorizontalCylinderView.js';
import MassLabelNode from './MassLabelNode.js';
import ScaleReadoutNode from './ScaleReadoutNode.js';
import ScaleView from './ScaleView.js';
import VerticalCylinderView from './VerticalCylinderView.js';
import WaterLevelIndicator from './WaterLevelIndicator.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;
const scratchVector2 = new Vector2( 0, 0 );

class DensityBuoyancyScreenView extends ScreenView {
  /**
   * @param {DensityBuoyancyModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {

    options = merge( {
      cameraPosition: new Vector3( 0, 0.4, 2 ),
      cameraZoom: 1.7,
      cameraLookAt: new Vector3( 0, -0.1, 0 )
    }, options );

    super( {
      preventFit: true,
      tandem: tandem
    } );

    // @protected {boolean} - If we detect that we can't use WebGL, we'll set this to false so we can bail out.
    this.enabled = true;

    if ( !ThreeUtils.isWebGLEnabled() ) {
      ThreeUtils.showWebGLWarning( this );
      this.enabled = false;
      return;
    }

    // @protected {DensityBuoyancyModel}
    this.model = model;

    // @protected {Node}
    this.popupLayer = new Node();

    // @protected {Property.<Mass|null>} - Support controlling or changing the latest-touched mass in certain demos.
    this.currentMassProperty = new Property( model.masses.length > 0 ? model.masses.get( 0 ) : null, {
      tandem: Tandem.OPT_OUT
    } );

    // @private {Rectangle} - The sky background, in a unit 0-to-1 rectangle (so we can scale it to match)
    this.backgroundNode = new Rectangle( 0, 0, 1, 1, {
      fill: new LinearGradient( 0, 0, 0, 1 )
        .addColorStop( 0, DensityBuoyancyCommonColors.skyTopProperty )
        .addColorStop( 1, DensityBuoyancyCommonColors.skyBottomProperty )
    } );
    this.visibleBoundsProperty.link( visibleBounds => {
      this.backgroundNode.translation = visibleBounds.leftTop;
      this.backgroundNode.setScaleMagnitude( visibleBounds.width, visibleBounds.height / 2 );
    } );
    this.addChild( this.backgroundNode );

    // @protected {Node}
    this.backgroundLayer = new Node();
    this.addChild( this.backgroundLayer );

    // @private {ThreeIsometricNode}
    this.sceneNode = new ThreeIsometricNode( this.layoutBounds, {
      parentMatrixProperty: animatedPanZoomSingleton.listener.matrixProperty,
      cameraPosition: options.cameraPosition
    } );
    this.addChild( this.sceneNode );

    // @private {Node}
    this.scaleReadoutLayer = new Node();
    this.addChild( this.scaleReadoutLayer );

    // @private {Node}
    this.massLabelLayer = new Node();
    this.addChild( this.massLabelLayer );

    // @private {Node}
    this.forceDiagramLayer = new Node();
    this.addChild( this.forceDiagramLayer );

    // @private {Array.<MassView>}
    this.massViews = [];

    // @private {Array.<ScaleReadoutNode>}
    this.scaleReadoutNodes = [];

    // @private {Array.<ForceDiagramNode>}
    this.forceDiagramNodes = [];

    // @private {Array.<MassLabelNode>}
    this.massLabelNodes = [];

    this.sceneNode.stage.threeCamera.zoom = options.cameraZoom;
    this.sceneNode.stage.threeCamera.updateProjectionMatrix();
    this.sceneNode.stage.threeCamera.up = new THREE.Vector3( 0, 0, -1 );
    this.sceneNode.stage.threeCamera.lookAt( ThreeUtils.vectorToThree( options.cameraLookAt ) );

    // TODO: How can we invalidate this on zooms?
    this.sceneNode.backgroundEventTarget.addInputListener( {
      mousemove: event => {
        this.sceneNode.backgroundEventTarget.cursor = this.getMassUnderPointer( event.pointer, false ) ? 'pointer' : null;
      }
    } );

    // @private {Action}
    this.startDragAction = new Action( ( mass, position ) => {
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

    // @private {Action}
    this.updateDragAction = new Action( ( mass, position ) => {
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

    // @private {Action}
    this.endDragAction = new Action( mass => {
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

    this.sceneNode.backgroundEventTarget.addInputListener( {
      down: ( event, trail ) => {
        if ( !event.canStartPress() ) { return; }

        const pointer = event.pointer;
        const isTouch = !( pointer instanceof Mouse );
        const mass = this.getMassUnderPointer( pointer, isTouch );

        if ( mass && mass.canMove && !mass.userControlledProperty.value ) {

          const initialRay = this.sceneNode.getRayFromScreenPoint( pointer.point );
          const initialT = mass.intersect( initialRay, isTouch );
          const initialPosition = initialRay.pointAtDistance( initialT );
          const initialPlane = new Plane3( Vector3.Z_UNIT, initialPosition.z );

          this.startDragAction.execute( mass, initialPosition.toVector2() );
          this.currentMassProperty.value = mass;
          pointer.cursor = 'pointer';

          const endDrag = () => {
            pointer.removeInputListener( listener, true );
            pointer.cursor = null;

            this.endDragAction.execute( mass );
          };
          const listener = {
            // end drag on either up or cancel (not supporting full cancel behavior)
            up: endDrag,
            cancel: endDrag,
            interrupt: endDrag,

            move: ( event, trail ) => {
              const ray = this.sceneNode.getRayFromScreenPoint( pointer.point );
              const position = initialPlane.intersectWithRay( ray );

              this.updateDragAction.execute( mass, position.toVector2() );
            }
          };
          pointer.reserveForDrag();
          pointer.addInputListener( listener, true );
        }
      }
    } );

    const ambientLight = new THREE.AmbientLight( 0x333333 );
    this.sceneNode.stage.threeScene.add( ambientLight );

    const sunLight = new THREE.DirectionalLight( 0xffffff, 1 );
    sunLight.position.set( -1, 1.5, 0.8 );
    this.sceneNode.stage.threeScene.add( sunLight );

    const moonLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
    moonLight.position.set( 2.0, -1.0, 1.0 );
    this.sceneNode.stage.threeScene.add( moonLight );

    // Front ground
    const frontGeometry = new THREE.BufferGeometry();
    frontGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
      // Left side
      ...ThreeUtils.frontVertices( new Bounds2(
        model.groundBounds.minX, model.groundBounds.minY,
        model.poolBounds.minX, model.groundBounds.maxY
      ), model.groundBounds.maxZ ),

      // Right side
      ...ThreeUtils.frontVertices( new Bounds2(
        model.poolBounds.maxX, model.groundBounds.minY,
        model.groundBounds.maxX, model.groundBounds.maxY
      ), model.groundBounds.maxZ ),

      // Bottom
      ...ThreeUtils.frontVertices( new Bounds2(
        model.poolBounds.minX, model.groundBounds.minY,
        model.poolBounds.maxX, model.poolBounds.minY
      ), model.groundBounds.maxZ )
    ] ), 3 ) );
    const groundMaterial = new THREE.MeshBasicMaterial();
    DensityBuoyancyCommonColors.groundProperty.link( groundColor => {
      groundMaterial.color = ThreeUtils.colorToThree( groundColor );
    } );

    const frontMesh = new THREE.Mesh( frontGeometry, groundMaterial );
    this.sceneNode.stage.threeScene.add( frontMesh );

    // Top ground
    const topGeometry = new THREE.BufferGeometry();
    topGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
      // Left side
      ...ThreeUtils.topVertices( new Bounds2(
        model.groundBounds.minX, model.poolBounds.minZ,
        model.poolBounds.minX, model.groundBounds.maxZ
      ), model.groundBounds.maxY ),

      // Right side
      ...ThreeUtils.topVertices( new Bounds2(
        model.poolBounds.maxX, model.poolBounds.minZ,
        model.groundBounds.maxX, model.groundBounds.maxZ
      ), model.groundBounds.maxY ),

      // Back side
      ...ThreeUtils.topVertices( new Bounds2(
        model.groundBounds.minX, model.groundBounds.minZ,
        model.groundBounds.maxX, model.poolBounds.minZ
      ), model.groundBounds.maxY )
    ] ), 3 ) );
    topGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( [
      // Left
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,

      // Right
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,

      // Back
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0
    ] ), 3 ) );
    const topColorArray = new Float32Array( [
      // Left
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,

      // Right
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,

      // Back
      1, 1, 0,
      1, 1, 0,
      0, 1, 1,
      0, 1, 1,
      1, 1, 0,
      0, 1, 1
    ] );
    topGeometry.addAttribute( 'color', new THREE.BufferAttribute( topColorArray, 3 ) );
    DensityBuoyancyCommonColors.grassCloseProperty.link( grassCloseColor => {
      for ( let i = 0; i < 18; i++ ) {
        topColorArray[ i * 3 + 0 ] = grassCloseColor.r / 255;
        topColorArray[ i * 3 + 1 ] = grassCloseColor.g / 255;
        topColorArray[ i * 3 + 2 ] = grassCloseColor.b / 255;
      }
      const offset = 3 * 2 * 6;
      topColorArray[ offset + 0 ] = topColorArray[ offset + 3 ] = topColorArray[ offset + 9 ] = grassCloseColor.r / 255;
      topColorArray[ offset + 1 ] = topColorArray[ offset + 4 ] = topColorArray[ offset + 10 ] = grassCloseColor.g / 255;
      topColorArray[ offset + 2 ] = topColorArray[ offset + 5 ] = topColorArray[ offset + 11 ] = grassCloseColor.b / 255;
      topGeometry.attributes.color.needsUpdate = true;
    } );
    DensityBuoyancyCommonColors.grassFarProperty.link( grassFarColor => {
      const offset = 3 * 2 * 6;
      topColorArray[ offset + 6 ] = topColorArray[ offset + 12 ] = topColorArray[ offset + 15 ] = grassFarColor.r / 255;
      topColorArray[ offset + 7 ] = topColorArray[ offset + 13 ] = topColorArray[ offset + 16 ] = grassFarColor.g / 255;
      topColorArray[ offset + 8 ] = topColorArray[ offset + 14 ] = topColorArray[ offset + 17 ] = grassFarColor.b / 255;
      topGeometry.attributes.color.needsUpdate = true;
    } );
    const topMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
    const topMesh = new THREE.Mesh( topGeometry, topMaterial );
    this.sceneNode.stage.threeScene.add( topMesh );

    // Pool interior
    const poolGeometry = new THREE.BufferGeometry();
    poolGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
      // Bottom
      ...ThreeUtils.topVertices( new Bounds2(
        model.poolBounds.minX, model.poolBounds.minZ,
        model.poolBounds.maxX, model.poolBounds.maxZ
      ), model.poolBounds.minY ),

      // Back
      ...ThreeUtils.frontVertices( new Bounds2(
        model.poolBounds.minX, model.poolBounds.minY,
        model.poolBounds.maxX, model.poolBounds.maxY
      ), model.poolBounds.minZ ),

      // Left
      ...ThreeUtils.rightVertices( new Bounds2(
        model.poolBounds.minZ, model.poolBounds.minY,
        model.poolBounds.maxZ, model.poolBounds.maxY
      ), model.poolBounds.minX ),

      // Right
      ...ThreeUtils.leftVertices( new Bounds2(
        model.poolBounds.minZ, model.poolBounds.minY,
        model.poolBounds.maxZ, model.poolBounds.maxY
      ), model.poolBounds.maxX )
    ] ), 3 ) );
    poolGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( [
      // Bottom
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,

      // Back
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      // Left
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,

      // Right
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0
    ] ), 3 ) );
    const poolMaterial = new THREE.MeshLambertMaterial();
    DensityBuoyancyCommonColors.poolSurfaceProperty.link( poolSurfaceColor => {
      poolMaterial.color = ThreeUtils.colorToThree( poolSurfaceColor );
    } );

    const poolMesh = new THREE.Mesh( poolGeometry, poolMaterial );
    this.sceneNode.stage.threeScene.add( poolMesh );

    // Water
    const waterGeometry = new THREE.BufferGeometry();
    const waterPositionArray = BoatDesign.createWaterVertexArray();
    waterGeometry.addAttribute( 'position', new THREE.BufferAttribute( waterPositionArray, 3 ) );
    waterGeometry.addAttribute( 'normal', new THREE.BufferAttribute( BoatDesign.createWaterNormalArray(), 3 ) );
    const waterMaterial = new THREE.MeshLambertMaterial( {
      transparent: true,
      depthWrite: false
    } );
    new DynamicProperty( model.liquidMaterialProperty, {
      derive: 'liquidColor'
    } ).link( color => {
      waterMaterial.color = ThreeUtils.colorToThree( color );
      waterMaterial.opacity = color.alpha;
    } );
    const waterMesh = new THREE.Mesh( waterGeometry, waterMaterial );
    this.sceneNode.stage.threeScene.add( waterMesh );
    waterMesh.renderOrder = 10;

    let wasFilled = false;
    model.pool.liquidYInterpolatedProperty.link( y => {
      const boat = model.getBoat();
      wasFilled = BoatDesign.fillWaterVertexArray(
        y,
        boat ? boat.matrix.translation.x : 0,
        boat ? y - boat.matrix.translation.y : 0,
        boat ? boat.displacementVolumeProperty.value / 0.001 : 0,
        model.poolBounds, waterPositionArray, wasFilled );
      waterGeometry.attributes.position.needsUpdate = true;
      waterGeometry.computeBoundingSphere();
    } );

    const onMassAdded = mass => {
      let massView = null;

      if ( mass instanceof Cuboid ) {
        massView = new CuboidView( mass );
      }
      else if ( mass instanceof Scale ) {
        massView = new ScaleView( mass );
      }
      else if ( mass instanceof Cone ) {
        massView = new ConeView( mass );
      }
      else if ( mass instanceof Ellipsoid ) {
        massView = new EllipsoidView( mass );
      }
      else if ( mass instanceof HorizontalCylinder ) {
        massView = new HorizontalCylinderView( mass );
      }
      else if ( mass instanceof VerticalCylinder ) {
        massView = new VerticalCylinderView( mass );
      }
      else if ( mass instanceof Bottle ) {
        massView = new BottleView( mass, model.pool.liquidYInterpolatedProperty );
      }
      else if ( mass instanceof Boat ) {
        massView = new BoatView( mass, model.pool.liquidYInterpolatedProperty );
      }

      if ( massView ) {
        this.sceneNode.stage.threeScene.add( massView );
        this.massViews.push( massView );

        if ( massView instanceof ScaleView ) {
          const scaleReadoutNode = new ScaleReadoutNode( mass, model.gravityProperty );
          this.scaleReadoutLayer.addChild( scaleReadoutNode );
          this.scaleReadoutNodes.push( scaleReadoutNode );
        }
        else {
          const forceDiagramNode = new ForceDiagramNode(
            mass,
            model.showGravityForceProperty,
            model.showBuoyancyForceProperty,
            model.showContactForceProperty,
            model.showForceValuesProperty
          );
          this.forceDiagramLayer.addChild( forceDiagramNode );
          this.forceDiagramNodes.push( forceDiagramNode );

          const massLabelNode = new MassLabelNode( mass, model.showMassesProperty );
          this.massLabelLayer.addChild( massLabelNode );
          this.massLabelNodes.push( massLabelNode );
        }
      }
    };
    model.masses.addItemAddedListener( onMassAdded );
    model.masses.forEach( onMassAdded );

    const onMassRemoved = mass => {
      // Mass view
      const massView = _.find( this.massViews, massView => massView.mass === mass );
      this.sceneNode.stage.threeScene.remove( massView );
      arrayRemove( this.massViews, massView );
      massView.dispose();

      if ( massView instanceof ScaleView ) {
        const scaleReadoutNode = _.find( this.scaleReadoutNodes, scaleReadoutNode => scaleReadoutNode.mass === mass );
        this.scaleReadoutLayer.removeChild( scaleReadoutNode );
        arrayRemove( this.scaleReadoutNodes, scaleReadoutNode );
        scaleReadoutNode.dispose();
      }
      else {
        // Force diagram node
        const forceDiagramNode = _.find( this.forceDiagramNodes, forceDiagramNode => forceDiagramNode.mass === mass );
        this.forceDiagramLayer.removeChild( forceDiagramNode );
        arrayRemove( this.forceDiagramNodes, forceDiagramNode );
        forceDiagramNode.dispose();

        const massLabelNode = _.find( this.massLabelNodes, massLabelNode => massLabelNode.mass === mass );
        this.massLabelLayer.removeChild( massLabelNode );
        arrayRemove( this.massLabelNodes, massLabelNode );
        massLabelNode.dispose();
      }
    };
    model.masses.addItemRemovedListener( onMassRemoved );

    const waterLevelIndicator = new WaterLevelIndicator( new DerivedProperty( [ model.pool.liquidYInterpolatedProperty ], liquidY => {
      return model.poolBounds.width * model.poolBounds.depth * ( liquidY - model.poolBounds.minY );
    } ) );
    this.addChild( waterLevelIndicator );
    model.pool.liquidYInterpolatedProperty.link( liquidY => {
      const modelPoint = new Vector3( model.poolBounds.minX, liquidY, model.poolBounds.maxZ );
      waterLevelIndicator.translation = this.modelToViewPoint( modelPoint );
    } );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.interruptSubtreeInput();
      },
      right: this.layoutBounds.right - MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    if ( DensityBuoyancyCommonQueryParameters.showDebug ) {
      const debugVisibleProperty = new BooleanProperty( true );

      // @private {DebugView|undefined}
      this.debugView = new DebugView( model, this.layoutBounds );
      this.debugView.visibleProperty = debugVisibleProperty;
      this.popupLayer.addChild( this.debugView );
      this.addChild( new Checkbox( new Text( 'Debug', { font: new PhetFont( 12 ) } ), debugVisibleProperty ) );
    }
  }

  /**
   * Projects a 3d model point to a 2d view point (in the screen view's coordinate frame).
   * @public
   *
   * @param {Vector3} point
   * @returns {Vector2}
   */
  modelToViewPoint( point ) {
    // We'll want to transform global coordinates into screen coordinates here
    return this.parentToLocalPoint( animatedPanZoomSingleton.listener.matrixProperty.value.inverted().timesVector2( this.sceneNode.projectPoint( point ) ) );
  }

  /**
   * Returns the closest grab-able mass under the pointer/
   * @public
   *
   * @param {Pointer} pointer
   * @param {boolean} isTouch
   * @returns {Mass|null}
   */
  getMassUnderPointer( pointer, isTouch ) {
    const ray = this.sceneNode.getRayFromScreenPoint( pointer.point );

    let closestT = Number.POSITIVE_INFINITY;
    let closestMass = null;

    this.model.masses.forEach( mass => {
      if ( !mass.canMove || !mass.inputEnabledProperty.value ) {
        return;
      }

      const t = mass.intersect( ray, isTouch );

      if ( t !== null && t < closestT ) {
        closestT = t;
        closestMass = mass;
      }
    } );

    return closestMass;
  }

  /**
   * @public
   * @override
   * @param {Bounds2} viewBounds
   */
  layout( viewBounds ) {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.sceneNode.layout( viewBounds.width, viewBounds.height );

    // We need to do an initial render for certain layout-based code to work
    this.sceneNode.render( undefined );
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.sceneNode.render( undefined );

    this.scaleReadoutNodes.forEach( scaleReadoutNode => {
      scaleReadoutNode.translation = this.modelToViewPoint( scaleReadoutNode.mass.matrix.translation.toVector3().plus( Scale.SCALE_FRONT_OFFSET ) );
    } );

    this.forceDiagramNodes.forEach( forceDiagramNode => {
      forceDiagramNode.update();

      const mass = forceDiagramNode.mass;
      const originPoint = this.modelToViewPoint( mass.matrix.translation.toVector3().plus( mass.forceOffsetProperty.value ) );
      const upOffsetPoint = this.modelToViewPoint( mass.matrix.translation.toVector3().plus( mass.forceOffsetProperty.value ).plusXYZ( 0, 1, 0 ) );

      // Shear the force diagram so that it aligns with the perspective at the point, see
      // https://github.com/phetsims/buoyancy/issues/12
      forceDiagramNode.matrix = Matrix3.rowMajor(
        1, ( upOffsetPoint.x - originPoint.x ) / ( upOffsetPoint.y - originPoint.y ), originPoint.x,
        0, 1, originPoint.y,
        0, 0, 1
      );
    } );

    this.massLabelNodes.forEach( massLabelNode => {
      const mass = massLabelNode.mass;
      const modelPoint = this.modelToViewPoint( mass.matrix.translation.toVector3().plus( mass.massOffsetProperty.value ) );
      const offsetPoint = scratchVector2.setXY( massLabelNode.width / 2, massLabelNode.height / 2 ).componentMultiply( mass.massOffsetOrientationProperty.value );
      massLabelNode.translation = modelPoint.plus( offsetPoint );
    } );

    this.debugView && this.debugView.step( dt );
  }

  /**
   * Returns an icon for selection, given a scene setup callback.
   * @private
   *
   * @param {number} zoom
   * @param {Vector3} lookAt
   * @param {function(THREE.Scene)} setupScene
   * @returns {Node}
   */
  static getAngledIcon( zoom, lookAt, setupScene ) {
    const width = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width;
    const height = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height;

    const stage = new ThreeStage( { fov: 50 } );

    stage.threeCamera.near = 0.5;

    const ambientLight = new THREE.AmbientLight( 0x333333 );
    stage.threeScene.add( ambientLight );

    const sunLight = new THREE.DirectionalLight( 0xffffff, 1 );
    sunLight.position.set( -1, 1.5, 0.8 );
    stage.threeScene.add( sunLight );

    const moonLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
    moonLight.position.set( 2.0, -1.0, 1.0 );
    stage.threeScene.add( moonLight );

    stage.threeScene.background = new THREE.Color( 0xffffff );


    stage.threeCamera.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0.4, 1 ) ) );
    stage.threeCamera.zoom = zoom;
    stage.threeCamera.lookAt( ThreeUtils.vectorToThree( lookAt ) );
    stage.threeCamera.updateProjectionMatrix();

    setupScene( stage.threeScene, stage.threeRenderer );

    stage.threeCamera.fov = 50;
    stage.threeCamera.aspect = width / height;
    stage.setDimensions( width, height );
    stage.threeCamera.updateProjectionMatrix();
    stage.render( undefined );

    const canvas = stage.renderToCanvas( 3 );

    stage.dispose();

    // Yes, we log this so we can regenerate them if we have changes
    console.log( canvas.toDataURL() );

    const image = new Image( canvas.toDataURL(), {
      mipmap: true,
      initialWidth: canvas.width,
      initialHeight: canvas.height
    } );
    image.setScaleMagnitude( 1, -1 );
    image.left = 0;
    image.top = 0;
    return image;
  }

  /**
   * Returns an icon meant to be used as a fallback in case webgl is not available.
   * @private
   *
   * @returns {Node}
   */
  static getFallbackIcon() {
    return new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: 'gray'
    } );
  }

  /**
   * @public
   *
   * @returns {Node}
   */
  static getDensityIntroIcon() {
    if ( !ThreeUtils.isWebGLEnabled() ) {
      return DensityBuoyancyScreenView.getFallbackIcon();
    }

    return DensityBuoyancyScreenView.getAngledIcon( 5.5, new Vector3( 0, 0, 0 ), ( scene, renderer ) => {

      const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

      const box = new THREE.Mesh( boxGeometry, new THREE.MeshStandardMaterial( {
        map: DensityMaterials.woodColorTexture,
        normalMap: DensityMaterials.woodNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: DensityMaterials.woodRoughnessTexture,
        metalness: 0
        // NOTE: Removed the environment map for now
      } ) );
      box.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0, 0 ) ) );

      scene.add( box );

      const waterMaterial = new THREE.MeshLambertMaterial( {
        transparent: true
      } );
      const waterColor = DensityBuoyancyCommonColors.materialWaterColorProperty.value;
      waterMaterial.color = ThreeUtils.colorToThree( waterColor );
      waterMaterial.opacity = waterColor.alpha;

      // Fake it!
      const waterGeometry = new THREE.BoxGeometry( 1, 1, 0.12 );

      const water = new THREE.Mesh( waterGeometry, waterMaterial );
      water.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.5, 0 ) ) );
      scene.add( water );
    } );
  }

  /**
   * @public
   *
   * @returns {Node}
   */
  static getDensityCompareIcon() {
    if ( !ThreeUtils.isWebGLEnabled() ) {
      return DensityBuoyancyScreenView.getFallbackIcon();
    }

    return DensityBuoyancyScreenView.getAngledIcon( 4.6, new Vector3( 0, -0.02, 0 ), scene => {

      const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

      const leftBox = new THREE.Mesh( boxGeometry, new THREE.MeshLambertMaterial( {
        color: 0xffff00
      } ) );
      leftBox.position.copy( ThreeUtils.vectorToThree( new Vector3( -0.07, 0, 0 ) ) );
      scene.add( leftBox );

      const rightBox = new THREE.Mesh( boxGeometry, new THREE.MeshLambertMaterial( {
        color: 0xff0000
      } ) );
      rightBox.position.copy( ThreeUtils.vectorToThree( new Vector3( 0.07, -0.06, 0 ) ) );
      scene.add( rightBox );

      const waterMaterial = new THREE.MeshLambertMaterial( {
        transparent: true
      } );
      const waterColor = DensityBuoyancyCommonColors.materialWaterColorProperty.value;
      waterMaterial.color = ThreeUtils.colorToThree( waterColor );
      waterMaterial.opacity = waterColor.alpha;

      // Fake it!
      const waterGeometry = new THREE.BoxGeometry( 1, 1, 0.12 );

      const water = new THREE.Mesh( waterGeometry, waterMaterial );
      water.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.5, 0 ) ) );
      scene.add( water );
    } );
  }

  /**
   * @public
   *
   * @returns {Node}
   */
  static getDensityMysteryIcon() {
    if ( !ThreeUtils.isWebGLEnabled() ) {
      return DensityBuoyancyScreenView.getFallbackIcon();
    }

    return DensityBuoyancyScreenView.getAngledIcon( 4, new Vector3( 0, -0.01, 0 ), scene => {

      const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

      const box = new THREE.Mesh( boxGeometry, new THREE.MeshLambertMaterial( {
        color: 0x00ff00
      } ) );
      box.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0.03, 0 ) ) );

      scene.add( box );

      const labelSize = 0.1;
      const label = new TextureQuad( new NodeTexture( new Text( '?', {
        font: new PhetFont( {
          size: 120
        } ),
        center: new Vector2( 128, 128 )
      } ), 256, 256 ), labelSize, labelSize );

      label.position.copy( ThreeUtils.vectorToThree( new Vector3( 0 - labelSize * 0.5, 0.03, 0.15 ) ) );

      scene.add( label );

      const scaleGeometry = ScaleView.getScaleGeometry();

      const scale = new THREE.Mesh( scaleGeometry, new THREE.MeshStandardMaterial( {
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0x666666
      } ) );

      scale.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.03, 0 ) ) );
      scene.add( scale );
    } );
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyScreenView', DensityBuoyancyScreenView );
export default DensityBuoyancyScreenView;