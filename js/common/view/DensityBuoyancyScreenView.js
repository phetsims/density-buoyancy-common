// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const Color = require( 'SCENERY/util/Color' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const MobiusSceneNode = require( 'MOBIUS/MobiusSceneNode' );
  const Mouse = require( 'SCENERY/input/Mouse' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Plane3 = require( 'DOT/Plane3' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Text = require( 'SCENERY/nodes/Text' );
  const ThreeUtil = require( 'MOBIUS/ThreeUtil' );
  const Util = require( 'SCENERY/util/Util' );
  const Vector3 = require( 'DOT/Vector3' );

  // strings
  const webglWarningBodyString = require( 'string!SCENERY_PHET/webglWarning.body' );

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

      // @private {MobiusSceneNode}
      this.sceneNode = new MobiusSceneNode( this.layoutBounds, {
        cameraPosition: new Vector3( 0, 1.25, 13 )
      } );
      this.addChild( this.sceneNode );

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
      const frontMaterial = new THREE.MeshBasicMaterial( { color: new Color( 144, 104, 46 ).toNumber() } );
      const frontMesh = new THREE.Mesh( frontGeometry, frontMaterial );
      this.sceneNode.threeScene.add( frontMesh );

      // Top ground
      const topGeometry = new THREE.BufferGeometry();
      topGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( [
        // Left side
        ...ThreeUtil.topVertices( new Bounds2(
          model.groundBounds.minX, model.groundBounds.minZ,
          model.poolBounds.minX, model.groundBounds.maxZ
        ), model.groundBounds.maxY ),

        // Right side
        ...ThreeUtil.topVertices( new Bounds2(
          model.poolBounds.maxX, model.groundBounds.minZ,
          model.groundBounds.maxX, model.groundBounds.maxZ
        ), model.groundBounds.maxY ),

        // Back side side
        ...ThreeUtil.topVertices( new Bounds2(
          model.poolBounds.minX, model.groundBounds.minZ,
          model.poolBounds.maxX, model.poolBounds.minZ
        ), model.groundBounds.maxY )
      ] ), 3 ) );
      const topMaterial = new THREE.MeshBasicMaterial( { color: new Color( 107, 165, 75 ).toNumber() } );
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
      const poolMaterial = new THREE.MeshLambertMaterial( { color: new Color( 106, 106, 106 ).toNumber() } );
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

      // const meshes = [];
      const onMassAdded = mass => {

        // TODO: different view types for each
        const size = mass.sizeProperty.value;

        const boxGeometry = new THREE.BoxGeometry( size.width, size.height, size.depth );
        const boxMesh = new THREE.Mesh( boxGeometry, new THREE.MeshLambertMaterial( {
          color: 0xffaa44
        } ) );
        this.sceneNode.threeScene.add( boxMesh );

        const updatePosition = () => {
          const position = mass.matrix.translation;

          boxMesh.position.x = position.x;
          boxMesh.position.y = position.y;
        };

        mass.transformedEmitter.addListener( updatePosition );
        updatePosition();
      };
      model.masses.addItemAddedListener( onMassAdded );
      model.masses.forEach( onMassAdded );

      // model.masses.addItemRemovedListener( mass => {
      //   const massNode = _.find( this.massNodes, massNode => massNode.mass === mass );
      //   this.removeChild( massNode );
      //   massNode.dispose();
      // } );

      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
        },
        right: this.layoutBounds.maxX - 10,
        bottom: this.layoutBounds.maxY - 10,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );
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

      this.sceneNode && this.sceneNode.layout( width, height );
    }

    // @public
    step( dt ) {
      // const waterShape = Shape.bounds( this.modelViewTransform.modelToViewBounds( new Bounds2(
      //   this.model.poolBounds.minX, this.model.poolBounds.minY,
      //   this.model.poolBounds.maxX, this.model.liquidYProperty.value
      // ) ) );
      // this.waterPath.shape = waterShape;

      this.sceneNode && this.sceneNode.render( undefined );
    }
  }

  return densityBuoyancyCommon.register( 'DensityBuoyancyScreenView', DensityBuoyancyScreenView );
} );
