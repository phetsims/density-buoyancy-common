// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Compare screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Node, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyCompareModel from '../model/BuoyancyCompareModel.js';
import DensityAccordionBox from './DensityAccordionBox.js';
import BuoyancyDisplayOptionsPanel from './BuoyancyDisplayOptionsPanel.js';
import SubmergedAccordionBox from './SubmergedAccordionBox.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import BlockSet from '../../common/model/BlockSet.js';
import { ReadoutItemOptions } from './ReadoutListAccordionBox.js';
import Mass from '../../common/model/Mass.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { DensityMaterials } from '../../common/view/MaterialView.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import FluidSelectionPanel from './FluidSelectionPanel.js';
import BlocksValuePanel from '../../common/view/BlocksValuePanel.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import ScaleView from '../../common/view/ScaleView.js';
import MassView from '../../common/view/MassView.js';
import CuboidView from '../../common/view/CuboidView.js';
import BlocksPanel from '../../common/view/BlocksPanel.js';
import Panel from '../../../../sun/js/Panel.js';
import BuoyancyScreenView from './BuoyancyScreenView.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import FluidIconMesh from '../../common/view/FluidIconMesh.js';
import MaterialProperty from '../../common/model/MaterialProperty.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

// Relatively arbitrary default
const MAX_RIGHT_SIDE_CONTENT_WIDTH = ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2;

type BuoyancyCompareScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class BuoyancyCompareScreenView extends BuoyancyScreenView<BuoyancyCompareModel> {

  private readonly rightSideMaxContentWidthProperty = new Property( MAX_RIGHT_SIDE_CONTENT_WIDTH );
  private readonly rightSidePanelsVBox: Node;

  private readonly blocksValuePanel: Panel;

  public constructor( model: BuoyancyCompareModel, options: BuoyancyCompareScreenViewOptions ) {

    // TODO: https://github.com/phetsims/density-buoyancy-common/issues/317 is combineOptions preferable to optionize here?
    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      supportsDepthLines: true,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: true,

      // Custom just for this screen
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_BASICS_CAMERA_LOOK_AT,
      viewOffset: DensityBuoyancyCommonConstants.BUOYANCY_BASICS_VIEW_OFFSET,

      layoutBounds: ScreenView.DEFAULT_LAYOUT_BOUNDS // used by constant above.
    }, options ) );

    const tandem = options.tandem;

    const blocksPanel = new BlocksPanel( model.blockSetProperty, tandem.createTandem( 'blocksPanel' ) );
    this.addAlignBox( blocksPanel, 'right', 'top' );

    const displayOptionsPanel = new BuoyancyDisplayOptionsPanel( this.displayProperties, {
      tandem: options.tandem.createTandem( 'displayOptionsPanel' ),
      contentWidth: this.modelToViewPoint( new Vector3(
        this.model.poolBounds.left,
        this.model.poolBounds.top,
        this.model.poolBounds.front
      ) ).x - 2 * MARGIN
    } );

    this.addAlignBox( displayOptionsPanel, 'left', 'bottom' );

    const fluidPanel = new FluidSelectionPanel( model.pool.fluidMaterialProperty, this.popupLayer, {
      tandem: options.tandem.createTandem( 'fluidPanel' )
    } );

    this.addAlignBox( fluidPanel, 'center', 'bottom' );

    this.blocksValuePanel = new BlocksValuePanel( model.massProperty, model.volumeProperty, model.densityProperty, model.blockSetProperty, {
      sliderTrackSize: new Dimension2( 120, 0.5 ),
      tandem: tandem.createTandem( 'blocksValuePanel' )
    } );

    // Materials are set in densityBox.setMaterials() below
    const densityComparisonAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.densityComparisonStringProperty, {
      contentWidthMax: this.rightSideMaxContentWidthProperty,
      tandem: options.tandem.createTandem( 'densityComparisonAccordionBox' )
    } );

    const percentSubmergedAccordionBox = new SubmergedAccordionBox( {
      contentWidthMax: this.rightSideMaxContentWidthProperty,
      tandem: options.tandem.createTandem( 'percentSubmergedAccordionBox' )
    } );

    const readoutItemsCache = new Map<BlockSet, {
      densityItems: ReadoutItemOptions<MaterialProperty>[];
      submergedItems: ReadoutItemOptions<Mass>[];
    }>();

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.blockSetProperty.link( blockSet => {

      if ( !readoutItemsCache.has( blockSet ) ) {
        const blocks = model.blockSetToMassesMap.get( blockSet )!;
        const submergedReadoutItems = blocks.map( mass => {
          return {
            readoutItem: mass,
            readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.blockPatternStringProperty, {
              tag: mass.nameProperty
            } ),
            readoutFormat: {
              font: DensityBuoyancyCommonConstants.ITEM_FONT,
              fill: mass.tag.colorProperty
            }
          };
        } );

        // Same options, but different readoutItem (mass->mass.materialProperty)
        const densityReadoutItems = [
          ...submergedReadoutItems.map( submergedReadoutItem => {
            return _.assignIn( {}, submergedReadoutItem, {
              readoutItem: submergedReadoutItem.readoutItem.materialProperty
            } );
          } ), {
            readoutItem: model.pool.fluidMaterialProperty,
            readoutFormat: {
              font: DensityBuoyancyCommonConstants.ITEM_FONT
            }
          }
        ];
        readoutItemsCache.set( blockSet, {
          densityItems: densityReadoutItems,
          submergedItems: submergedReadoutItems
        } );
      }
      const itemsForBoth = readoutItemsCache.get( blockSet )!;
      percentSubmergedAccordionBox.setReadoutItems( itemsForBoth.submergedItems );
      densityComparisonAccordionBox.setReadoutItems( itemsForBoth.densityItems );
    } );

    this.rightSidePanelsVBox = new VBox( {
      children: [ this.blocksValuePanel, densityComparisonAccordionBox, percentSubmergedAccordionBox ],
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL
    } );
    this.addChild( this.rightSidePanelsVBox );

    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    this.transformEmitter.addListener( () => this.layoutRightSidePanels() );
    this.rightSidePanelsVBox.localBoundsProperty.lazyLink( () => this.layoutRightSidePanels() );

    this.addChild( this.popupLayer );

    const scaleViews = this.massViews.filter( massView => massView instanceof ScaleView );

    this.resetEmitter.addListener( () => {
      densityComparisonAccordionBox.reset();
      percentSubmergedAccordionBox.reset();
    } );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cuboidPDOMLayer,

      // Note: only the leftmost land scale is focusable in this screen, but we use the same code as the other screens for consistency
      // The blocks are added (a) pool then (b) outside, but the focus order is (a) outside then (b) pool
      ..._.reverse( scaleViews.map( scaleView => scaleView.focusablePath ) ),

      this.poolScaleHeightControl,

      blocksPanel,

      this.blocksValuePanel,

      fluidPanel
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView instanceof CuboidView ) {
        cuboidPDOMLayer.pdomOrder = [ ...cuboidPDOMLayer.pdomOrder!, massView.focusablePath ];
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
    };
    this.massViews.addItemAddedListener( massViewAdded );
    this.massViews.forEach( massViewAdded );

    this.pdomControlAreaNode.pdomOrder = [
      displayOptionsPanel,
      densityComparisonAccordionBox,
      percentSubmergedAccordionBox,
      this.resetAllButton
    ];
  }

  // Reposition and rescale the right side content
  private layoutRightSidePanels(): void {
    const rightSideOfPoolViewPoint = this.modelToViewPoint(
      new Vector3( this.model.pool.bounds.maxX, this.model.pool.bounds.maxY, this.model.pool.bounds.maxZ )
    );
    this.rightSidePanelsVBox.top = rightSideOfPoolViewPoint.y + MARGIN;
    this.rightSidePanelsVBox.right = this.visibleBoundsProperty.value.right - MARGIN;
    this.rightSideMaxContentWidthProperty.value = this.blocksValuePanel.width - 2 * DensityBuoyancyCommonConstants.PANEL_OPTIONS.xMargin;
  }

  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );
    this.layoutRightSidePanels();
  }

  public static getBuoyancyCompareIcon(): Node {
    return DensityBuoyancyScreenView.getAngledIcon( 4, new Vector3( 0, -0.05, 0 ), scene => {

      const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

      const box1 = new THREE.Mesh( boxGeometry, new THREE.MeshStandardMaterial( {
        map: DensityMaterials.woodColorTexture,
        normalMap: DensityMaterials.woodNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: DensityMaterials.woodRoughnessTexture,
        metalness: 0
        // NOTE: Removed the environment map for now
      } ) );
      box1.position.copy( ThreeUtils.vectorToThree( new Vector3( 0.08, -0.02, 0 ) ) );

      scene.add( box1 );

      const box2 = new THREE.Mesh( boxGeometry, new THREE.MeshStandardMaterial( {
        map: DensityMaterials.brickColorTexture,
        normalMap: DensityMaterials.brickNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        metalness: 0
        // NOTE: Removed the environment map for now
      } ) );
      box2.position.copy( ThreeUtils.vectorToThree( new Vector3( -0.08, -0.1, 0 ) ) );

      scene.add( box2 );

      scene.add( new FluidIconMesh( new Vector3( 0, -0.5, 0.12 ) ) );
    } );
  }
}

densityBuoyancyCommon.register( 'BuoyancyCompareScreenView', BuoyancyCompareScreenView );