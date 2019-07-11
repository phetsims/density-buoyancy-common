// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const arrayRemove = require( 'PHET_CORE/arrayRemove' );
  const Boat = require( 'DENSITY_BUOYANCY_COMMON/common/model/Boat' );
  const BoatView = require( 'DENSITY_BUOYANCY_COMMON/common/view/BoatView' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Color = require( 'SCENERY/util/Color' );
  const Cone = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cone' );
  const ConeView = require( 'DENSITY_BUOYANCY_COMMON/common/view/ConeView' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const CuboidView = require( 'DENSITY_BUOYANCY_COMMON/common/view/CuboidView' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityControlNode' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DisplayOptionsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DisplayOptionsNode' );
  const Ellipsoid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Ellipsoid' );
  const EllipsoidView = require( 'DENSITY_BUOYANCY_COMMON/common/view/EllipsoidView' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const ForceDiagramNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/ForceDiagramNode' );
  const GravityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/GravityControlNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const MobiusSceneNode = require( 'MOBIUS/MobiusSceneNode' );
  const Mouse = require( 'SCENERY/input/Mouse' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Plane3 = require( 'DOT/Plane3' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Text = require( 'SCENERY/nodes/Text' );
  const ThreeUtil = require( 'MOBIUS/ThreeUtil' );
  const Util = require( 'SCENERY/util/Util' );
  const Vector3 = require( 'DOT/Vector3' );
  const WaterLevelIndicator = require( 'DENSITY_BUOYANCY_COMMON/common/view/WaterLevelIndicator' );

  // strings
  const webglWarningBodyString = require( 'string!SCENERY_PHET/webglWarning.body' );

  // constants
  const MARGIN = 10;

  class DensityBuoyancyScreenView extends ScreenView {

    /**
     * @param {DensityBuoyancyModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      // TODO: Some logic from CanvasWarningNode. Factor out once ideal description is found
      if ( !phet.chipper.queryParameters.webgl || !Util.isWebGLSupported ) {
        const warningNode = new HBox( {
          children: [
            new FontAwesomeNode( 'warning_sign', {
              fill: '#E87600', // "safety orange", according to Wikipedia
              scale: 0.8
            } ),
            new Text( webglWarningBodyString, {
              font: new PhetFont( 16 ),
              fill: '#000',
              maxWidth: 600
            } )
          ],
          spacing: 12,
          align: 'center',
          cursor: 'pointer',
          center: this.layoutBounds.center
        } );
        this.addChild( warningNode );

        warningNode.mouseArea = warningNode.touchArea = warningNode.localBounds;

        warningNode.addInputListener( {
          up: function() {
            var phetWindow = window.open( 'http://phet.colorado.edu/webgl-disabled-page?simLocale=' + phet.joist.sim.locale, '_blank' );
            phetWindow.focus();
          }
        } );
        return this;
      }

      // @private {DensityBuoyancyModel}
      this.model = model;

      const popupLayer = new Node();

      // @private {Rectangle} - The sky background, in a unit 0-to-1 rectangle (so we can scale it to match)
      this.backgroundNode = new Rectangle( 0, 0, 1, 1, {
        fill: new LinearGradient( 0, 0, 0, 1 )
                .addColorStop( 0, DensityBuoyancyCommonColorProfile.skyTopProperty )
                .addColorStop( 1, DensityBuoyancyCommonColorProfile.skyBottomProperty )
      } );
      this.visibleBoundsProperty.link( visibleBounds => {
        this.backgroundNode.translation = visibleBounds.leftTop;
        this.backgroundNode.setScaleMagnitude( visibleBounds.width, visibleBounds.height / 2 );
      } );
      this.addChild( this.backgroundNode );

      // @private {MobiusSceneNode}
      this.sceneNode = new MobiusSceneNode( this.layoutBounds, {
        cameraPosition: new Vector3( 0, 0.4, 2 )
      } );
      this.addChild( this.sceneNode );

      // @private {Node}
      this.forceDiagramLayer = new Node();
      this.addChild( this.forceDiagramLayer );

      // @private {Array.<MassView>}
      this.massViews = [];

      // @private {Array.<ForceDiagramNode>}
      this.forceDiagramNodes = [];

      this.sceneNode.threeCamera.zoom = 1.7;
      this.sceneNode.threeCamera.updateProjectionMatrix();
      this.sceneNode.threeCamera.up = new THREE.Vector3( 0, 0, -1 );
      this.sceneNode.threeCamera.lookAt( new THREE.Vector3( 0, -0.1, 0 ) );

      this.sceneNode.backgroundEventTarget.addInputListener( {
        mousemove: event => {
          this.sceneNode.backgroundEventTarget.cursor = this.getMassUnderPointer( event.pointer, false ) ? 'pointer' : null;
        }
      } );

      // TODO: cleanup!
      const self = this;
      this.sceneNode.backgroundEventTarget.addInputListener( {
        down: function( event, trail ) {
          if ( !event.canStartPress() ) { return; }

          const isTouch = !( event.pointer instanceof Mouse );
          const mass = self.getMassUnderPointer( event.pointer, isTouch );

          if ( mass && !mass.userControlledProperty.value ) {

            const initialRay = self.sceneNode.getRayFromScreenPoint( event.pointer.point );
            const initialT = mass.intersect( initialRay, isTouch );
            const initialPosition = initialRay.pointAtDistance( initialT );
            const initialPlane = new Plane3( Vector3.Z_UNIT, initialPosition.z );

            mass.startDrag( initialPosition.toVector2() );

            event.pointer.cursor = 'pointer';
            event.pointer.addInputListener( {
              // end drag on either up or cancel (not supporting full cancel behavior)
              up: function( event, trail ) {
                this.endDrag( event, trail );
              },
              cancel: function( event, trail ) {
                this.endDrag( event, trail );
              },

              move: function( event, trail ) {
                const ray = self.sceneNode.getRayFromScreenPoint( event.pointer.point );
                const position = initialPlane.intersectWithRay( ray );

                mass.updateDrag( position.toVector2() );
              },

              // not a Scenery event
              endDrag: function( event, trail ) {
                event.pointer.removeInputListener( this );
                event.pointer.cursor = null;

                mass.endDrag();
              }
            } );
          }
        }
      } );

      const ambientLight = new THREE.AmbientLight( 0x555555 );
      this.sceneNode.threeScene.add( ambientLight );

      const sunLight = new THREE.DirectionalLight( 0xffffff, 1 );
      sunLight.position.set( -1, 1.5, 0.8 );
      this.sceneNode.threeScene.add( sunLight );

      // Front ground
      const frontGeometry = new THREE.BufferGeometry();
      frontGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
        // Left side
        ...ThreeUtil.frontVertices( new Bounds2(
          model.groundBounds.minX, model.groundBounds.minY,
          model.poolBounds.minX, model.groundBounds.maxY
        ), model.groundBounds.maxZ ),

        // Right side
        ...ThreeUtil.frontVertices( new Bounds2(
          model.poolBounds.maxX, model.groundBounds.minY,
          model.groundBounds.maxX, model.groundBounds.maxY
        ), model.groundBounds.maxZ ),

        // Bottom
        ...ThreeUtil.frontVertices( new Bounds2(
          model.poolBounds.minX, model.groundBounds.minY,
          model.poolBounds.maxX, model.poolBounds.minY
        ), model.groundBounds.maxZ )
      ] ), 3 ) );
      const groundMaterial = new THREE.MeshBasicMaterial();
      DensityBuoyancyCommonColorProfile.groundProperty.link( groundColor => {
        groundMaterial.color = ThreeUtil.colorToThree( groundColor );
      } );

      const frontMesh = new THREE.Mesh( frontGeometry, groundMaterial );
      this.sceneNode.threeScene.add( frontMesh );

      // Top ground
      const topGeometry = new THREE.BufferGeometry();
      topGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
        // Left side
        ...ThreeUtil.topVertices( new Bounds2(
          model.groundBounds.minX, model.poolBounds.minZ,
          model.poolBounds.minX, model.groundBounds.maxZ
        ), model.groundBounds.maxY ),

        // Right side
        ...ThreeUtil.topVertices( new Bounds2(
          model.poolBounds.maxX, model.poolBounds.minZ,
          model.groundBounds.maxX, model.groundBounds.maxZ
        ), model.groundBounds.maxY ),

        // Back side
        ...ThreeUtil.topVertices( new Bounds2(
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
      DensityBuoyancyCommonColorProfile.grassCloseProperty.link( grassCloseColor => {
        for ( let i = 0; i < 12; i++ ) {
          topColorArray[ i * 3 + 0 ] = grassCloseColor.r / 255;
          topColorArray[ i * 3 + 1 ] = grassCloseColor.g / 255;
          topColorArray[ i * 3 + 2 ] = grassCloseColor.b / 255;
        }
        const offset = 3 * 2 * 6;
        topColorArray[ offset + 0 ] = topColorArray[ offset + 3 ] = topColorArray[ offset + 12 ] = grassCloseColor.r / 255;
        topColorArray[ offset + 1 ] = topColorArray[ offset + 4 ] = topColorArray[ offset + 13 ] = grassCloseColor.g / 255;
        topColorArray[ offset + 2 ] = topColorArray[ offset + 5 ] = topColorArray[ offset + 14 ] = grassCloseColor.b / 255;
        topGeometry.attributes.color.needsUpdate = true;
      } );
      DensityBuoyancyCommonColorProfile.grassFarProperty.link( grassFarColor => {
        const offset = 3 * 2 * 6;
        topColorArray[ offset + 6 ] = topColorArray[ offset + 9 ] = topColorArray[ offset + 15 ] = grassFarColor.r / 255;
        topColorArray[ offset + 7 ] = topColorArray[ offset + 10 ] = topColorArray[ offset + 16 ] = grassFarColor.g / 255;
        topColorArray[ offset + 8 ] = topColorArray[ offset + 11 ] = topColorArray[ offset + 17 ] = grassFarColor.b / 255;
        topGeometry.attributes.color.needsUpdate = true;
      } );
      const topMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
      const topMesh = new THREE.Mesh( topGeometry, topMaterial );
      this.sceneNode.threeScene.add( topMesh );

      // Pool interior
      const poolGeometry = new THREE.BufferGeometry();
      poolGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
        // Bottom
        ...ThreeUtil.topVertices( new Bounds2(
          model.poolBounds.minX, model.poolBounds.minZ,
          model.poolBounds.maxX, model.poolBounds.maxZ
        ), model.poolBounds.minY ),

        // Back
        ...ThreeUtil.frontVertices( new Bounds2(
          model.poolBounds.minX, model.poolBounds.minY,
          model.poolBounds.maxX, model.poolBounds.maxY
        ), model.poolBounds.minZ ),

        // Left
        ...ThreeUtil.rightVertices( new Bounds2(
          model.poolBounds.minZ, model.poolBounds.minY,
          model.poolBounds.maxZ, model.poolBounds.maxY
        ), model.poolBounds.minX ),

        // Right
        ...ThreeUtil.leftVertices( new Bounds2(
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
      DensityBuoyancyCommonColorProfile.poolSurfaceProperty.link( poolSurfaceColor => {
        poolMaterial.color = ThreeUtil.colorToThree( poolSurfaceColor );
      } );

      const poolMesh = new THREE.Mesh( poolGeometry, poolMaterial );
      this.sceneNode.threeScene.add( poolMesh );

      // Water
      const waterGeometry = new THREE.BufferGeometry();
      waterGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
        // Front
        ...ThreeUtil.frontVertices( new Bounds2(
          model.poolBounds.minX, model.poolBounds.minY,
          model.poolBounds.maxX, model.poolBounds.maxY
        ), model.poolBounds.maxZ ),

        // Top
        ...ThreeUtil.topVertices( new Bounds2(
          model.poolBounds.minX, model.poolBounds.minZ,
          model.poolBounds.maxX, model.poolBounds.maxZ
        ), model.poolBounds.maxY )
      ] ), 3 ) );
      waterGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( [
        // Front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // Top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0
      ] ), 3 ) );
      const waterMaterial = new THREE.MeshLambertMaterial( {
        color: new Color( 0, 128, 255 ).toNumber(),
        transparent: true,
        opacity: 0.4
      } );
      const waterMesh = new THREE.Mesh( waterGeometry, waterMaterial );
      this.sceneNode.threeScene.add( waterMesh );

      model.liquidYProperty.link( y => {
        const vertices = [
          // Front
          ...ThreeUtil.frontVertices( new Bounds2(
            model.poolBounds.minX, model.poolBounds.minY,
            model.poolBounds.maxX, y
          ), model.poolBounds.maxZ ),

          // Top
          ...ThreeUtil.topVertices( new Bounds2(
            model.poolBounds.minX, model.poolBounds.minZ,
            model.poolBounds.maxX, model.poolBounds.maxZ
          ), y )
        ];
        for ( let i = 0; i < vertices.length; i++ ) {
          waterGeometry.attributes.position.array[ i ] = vertices[ i ];
        }
        waterGeometry.attributes.position.needsUpdate = true;
        waterGeometry.computeBoundingSphere();
      } );

      const onMassAdded = mass => {
        let massView = null;

        if ( mass instanceof Cuboid ) {
          massView = new CuboidView( mass );
        }
        else if ( mass instanceof Boat ) {
          massView = new BoatView( mass );
        }
        else if ( mass instanceof Cone ) {
          massView = new ConeView( mass );
        }
        else if ( mass instanceof Ellipsoid ) {
          massView = new EllipsoidView( mass );
        }

        if ( massView ) {
          this.sceneNode.threeScene.add( massView );
          this.massViews.push( massView );

          const forceDiagramNode = new ForceDiagramNode(
            mass,
            model.showGravityForceProperty,
            model.showBuoyancyForceProperty,
            model.showContactForceProperty,
            model.showForceValuesProperty
          );
          this.forceDiagramLayer.addChild( forceDiagramNode );
          this.forceDiagramNodes.push( forceDiagramNode );
        }
      };
      model.masses.addItemAddedListener( onMassAdded );
      model.masses.forEach( onMassAdded );

      const onMassRemoved = mass => {
        // Mass view
        const massView = _.find( this.massViews, massView => massView.mass === mass );
        this.sceneNode.threeScene.remove( massView );
        arrayRemove( this.massViews, massView );
        massView.dispose();

        // Force diagram node
        const forceDiagramNode = _.find( this.forceDiagramNodes, forceDiagramNode => forceDiagramNode.mass === mass );
        this.forceDiagramLayer.removeChild( forceDiagramNode );
        arrayRemove( this.forceDiagramNodes, forceDiagramNode );
        forceDiagramNode.dispose();
      };
      model.masses.addItemRemovedListener( onMassRemoved );

      const waterLevelIndicator = new WaterLevelIndicator( new DerivedProperty( [ model.liquidYProperty ], liquidY => {
        return model.poolBounds.width * model.poolBounds.depth * ( liquidY - model.poolBounds.minY );
      } ) );
      this.addChild( waterLevelIndicator );
      model.liquidYProperty.link( liquidY => {
        const modelPoint = new Vector3( model.poolBounds.minX, liquidY, model.poolBounds.maxZ );
        waterLevelIndicator.translation = this.modelToViewPoint( modelPoint );
      } );

      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
        },
        right: this.layoutBounds.right - MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );

      this.addChild( new Panel( new DisplayOptionsNode( model ), {
        xMargin: 10,
        yMargin: 10,
        left: this.layoutBounds.left + MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( new Panel( new DensityControlNode( model.liquidMaterialProperty, popupLayer ), {
        xMargin: 10,
        yMargin: 10,
        right: this.layoutBounds.centerX - MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( new Panel( new GravityControlNode( model.gravityProperty, popupLayer ), {
        xMargin: 10,
        yMargin: 10,
        left: this.layoutBounds.centerX + MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( popupLayer );
    }

    /**
     * Projects a 3d model point to a 2d view point (in the screen view's coordinate frame).
     * @public
     *
     * @param {Vector3} point
     * @returns {Vector2}
     */
    modelToViewPoint( point ) {
      return this.parentToLocalPoint( this.sceneNode.projectPoint( point ) );
    }

    getMassUnderPointer( pointer, isTouch ) {
      const ray = this.sceneNode.getRayFromScreenPoint( pointer.point );

      let closestT = Number.POSITIVE_INFINITY;
      let closestMass = null;

      this.model.masses.forEach( mass => {
        const t = mass.intersect( ray, isTouch );

        if ( t !== null && t < closestT ) {
          closestT = t;
          closestMass = mass;
        }
      } );

      return closestMass;
    }

    /**
     * @override
     * @param {number} width
     * @param {number} height
     */
    layout( width, height ) {
      super.layout( width, height );

      // If the simulation was not able to load for WebGL, bail out
      if ( !this.sceneNode ) {
        return;
      }

      this.sceneNode.layout( width, height );
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

      // Update the views
      this.massViews.forEach( massView => massView.update( this.sceneNode.threeScene, this.sceneNode.threeRenderer ) );

      this.sceneNode.render( undefined );

      this.forceDiagramNodes.forEach( forceDiagramNode => {
        forceDiagramNode.update();

        const mass = forceDiagramNode.mass;
        forceDiagramNode.translation = this.modelToViewPoint( mass.matrix.translation.plus( mass.forceOffsetProperty.value ) );
      } );
    }
  }

  return densityBuoyancyCommon.register( 'DensityBuoyancyScreenView', DensityBuoyancyScreenView );
} );
