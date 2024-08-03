// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main base ScreenView for all Density/Buoyancy screens.
 * TODO: Elaborate on the main responsibilities of this class, see https://github.com/phetsims/density-buoyancy-common/issues/257
 * TODO: Currently at 871 lines, this file is more complex. Can it be simplified or modularized? See https://github.com/phetsims/density-buoyancy-common/issues/123
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
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
import { AlignBox, animatedPanZoomSingleton, Color, ColorProperty, Image, ImageableImage, LinearGradient, Mouse, Node, Pointer, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonQueryParameters from '../DensityBuoyancyCommonQueryParameters.js';
import Cuboid from '../model/Cuboid.js';
import Mass from '../model/Mass.js';
import Scale from '../model/Scale.js';
import CuboidView from './CuboidView.js';
import DebugView from './DebugView.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import ScaleView from './ScaleView.js';
import FluidLevelIndicator from './FluidLevelIndicator.js';
import DensityBuoyancyModel from '../model/DensityBuoyancyModel.js';
import MassView from './MassView.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import BackgroundEventTargetListener from './BackgroundEventTargetListener.js';
import MassDecorationLayer from './MassDecorationLayer.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import { Shape } from '../../../../kite/js/imports.js';
import DisplayProperties from '../../buoyancy/view/DisplayProperties.js';
import { BufferGeometry } from '../../../../chipper/node_modules/@types/three/index.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

export type THREEModelViewTransform = {
  modelToViewPoint: ( modelPoint: Vector3 ) => Vector2;
  modelToViewDelta: ( point1: Vector3, point2: Vector3 ) => Vector2;
  viewToModelPoint: ( point: Vector2, modelZ?: number ) => Vector3;
  viewToModelDelta: ( viewPoint1: Vector2, modelZ1: number, viewPoint2: Vector2, modelZ2: number ) => Vector3;
};

type SelfOptions = {
  cameraLookAt?: Vector3;
  cameraPosition?: Vector3;
  viewOffset?: Vector2;
  cameraZoom?: number;
  preventFit?: boolean;

  canShowForces: boolean;
  supportsDepthLines: boolean;
  forcesInitiallyDisplayed: boolean;
  massValuesInitiallyDisplayed: boolean;
  initialForceScale?: number;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

export type DensityBuoyancyScreenViewOptions = SelfOptions & ScreenViewOptions;

export type PointedAtMassView = {
  massView: MassView;
  t: number;
};

export default class DensityBuoyancyScreenView<Model extends DensityBuoyancyModel> extends ScreenView implements THREEModelViewTransform {

  protected readonly model: Model;
  protected readonly popupLayer: Node;
  private readonly backgroundLayer: Node;
  protected readonly resetAllButton: Node;

  // The sky background
  private readonly backgroundNode: Rectangle;

  protected readonly sceneNode: ThreeIsometricNode;

  private readonly massDecorationLayer = new MassDecorationLayer();

  protected readonly massViews: ObservableArray<MassView>;

  private readonly debugView?: DebugView;

  // TODO: What are these for? See https://github.com/phetsims/density-buoyancy-common/issues/257
  // Subtypes can provide their own values to control the barrier sizing.
  private readonly leftBarrierViewPointPropertyProperty: Property<TReadOnlyProperty<Vector2>>;
  protected readonly rightBarrierViewPointPropertyProperty: Property<TReadOnlyProperty<Vector2>>;

  protected readonly resetEmitter = new Emitter();

  protected readonly displayProperties: DisplayProperties;

  public constructor( model: Model, providedOptions: SelfOptions ) {

    const scaleIncrease = 3.5;

    const options = optionize<DensityBuoyancyScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT,
      cameraPosition: new Vector3( 0, 0.2, 2 ).timesScalar( scaleIncrease ),
      cameraZoom: 1.75 * scaleIncrease,
      viewOffset: new Vector2( 0, 0 ),

      initialForceScale: 1 / 16,

      preventFit: true
    }, providedOptions );

    const tandem = options.tandem;

    super( options );

    this.displayProperties = new DisplayProperties( options.tandem.createTandem( 'displayProperties' ), {
      canShowForces: options.canShowForces,
      supportsDepthLines: options.supportsDepthLines,
      forcesInitiallyDisplayed: options.forcesInitiallyDisplayed,
      massValuesInitiallyDisplayed: options.massValuesInitiallyDisplayed,
      initialForceScale: options.initialForceScale
    } );

    this.model = model;
    this.popupLayer = new Node();
    this.backgroundNode = new Rectangle( 0, 0, 1, 1, {
      pickable: false,
      fill: new LinearGradient( 0, 0, 0, 1 )
        .addColorStop( 0, DensityBuoyancyCommonColors.skyTopProperty )
        .addColorStop( 1, DensityBuoyancyCommonColors.skyBottomProperty )
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.visibleBoundsProperty.link( visibleBounds => {
      this.backgroundNode.setRect( visibleBounds.left, visibleBounds.top, visibleBounds.width, visibleBounds.height );

      this.backgroundNode.fill = new LinearGradient( visibleBounds.centerX, visibleBounds.top, visibleBounds.centerX, visibleBounds.centerY )
        .addColorStop( 0, DensityBuoyancyCommonColors.skyTopProperty )
        .addColorStop( 1, DensityBuoyancyCommonColors.skyBottomProperty );
    } );
    this.addChild( this.backgroundNode );

    // TODO: The backgroundNode is behind the backgroundLayer, please document, see https://github.com/phetsims/density-buoyancy-common/issues/257
    this.backgroundLayer = new Node();
    this.addChild( this.backgroundLayer );

    this.sceneNode = new ThreeIsometricNode( this.layoutBounds, {
      parentMatrixProperty: animatedPanZoomSingleton.listener.matrixProperty,
      cameraPosition: options.cameraPosition,
      viewOffset: options.viewOffset,
      getPhetioMouseHit: point => {
        const pointedAtMass = this.getMassViewUnderPoint( this.localToGlobalPoint( point ), 'autoselect' );
        return pointedAtMass ? pointedAtMass.massView.mass.getPhetioMouseHitTarget() : pointedAtMass;
      },

      // So the sky background will show through
      backgroundProperty: new ColorProperty( Color.TRANSPARENT )
    } );
    this.addChild( this.sceneNode );

    this.addChild( this.massDecorationLayer );

    this.massViews = createObservableArray<MassView>();

    this.sceneNode.stage.threeCamera.zoom = options.cameraZoom;
    this.sceneNode.stage.threeCamera.up = new THREE.Vector3( 0, 0, -1 );
    this.sceneNode.stage.threeCamera.lookAt( ThreeUtils.vectorToThree( options.cameraLookAt ) );
    this.sceneNode.stage.threeCamera.updateMatrixWorld( true );
    this.sceneNode.stage.threeCamera.updateProjectionMatrix();

    let mouse: Mouse | null = null;

    // Empty shape to use when 3d objects are not focused
    const emptyShapeProperty = new Property( Shape.rectangle( 0, 0, 0, 0 ) );

    const updateCursor = ( newMouse?: Mouse ) => {
      mouse = newMouse || mouse;
      if ( mouse ) {
        const massUnderPointer = this.getMassViewUnderPointer( mouse );
        this.sceneNode.backgroundEventTarget.cursor = massUnderPointer ? 'pointer' : null;

        this.massViews.forEach( massView => {
          if ( massView.focusablePath ) {
            massView.focusablePath.shapeProperty = massView === massUnderPointer?.massView ?
                                                   massView.focusableShapeProperty : emptyShapeProperty;
          }
        } );
      }
    };

    const backgroundEventTargetListener = new BackgroundEventTargetListener(
      this.massViews,
      this.getMassViewUnderPointer.bind( this ),
      this.sceneNode.getRayFromScreenPoint.bind( this.sceneNode ),
      point => this.localToGlobalPoint( this.modelToViewPoint( point ) ),
      updateCursor,
      this.tandem.createTandem( 'backgroundEventTargetListener' )
    );
    this.sceneNode.backgroundEventTarget.addInputListener( backgroundEventTargetListener );

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
    // @ts-expect-error - THREE.js version incompatibility?
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

      // TODO: Document the purpose of this link, see https://github.com/phetsims/density-buoyancy-common/issues/257
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

    // Fluid
    const fluidGeometry = new THREE.BufferGeometry();
    const fluidPositionArray = DensityBuoyancyScreenView.createFluidVertexArray();
    fluidGeometry.addAttribute( 'position', new THREE.BufferAttribute( fluidPositionArray, 3 ) );
    fluidGeometry.addAttribute( 'normal', new THREE.BufferAttribute( DensityBuoyancyScreenView.createFluidNormalArray(), 3 ) );
    const fluidMaterial = new THREE.MeshLambertMaterial( {
      transparent: true,
      depthWrite: false
    } );

    model.pool.fluidMaterialProperty.linkColorProperty( fluidMaterial );
    const fluidMesh = new THREE.Mesh( fluidGeometry, fluidMaterial );
    this.sceneNode.stage.threeScene.add( fluidMesh );
    fluidMesh.renderOrder = 10;

    // boolean for optimization, to prevent zeroing out the remainder of the array if we have already done so
    let wasFilled = false;

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.pool.fluidYInterpolatedProperty.link( y => {
      wasFilled = this.fillFluidGeometry( y, fluidPositionArray, fluidGeometry, wasFilled );
    } );

    const onMassAdded = ( mass: Mass ) => {
      const massView = this.getMassViewFromMass( mass );
      this.sceneNode.stage.threeScene.add( massView.massMesh );
      this.massViews.push( massView );
      massView.focusablePath && this.sceneNode.backgroundEventTarget.addChild( massView.focusablePath );
      massView.decorate( this.massDecorationLayer );
    };

    model.masses.addItemAddedListener( onMassAdded );
    model.masses.forEach( onMassAdded );

    const onMassRemoved = ( mass: Mass ) => {
      const massView = _.find( this.massViews, massView => massView.mass === mass )!;

      // Remove the mass view
      this.sceneNode.stage.threeScene.remove( massView.massMesh );
      arrayRemove( this.massViews, massView );
      massView.dispose();
    };
    model.masses.addItemRemovedListener( onMassRemoved );

    const fluidLevelIndicator = new FluidLevelIndicator( model.pool.fluidLevelVolumeProperty );
    this.addChild( fluidLevelIndicator );

    // TODO: Document the reason for this link: https://github.com/phetsims/density-buoyancy-common/issues/257
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.pool.fluidYInterpolatedProperty.link( fluidY => {
      const modelPoint = new Vector3( model.poolBounds.minX, fluidY, model.poolBounds.maxZ );
      fluidLevelIndicator.translation = this.modelToViewPoint( modelPoint );
    } );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.resetEmitter.emit();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( new AlignBox( this.resetAllButton, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    this.resetEmitter.addListener( () => {
      this.displayProperties.reset();
    } );

    if ( DensityBuoyancyCommonQueryParameters.showDebug ) {
      const debugVisibleProperty = new BooleanProperty( true );

      this.debugView = this.createDebugView();
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

    // leftBarrierViewPointPropertyProperty and rightBarrierViewPointPropertyProperty are Property<Property>, and we need to listen
    // to when the value.value changes
    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    new DynamicProperty( this.leftBarrierViewPointPropertyProperty ).lazyLink( () => this.resizeBarrier() );
    new DynamicProperty( this.rightBarrierViewPointPropertyProperty ).lazyLink( () => this.resizeBarrier() );

    if ( !ThreeUtils.isWebGLEnabled() ) {
      ThreeUtils.showWebGLWarning( this );
    }
  }

  protected createDebugView(): DebugView {
    return new DebugView( this.model, this.layoutBounds );
  }

  protected getMassViewFromMass( mass: Mass ): MassView {
    if ( mass instanceof Cuboid ) {
      return new CuboidView( mass, this, this.displayProperties );
    }
    else if ( mass instanceof Scale ) {
      return new ScaleView( mass, this, this.model.gravityProperty );
    }
    else {
      throw new Error( 'massView is falsy' );
    }
  }

  protected fillFluidGeometry( y: number, fluidPositionArray: Float32Array, fluidGeometry: BufferGeometry, wasFilled: boolean ): boolean {
    wasFilled = DensityBuoyancyScreenView.fillFluidVertexArray( y, 0, 0, 0, this.model.poolBounds, fluidPositionArray, wasFilled );
    fluidGeometry.attributes.position.needsUpdate = true;
    fluidGeometry.computeBoundingSphere();

    return wasFilled;
  }

  /**
   * There is an invisible barrier that prevents objects from being dragged behind control panels.
   */
  private resizeBarrier(): void {
    const stage = this.sceneNode.stage;
    if ( stage.canvasWidth && stage.canvasHeight ) {
      const leftRay = this.sceneNode.getRayFromScreenPoint( this.localToGlobalPoint( this.leftBarrierViewPointPropertyProperty.value.value ) );
      const rightRay = this.sceneNode.getRayFromScreenPoint( this.localToGlobalPoint( this.rightBarrierViewPointPropertyProperty.value.value ) );
      const topRay = this.sceneNode.getRayFromScreenPoint( this.localToGlobalPoint( this.visibleBoundsProperty.value.centerTop ) );
      const leftPoint = new Plane3( Vector3.Z_UNIT, 0.09 ).intersectWithRay( leftRay );
      const rightPoint = new Plane3( Vector3.Z_UNIT, 0.09 ).intersectWithRay( rightRay );
      const topPoint = new Plane3( Vector3.Z_UNIT, 0.09 ).intersectWithRay( topRay );
      this.model.invisibleBarrierBoundsProperty.value = this.model.invisibleBarrierBoundsProperty.value.setMaxY( topPoint.y + 0.06 ).setMinX( leftPoint.x + 0.01 ).withMaxX( rightPoint.x - 0.01 );
    }
  }


  /////////////////////////////////////////////////////////////////
  // START: model view transform code

  /**
   * Projects a 3d model point to a 2d view point (in the screen view's coordinate frame).
   */
  public modelToViewPoint( point: Vector3 ): Vector2 {

    // We'll want to transform global coordinates into screen coordinates here
    // TODO: This would be better code, but it relies on the screenView already being a child. Can we get rid of animatedPanZoomSingleton usage somehow?, `this.globalToLocalPoint( this.sceneNode.projectPoint( point ) )` https://github.com/phetsims/density-buoyancy-common/issues/142
    return this.parentToLocalPoint( animatedPanZoomSingleton.listener.matrixProperty.value.inverted().timesVector2( this.sceneNode.projectPoint( point ) ) );
  }

  /**
   Get the difference in screen view coordinates between two model points. Both points are needed because of the 3d nature of the model   */
  public modelToViewDelta( point1: Vector3, point2: Vector3 ): Vector2 {
    const viewPoint1 = this.modelToViewPoint( point1 );
    const viewPoint2 = this.modelToViewPoint( point2 );
    return viewPoint2.minus( viewPoint1 );
  }

  /**
   * Project a 2d global screen coordinate into 3d global coordinate frame. Default to z distance of 0 (center of masses/pool)
   */
  public viewToModelPoint( point: Vector2, modelZ = 0 ): Vector3 {
    const viewPoint = animatedPanZoomSingleton.listener.matrixProperty.value.timesVector2( this.localToParentPoint( point ) );
    return this.sceneNode.unprojectPoint( viewPoint, modelZ );
  }

  /**
   * Get the difference in screen view coordinates from the first to the second provided screen points, in model
   * coordinates. Both points are needed because of the 3d nature of the model. Please note that the delta can have
   * negative values.
   */
  public viewToModelDelta( viewPoint1: Vector2, modelZ1: number, viewPoint2: Vector2, modelZ2: number ): Vector3 {
    const modelPoint1 = this.viewToModelPoint( viewPoint1, modelZ1 );
    const modelPoint2 = this.viewToModelPoint( viewPoint2, modelZ2 );
    return modelPoint2.minus( modelPoint1 );
  }

  // END: model view transform code
  /////////////////////////////////////////////////////////////////

  /**
   * Returns the closest grab-able mass under the pointer/
   */
  private getMassViewUnderPointer( pointer: Pointer ): PointedAtMassView | null {
    const point = pointer.point;
    if ( point === null ) {
      return null;
    }
    return this.getMassViewUnderPoint( point, 'input' );
  }

  /**
   * Returns the closest grab-able mass under the point
   */
  private getMassViewUnderPoint( point: Vector2, mode: 'autoselect' | 'input' ): PointedAtMassView | null {
    const ray = this.sceneNode.getRayFromScreenPoint( point );

    const entries: PointedAtMassView[] = [];
    this.massViews.forEach( massView => {
      const raycaster = new THREE.Raycaster( ThreeUtils.vectorToThree( ray.position ), ThreeUtils.vectorToThree( ray.direction ) );
      const intersections: THREE.Intersection<THREE.Group>[] = [];

      if ( massView.massMesh ) {
        raycaster.intersectObject( massView.massMesh, true, intersections );
      }

      const t = intersections.length ? intersections[ 0 ].distance : null;

      // Visit everything when in autoselect, but for input events, the mass must be movable and enabled.
      const isMassSelectable = mode === 'autoselect' || ( massView.mass.canMove && massView.mass.inputEnabledProperty.value );

      // Only visit masses that can move.
      if ( t !== null && isMassSelectable ) {
        entries.push( {
          massView: massView,
          t: t
        } );
      }
    } );

    const closestEntry = this.getMinClosestEntry( entries );

    return closestEntry ? { massView: closestEntry.massView, t: closestEntry.t } : null;
  }

  protected getMinClosestEntry( entries: PointedAtMassView[] ): PointedAtMassView | undefined {
    return _.minBy( entries, entry => entry.t );
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

    this.resizeBarrier();

    // Note that subclasses may have other layout considerations. If they affect the barrier, then rewrite to move
    // resizeBarrier() to be afterwards.
  }

  /**
   * Steps forward in time.
   */
  public override step( dt: number ): void {

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.massViews.forEach( massView => {
      massView.step( dt );

      assert && assert( massView.massMesh.position.x === massView.mass.matrix.translation.x );
    } );

    this.sceneNode.render( undefined );

    this.debugView && this.debugView.step( dt );
  }

  /**
   * Factored out way to only generate an icon with a whole new WebGL context if needed, otherwise just use the saved image.
   */
  public static getThreeIcon( iconBrowserImage: ImageableImage, generateIcon: () => Node ): Node {
    if ( DensityBuoyancyCommonQueryParameters.generateIconImages && ThreeUtils.isWebGLEnabled() ) {
      return generateIcon();
    }
    else {
      return new Image( iconBrowserImage );
    }
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

    const canvas = stage.renderToCanvas( 3, 1, new Vector2( 1, -1 ) );

    stage.dispose();

    // Output to the console, so we can regenerate them if we have changes
    console.log( canvas.toDataURL() );

    const image = new Image( canvas.toDataURL(), {
      mipmap: true,
      initialWidth: canvas.width,
      initialHeight: canvas.height
    } );
    image.left = 0;
    image.top = 0;
    return image;
  }

  /**
   * Creates a coordinate float array to be used with fillFluidVertexArray, for three.js purposes.
   */
  protected static createFluidVertexArray(): Float32Array {
    const CROSS_SECTION_SAMPLES = 30;
    return new Float32Array( ( CROSS_SECTION_SAMPLES + 1.5 ) * 3 * 3 * 4 );
  }

  /**
   * Creates a coordinate float array to be used with fillFluidVertexArray, for three.js purposes.
   */
  protected static createFluidNormalArray(): Float32Array {
    const array = DensityBuoyancyScreenView.createFluidVertexArray();

    for ( let i = 0; i < array.length / 3; i++ ) {

      // The first 6 normals should be 0,0,1 (front). After that, 0,1,0 (up)
      array[ i * 3 + ( i < 6 ? 2 : 1 ) ] = 1;
    }

    return array;
  }

  /**
   * Fills the positionArray with an X,Z cross-section of the fluid around a boat at a given y value (for a given liters
   * value).
   *
   * @returns - Whether the fluid is completely filled
   */
  private static fillFluidVertexArray( fluidY: number, boatX: number, boatY: number, liters: number, poolBounds: Bounds3, positionArray: Float32Array, wasFilled: boolean ): boolean {

    let index = 0;

    // Front
    index = ThreeUtils.writeFrontVertices( positionArray, index, new Bounds2(
      poolBounds.minX, poolBounds.minY,
      poolBounds.maxX, fluidY
    ), poolBounds.maxZ );

    // Top
    index = ThreeUtils.writeTopVertices( positionArray, index, new Bounds2(
      poolBounds.minX, poolBounds.minZ,
      poolBounds.maxX, poolBounds.maxZ
    ), fluidY );

    // If we were not filled before, we'll zero out the rest of the buffer
    if ( !wasFilled ) {
      positionArray.fill( 0, index );
    }

    return true;
  }
}

densityBuoyancyCommon.register( 'DensityBuoyancyScreenView', DensityBuoyancyScreenView );