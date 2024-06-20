// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import { AlignBox, Node } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityCompareModel from '../model/DensityCompareModel.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import BlocksValueControlPanel from '../../common/view/BlocksValueControlPanel.js';
import MassView from '../../common/view/MassView.js';
import CuboidView from '../../common/view/CuboidView.js';
import BlocksPanel from '../../common/view/BlocksPanel.js';

const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

type DensityCompareScreenViewOptions = DensityBuoyancyScreenViewOptions;

export default class DensityCompareScreenView extends DensityBuoyancyScreenView<DensityCompareModel> {

  private readonly positionPanel: () => void;

  public constructor( model: DensityCompareModel, options: DensityCompareScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, false, false, false, true, 1 / 16, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    const blocksPanel = new BlocksPanel( model.blockSetProperty, false, tandem.createTandem( 'blocksPanel' ) );

    this.addChild( new AlignBox( blocksPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const blocksValueControlPanel = new BlocksValueControlPanel( model.massProperty, model.volumeProperty, model.densityProperty, model.blockSetProperty, {
      tandem: tandem.createTandem( 'blocksValueControlPanel' )
    } );

    this.addChild( blocksValueControlPanel );

    this.positionPanel = () => {
      // We should be MARGIN below where the edge of the ground exists
      const groundFrontPoint = this.modelToViewPoint( new Vector3( 0, 0, model.groundBounds.maxZ ) );
      blocksValueControlPanel.top = groundFrontPoint.y + MARGIN;
      blocksValueControlPanel.right = this.visibleBoundsProperty.value.maxX - MARGIN;
    };

    this.positionPanel();
    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    this.transformEmitter.addListener( this.positionPanel );
    this.visibleBoundsProperty.lazyLink( this.positionPanel );
    blocksValueControlPanel.localBoundsProperty.lazyLink( this.positionPanel );

    this.addChild( this.popupLayer );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cuboidPDOMLayer,

      blocksPanel,

      blocksValueControlPanel
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView instanceof CuboidView ) {

        // Only Cuboids
        cuboidPDOMLayer.pdomOrder = this.massViews.filter( view => view instanceof CuboidView && view.focusablePath )

          // Sort alphabetically based on the tag, which is specified (locale-independently) in the tandem
          .sort( ( a, b ) => a.mass.tag.tandemName.localeCompare( b.mass.tag.tandemName ) )

          .map( view => view.focusablePath );
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
    };
    this.massViews.addItemAddedListener( massViewAdded );
    this.massViews.forEach( massViewAdded );

    this.pdomControlAreaNode.pdomOrder = [
      this.resetAllButton
    ];
  }

  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.positionPanel();
  }

  public static getDensityCompareIcon(): Node {

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
}

densityBuoyancyCommon.register( 'DensityCompareScreenView', DensityCompareScreenView );