// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main base ScreenView for all Density/Buoyancy screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Plane3 from '../../../../dot/js/Plane3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import ThreeIsometricNode from '../../../../mobius/js/ThreeIsometricNode.js';
import ThreeStage from '../../../../mobius/js/ThreeStage.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { AlignBox, animatedPanZoomSingleton, Image, LinearGradient, Mouse, Node, Pointer, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
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
import EllipsoidView from './EllipsoidView.js';
import HorizontalCylinderView from './HorizontalCylinderView.js';
import ScaleView from './ScaleView.js';
import VerticalCylinderView from './VerticalCylinderView.js';
import WaterLevelIndicator from './WaterLevelIndicator.js';
import DensityBuoyancyModel from '../model/DensityBuoyancyModel.js';
import MassView from './MassView.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Material from '../model/Material.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import BackgroundEventTargetListener from './BackgroundEventTargetListener.js';
import MassDecorationLayer from './MassDecorationLayer.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

type SelfOptions = {
  cameraLookAt?: Vector3;
  cameraPosition?: Vector3;
  cameraZoom?: number;
  preventFit?: boolean;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

export type DensityBuoyancyScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class DensityBuoyancyScreenView<Model extends DensityBuoyancyModel> extends ScreenView {

  protected readonly model: Model;
  protected readonly popupLayer: Node;
  protected readonly backgroundLayer: Node;
  protected readonly resetAllButton: Node;

  private readonly postLayoutEmitter: TEmitter;

  // The sky background, in a unit 0-to-1 rectangle (so we can scale it to match)
  private readonly backgroundNode: Rectangle;

  public readonly sceneNode: ThreeIsometricNode;

  private readonly massDecorationLayer = new MassDecorationLayer();

  // TODO: https://github.com/phetsims/buoyancy/issues/104 ok for this to be public?
  public readonly massViews: MassView[];

  private readonly debugView?: DebugView;

  // Subtypes can provide their own values to control the barrier sizing.
  protected leftBarrierViewPointPropertyProperty: Property<TReadOnlyProperty<Vector2>>;
  protected rightBarrierViewPointPropertyProperty: Property<TReadOnlyProperty<Vector2>>;

  // In Liters, how much volume does the Pool liquid + displaced Masses take up.
  // TODO: PhET-iO instrument for https://github.com/phetsims/density-buoyancy-common/issues/82
  protected waterLevelVolumeProperty: TReadOnlyProperty<number>;

  public constructor( model: Model, providedOptions: SelfOptions ) {

    const scaleIncrease = 3.5;

    const options = optionize<DensityBuoyancyScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT,
      cameraPosition: new Vector3( 0, 0.2, 2 ).timesScalar( scaleIncrease ),
      cameraZoom: 1.75 * scaleIncrease,

      preventFit: true
    }, providedOptions );

    const tandem = options.tandem;

    super( options );

    this.model = model;
    this.postLayoutEmitter = new TinyEmitter();
    this.popupLayer = new Node();
    this.backgroundNode = new Rectangle( 0, 0, 1, 1, {
      pickable: false,
      fill: new LinearGradient( 0, 0, 0, 1 )
        .addColorStop( 0, DensityBuoyancyCommonColors.skyTopProperty )
        .addColorStop( 1, DensityBuoyancyCommonColors.skyBottomProperty )
    } );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.visibleBoundsProperty.link( visibleBounds => {
      this.backgroundNode.translation = visibleBounds.leftTop;
      this.backgroundNode.setScaleMagnitude( visibleBounds.width, visibleBounds.height / 2 );
    } );
    this.addChild( this.backgroundNode );

    this.backgroundLayer = new Node();
    this.addChild( this.backgroundLayer );

    this.sceneNode = new ThreeIsometricNode( this.layoutBounds, {
      parentMatrixProperty: animatedPanZoomSingleton.listener.matrixProperty,
      cameraPosition: options.cameraPosition,
      getPhetioMouseHit: point => {
        const mass = this.getMassUnderPoint( this.localToGlobalPoint( point ), false );
        return mass ? mass.getPhetioMouseHitTarget() : mass;
      }
    } );
    this.addChild( this.sceneNode );

    this.addChild( this.massDecorationLayer );

    this.massViews = [];

    this.sceneNode.stage.threeCamera.zoom = options.cameraZoom;
    this.sceneNode.stage.threeCamera.up = new THREE.Vector3( 0, 0, -1 );
    this.sceneNode.stage.threeCamera.lookAt( ThreeUtils.vectorToThree( options.cameraLookAt ) );
    this.sceneNode.stage.threeCamera.updateMatrixWorld( true );
    this.sceneNode.stage.threeCamera.updateProjectionMatrix();

    let mouse: Mouse | null = null;

    // TODO: BackgroundEventTargetListeners wants to be able to set the mouse. Is there a better way to do it? See https://github.com/phetsims/buoyancy/issues/104
    // TODO: Should this be an instance method on the prototype? And make mouse an instance variable? See https://github.com/phetsims/buoyancy/issues/104
    const updateCursor = ( newMouse?: Mouse ) => {
      mouse = newMouse || mouse;
      if ( mouse ) {
        this.sceneNode.backgroundEventTarget.cursor = this.getMassUnderPointer( mouse, false ) ? 'pointer' : null;
      }
    };

    // TODO: Is it awkward to use the `create` pattern? The input listener is not a class. See https://github.com/phetsims/buoyancy/issues/104
    this.sceneNode.backgroundEventTarget.addInputListener( BackgroundEventTargetListener.create( this, updateCursor ) );

    // On re-layout or zoom, update the cursor also
    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    this.transformEmitter.addListener( updateCursor );
    animatedPanZoomSingleton.listener.matrixProperty.lazyLink( () => updateCursor() );

    const ambientLight = new THREE.AmbientLight( 0x333333 );
    this.sceneNode.stage.threeScene.add( ambientLight );

    const sunLight = new THREE.DirectionalLight( 0xffffff, 1 );
    sunLight.position.set( -0.7, 1.5, 0.8 );
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
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
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
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
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
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    DensityBuoyancyCommonColors.grassFarProperty.link( grassFarColor => {
      const offset = 3 * 2 * 6;
      topColorArray[ offset + 6 ] = topColorArray[ offset + 12 ] = topColorArray[ offset + 15 ] = grassFarColor.r / 255;
      topColorArray[ offset + 7 ] = topColorArray[ offset + 13 ] = topColorArray[ offset + 16 ] = grassFarColor.g / 255;
      topColorArray[ offset + 8 ] = topColorArray[ offset + 14 ] = topColorArray[ offset + 17 ] = grassFarColor.b / 255;
      topGeometry.attributes.color.needsUpdate = true;
    } );
    // @ts-expect-error - THREE.js version incompat?
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
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    DensityBuoyancyCommonColors.poolSurfaceProperty.link( poolSurfaceColor => {
      poolMaterial.color = ThreeUtils.colorToThree( poolSurfaceColor );
    } );

    const poolMesh = new THREE.Mesh( poolGeometry, poolMaterial );
    this.sceneNode.stage.threeScene.add( poolMesh );

    // Debug barrier
    if ( DensityBuoyancyCommonQueryParameters.showBarrier ) {
      const barrierGeometry = new THREE.BufferGeometry();
      const barrierPositionArray = new Float32Array( 18 * 2 );

      barrierGeometry.addAttribute( 'position', new THREE.BufferAttribute( barrierPositionArray, 3 ) );
      barrierGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( [
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
      const barrierMaterial = new THREE.MeshLambertMaterial( {
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
      } );

      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      model.invisibleBarrierBoundsProperty.link( bounds => {
        let index = 0;
        const zyBounds = new Bounds2( bounds.minZ, bounds.minY, bounds.maxZ, bounds.maxY );
        index = ThreeUtils.writeRightVertices( barrierPositionArray, index, zyBounds, bounds.minX );
        ThreeUtils.writeLeftVertices( barrierPositionArray, index, zyBounds, bounds.maxX );

        barrierGeometry.attributes.position.needsUpdate = true;
        barrierGeometry.computeBoundingSphere();
      } );

      const barrierMesh = new THREE.Mesh( barrierGeometry, barrierMaterial );
      this.sceneNode.stage.threeScene.add( barrierMesh );
    }

    // Water
    const waterGeometry = new THREE.BufferGeometry();
    const waterPositionArray = BoatDesign.createWaterVertexArray();
    waterGeometry.addAttribute( 'position', new THREE.BufferAttribute( waterPositionArray, 3 ) );
    waterGeometry.addAttribute( 'normal', new THREE.BufferAttribute( BoatDesign.createWaterNormalArray(), 3 ) );
    const waterMaterial = new THREE.MeshLambertMaterial( {
      transparent: true,
      depthWrite: false
    } );

    Material.linkLiquidColor( model.liquidMaterialProperty, waterMaterial );
    const waterMesh = new THREE.Mesh( waterGeometry, waterMaterial );
    this.sceneNode.stage.threeScene.add( waterMesh );
    waterMesh.renderOrder = 10;

    let wasFilled = false;
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.pool.liquidYInterpolatedProperty.link( y => {
      const boat = model.getBoat();
      const hasVisibleBoat = boat && boat.visibleProperty.value;
      wasFilled = BoatDesign.fillWaterVertexArray(
        y,
        hasVisibleBoat ? boat.matrix.translation.x : 0,
        hasVisibleBoat ? y - boat.matrix.translation.y : 0,
        hasVisibleBoat ? boat.displacementVolumeProperty.value / 0.001 : 0,
        model.poolBounds, waterPositionArray, wasFilled );
      waterGeometry.attributes.position.needsUpdate = true;
      waterGeometry.computeBoundingSphere();
    } );

    const boundModelToViewPoint = this.modelToViewPoint.bind( this );

    const dragBoundsProperty = model.invisibleBarrierBoundsProperty;

    const onMassAdded = ( mass: Mass ) => {
      let massView!: MassView;

      if ( mass instanceof Cuboid ) {
        massView = new CuboidView( mass, boundModelToViewPoint, dragBoundsProperty, model.showDepthLinesProperty,
          model.showGravityForceProperty, model.showBuoyancyForceProperty, model.showContactForceProperty,
          model.showForceValuesProperty, model.forceScaleProperty, model.showMassesProperty );
      }
      else if ( mass instanceof Scale ) {
        massView = new ScaleView( mass, boundModelToViewPoint, dragBoundsProperty, model.gravityProperty );
      }
      else if ( mass instanceof Cone ) {
        massView = new ConeView( mass, boundModelToViewPoint, dragBoundsProperty, model.showGravityForceProperty,
          model.showBuoyancyForceProperty, model.showContactForceProperty, model.showForceValuesProperty,
          model.forceScaleProperty, model.showMassesProperty );
      }
      else if ( mass instanceof Ellipsoid ) {
        massView = new EllipsoidView( mass, boundModelToViewPoint, dragBoundsProperty, model.showGravityForceProperty,
          model.showBuoyancyForceProperty, model.showContactForceProperty, model.showForceValuesProperty,
          model.forceScaleProperty, model.showMassesProperty );
      }
      else if ( mass instanceof HorizontalCylinder ) {
        massView = new HorizontalCylinderView( mass, boundModelToViewPoint, dragBoundsProperty,
          model.showGravityForceProperty, model.showBuoyancyForceProperty, model.showContactForceProperty,
          model.showForceValuesProperty, model.forceScaleProperty, model.showMassesProperty );
      }
      else if ( mass instanceof VerticalCylinder ) {
        massView = new VerticalCylinderView( mass, boundModelToViewPoint, dragBoundsProperty, model.showGravityForceProperty,
          model.showBuoyancyForceProperty, model.showContactForceProperty, model.showForceValuesProperty,
          model.forceScaleProperty, model.showMassesProperty );
      }
      else if ( mass instanceof Bottle ) {
        massView = new BottleView( mass, boundModelToViewPoint, dragBoundsProperty, model.showGravityForceProperty,
          model.showBuoyancyForceProperty, model.showContactForceProperty, model.showForceValuesProperty,
          model.forceScaleProperty, model.showMassesProperty );
      }
      else if ( mass instanceof Boat ) {
        massView = new BoatView( mass, boundModelToViewPoint, dragBoundsProperty, model.pool.liquidYInterpolatedProperty,
          model.showGravityForceProperty, model.showBuoyancyForceProperty, model.showContactForceProperty,
          model.showForceValuesProperty, model.forceScaleProperty, model.showMassesProperty );
      }
      assert && assert( !!massView, `massView is falsy, mass: ${mass.constructor.name}` );

      this.sceneNode.stage.threeScene.add( massView );
      this.massViews.push( massView );
      massView.focusablePath && this.sceneNode.backgroundEventTarget.addChild( massView.focusablePath );
      massView.decorate( this.massDecorationLayer );
    };
    model.masses.addItemAddedListener( onMassAdded );
    model.masses.forEach( onMassAdded );

    const onMassRemoved = ( mass: Mass ) => {
      // Mass view
      const massView = _.find( this.massViews, massView => massView.mass === mass )!;

      // Remove the mass view
      this.sceneNode.stage.threeScene.remove( massView );
      arrayRemove( this.massViews, massView );
      massView.dispose();
    };
    model.masses.addItemRemovedListener( onMassRemoved );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.waterLevelVolumeProperty = new DerivedProperty( [ model.pool.liquidYInterpolatedProperty ],
      liquidY => model.poolBounds.width *
                 model.poolBounds.depth *
                 ( liquidY - model.poolBounds.minY ) *
                 DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER, {
        units: 'L'
      } );

    const waterLevelIndicator = new WaterLevelIndicator( this.waterLevelVolumeProperty );
    this.addChild( waterLevelIndicator );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.pool.liquidYInterpolatedProperty.link( liquidY => {
      const modelPoint = new Vector3( model.poolBounds.minX, liquidY, model.poolBounds.maxZ );
      waterLevelIndicator.translation = this.modelToViewPoint( modelPoint );
    } );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( new AlignBox( this.resetAllButton, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    if ( DensityBuoyancyCommonQueryParameters.showDebug ) {
      const debugVisibleProperty = new BooleanProperty( true );

      this.debugView = new DebugView( model, this.layoutBounds );
      this.debugView.visibleProperty = debugVisibleProperty;
      this.popupLayer.addChild( this.debugView );
      this.addChild( new Checkbox( debugVisibleProperty, new Text( 'Debug', { font: new PhetFont( 12 ) } ) ) );
    }

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.leftBarrierViewPointPropertyProperty = new Property<TReadOnlyProperty<Vector2>>( new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => visibleBounds.leftCenter ), {
      tandem: Tandem.OPT_OUT
    } );
    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty = new Property<TReadOnlyProperty<Vector2>>( new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => visibleBounds.rightCenter ), {
      tandem: Tandem.OPT_OUT
    } );

    const resizeBarrier = () => {
      const stage = this.sceneNode.stage;
      if ( stage.canvasWidth && stage.canvasHeight ) {
        const leftRay = this.sceneNode.getRayFromScreenPoint( this.localToGlobalPoint( this.leftBarrierViewPointPropertyProperty.value.value ) );
        const rightRay = this.sceneNode.getRayFromScreenPoint( this.localToGlobalPoint( this.rightBarrierViewPointPropertyProperty.value.value ) );
        const topRay = this.sceneNode.getRayFromScreenPoint( this.localToGlobalPoint( this.visibleBoundsProperty.value.centerTop ) );
        const leftPoint = new Plane3( Vector3.Z_UNIT, 0.09 ).intersectWithRay( leftRay );
        const rightPoint = new Plane3( Vector3.Z_UNIT, 0.09 ).intersectWithRay( rightRay );
        const topPoint = new Plane3( Vector3.Z_UNIT, 0.09 ).intersectWithRay( topRay );
        model.invisibleBarrierBoundsProperty.value = model.invisibleBarrierBoundsProperty.value.setMaxY( topPoint.y + 0.06 ).setMinX( leftPoint.x + 0.01 ).withMaxX( rightPoint.x - 0.01 );
      }
    };

    // leftBarrierViewPointPropertyProperty and rightBarrierViewPointPropertyProperty are Property<Property>, and we need to listen
    // to when the value.value changes
    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    new DynamicProperty( this.leftBarrierViewPointPropertyProperty ).lazyLink( resizeBarrier );
    new DynamicProperty( this.rightBarrierViewPointPropertyProperty ).lazyLink( resizeBarrier );
    this.postLayoutEmitter.addListener( resizeBarrier ); // We need to wait for the layout AND render

    if ( !ThreeUtils.isWebGLEnabled() ) {
      ThreeUtils.showWebGLWarning( this );
    }
  }

  /**
   * Projects a 3d model point to a 2d view point (in the screen view's coordinate frame).
   */
  public modelToViewPoint( point: Vector3 ): Vector2 {

    // We'll want to transform global coordinates into screen coordinates here
    return this.parentToLocalPoint( animatedPanZoomSingleton.listener.matrixProperty.value.inverted().timesVector2( this.sceneNode.projectPoint( point ) ) );
  }

  /**
   * Returns the closest grab-able mass under the pointer/
   */
  public getMassUnderPointer( pointer: Pointer, isTouch: boolean ): Mass | null {
    const point = pointer.point;
    if ( point === null ) {
      return null;
    }
    return this.getMassUnderPoint( point, isTouch );
  }

  /**
   * Returns the closest grab-able mass under the point
   */
  public getMassUnderPoint( point: Vector2, isTouch: boolean ): Mass | null {
    const ray = this.sceneNode.getRayFromScreenPoint( point );

    let closestT = Number.POSITIVE_INFINITY;
    let closestMass = null;

    // Special boat case which allows to drag blocks out of the boat
    let boatUnderPointer = null;

    this.model.masses.forEach( mass => {
      if ( !mass.canMove || !mass.inputEnabledProperty.value ) {
        return;
      }

      const t = mass.intersect( ray, isTouch );

      if ( t !== null && t < closestT ) {
        if ( mass instanceof Boat ) {
          boatUnderPointer = mass;
        }
        else {
          closestT = t;
          closestMass = mass;
        }
      }
    } );

    return closestMass ? closestMass : boatUnderPointer ? boatUnderPointer : null;
  }

  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    const dimension = phet.joist.sim.dimensionProperty.value;

    const sceneWidth = dimension.width || window.innerWidth; // eslint-disable-line bad-sim-text
    const sceneHeight = dimension.height || window.innerHeight; // eslint-disable-line bad-sim-text

    this.sceneNode.layout( sceneWidth, sceneHeight );

    // We need to do an initial render for certain layout-based code to work
    this.sceneNode.render( undefined );

    this.postLayoutEmitter.emit();
  }

  /**
   * Steps forward in time.
   */
  public override step( dt: number ): void {

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    assert && this.massViews.forEach( massView => {
      massView.step( dt );

      assert && assert( massView.position.x === massView.mass.matrix.translation.x );
    } );

    this.sceneNode.render( undefined );

    this.debugView && this.debugView.step( dt );
  }

  /**
   * Returns an icon for selection, given a scene setup callback.
   */
  protected static getAngledIcon( zoom: number, lookAt: Vector3, setupScene: ( scene: THREE.Scene ) => void, background: THREE.Color | null = new THREE.Color( 0xffffff ) ): Node {
    const width = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width;
    const height = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height;

    const stage = new ThreeStage();

    stage.threeCamera.near = 0.5;

    const ambientLight = new THREE.AmbientLight( 0x333333 );
    stage.threeScene.add( ambientLight );

    const sunLight = new THREE.DirectionalLight( 0xffffff, 1 );
    sunLight.position.set( -1, 1.5, 0.8 );
    stage.threeScene.add( sunLight );

    const moonLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
    moonLight.position.set( 2.0, -1.0, 1.0 );
    stage.threeScene.add( moonLight );

    stage.threeScene.background = background;

    stage.threeCamera.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0.4, 1 ) ) );
    stage.threeCamera.zoom = zoom;
    stage.threeCamera.lookAt( ThreeUtils.vectorToThree( lookAt ) );
    stage.threeCamera.updateProjectionMatrix();

    setupScene( stage.threeScene );

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
   */
  protected static getFallbackIcon(): Node {
    return new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: 'gray'
    } );
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyScreenView', DensityBuoyancyScreenView );