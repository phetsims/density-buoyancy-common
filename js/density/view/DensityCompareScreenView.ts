// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import { Node } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityCompareModel from '../model/DensityCompareModel.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import BlocksValuePanel from '../../common/view/BlocksValuePanel.js';
import MassView from '../../common/view/MassView.js';
import CuboidView from '../../common/view/CuboidView.js';
import BlocksPanel from '../../common/view/BlocksPanel.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

type DensityCompareScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class DensityCompareScreenView extends DensityBuoyancyScreenView<DensityCompareModel> {

  private readonly positionPanel: () => void;

  public constructor( model: DensityCompareModel, options: DensityCompareScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      canShowForces: false,
      supportsDepthLines: false,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: true,
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    const blocksPanel = new BlocksPanel( model.blockSetProperty, tandem.createTandem( 'blocksPanel' ) );
    this.addAlignBox( blocksPanel, 'right', 'top' );

    const blocksValuePanel = new BlocksValuePanel( model.massProperty, model.volumeProperty, model.densityProperty, model.blockSetProperty, {
      tandem: tandem.createTandem( 'blocksValuePanel' )
    } );

    this.addChild( blocksValuePanel );

    this.positionPanel = () => {
      // We should be MARGIN below where the edge of the ground exists
      const groundFrontPoint = this.modelToViewPoint( new Vector3( 0, 0, model.groundBounds.maxZ ) );
      blocksValuePanel.top = groundFrontPoint.y + MARGIN;
      blocksValuePanel.right = this.visibleBoundsProperty.value.maxX - MARGIN;
    };

    this.positionPanel();
    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    this.transformEmitter.addListener( this.positionPanel );
    this.visibleBoundsProperty.lazyLink( this.positionPanel );
    blocksValuePanel.localBoundsProperty.lazyLink( this.positionPanel );

    this.addChild( this.popupLayer );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cuboidPDOMLayer,

      blocksPanel,

      blocksValuePanel
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
}

densityBuoyancyCommon.register( 'DensityCompareScreenView', DensityCompareScreenView );