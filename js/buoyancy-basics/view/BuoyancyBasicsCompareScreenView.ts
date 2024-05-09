// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Compare screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { AlignBox, Node, Path, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyBasicsCompareModel from '../model/BuoyancyBasicsCompareModel.js';
import DensityAccordionBox from '../../buoyancy/view/DensityAccordionBox.js';
import BuoyancyDisplayOptionsNode from '../../common/view/BuoyancyDisplayOptionsNode.js';
import SubmergedAccordionBox from '../../buoyancy/view/SubmergedAccordionBox.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import BlockSet from '../../common/model/BlockSet.js';
import { ReadoutItemOptions } from '../../buoyancy/view/ReadoutListAccordionBox.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Mass from '../../common/model/Mass.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import DensityMaterials from '../../common/view/DensityMaterials.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import ScaleHeightControl from '../../common/view/ScaleHeightControl.js';
import smileWinkSolidShape from '../../../../sherpa/js/fontawesome-5/smileWinkSolidShape.js';
import FluidSelectionPanel from '../../buoyancy/view/FluidSelectionPanel.js';
import ComparisonControlPanel from '../../common/view/ComparisonControlPanel.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import ScaleView from '../../common/view/ScaleView.js';
import MassView from '../../common/view/MassView.js';
import CuboidView from '../../common/view/CuboidView.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

// Relatively arbitrary default
const MAX_RIGHT_SIDE_CONTENT_WIDTH = ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2;

export default class BuoyancyBasicsCompareScreenView extends DensityBuoyancyScreenView<BuoyancyBasicsCompareModel> {

  private readonly rightSideMaxContentWidthProperty = new Property( MAX_RIGHT_SIDE_CONTENT_WIDTH );
  private readonly rightSidePanelsVBox: Node;
  private readonly scaleHeightControl: ScaleHeightControl;

  public constructor( model: BuoyancyBasicsCompareModel, options: DensityBuoyancyScreenViewOptions ) {

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      // Custom just for this screen
      cameraLookAt: new Vector3( 0, -0.1, 0 ),

      layoutBounds: ScreenView.DEFAULT_LAYOUT_BOUNDS // used by constant above.
    }, options ) );

    const tandem = options.tandem;

    const blocksRadioButtonGroupTandem = options.tandem.createTandem( 'blocksRadioButtonGroup' );

    const blocksRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
      return {
        createNode: tandem => new Text( blockSet.stringProperty, {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 160,
          tandem: tandem.createTandem( 'labelText' )
        } ),
        value: blockSet,
        tandemName: `${blockSet.tandemName}RadioButton`
      };
    } ), {
      align: 'left',
      tandem: blocksRadioButtonGroupTandem
    } );
    const blockSetPanel = new Panel( blocksRadioButtonGroup, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( blockSetPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const displayOptionsPanel = new Panel( new BuoyancyDisplayOptionsNode( model, {
        includeVectorScaleControl: false,
        tandem: options.tandem.createTandem( 'buoyancyDisplayOptionsNode' )
      } ),
      DensityBuoyancyCommonConstants.PANEL_OPTIONS );
    this.addChild( new AlignBox( displayOptionsPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const fluidSelectionPanel = new FluidSelectionPanel( model.liquidMaterialProperty, {
      tandem: options.tandem.createTandem( 'fluidSelectionPanel' )
    } );
    this.addChild( new AlignBox( fluidSelectionPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );


    // Materials are set in densityBox.setMaterials() below
    const densityAccordionBox = new DensityAccordionBox( {
      expandedProperty: model.densityExpandedProperty,
      contentWidthMax: this.rightSideMaxContentWidthProperty,
      tandem: options.tandem.createTandem( 'densityAccordionBox' )
    } );

    const submergedAccordionBox = new SubmergedAccordionBox( model.gravityProperty, model.liquidMaterialProperty, {
      expandedProperty: model.percentageSubmergedExpandedProperty,
      contentWidthMax: this.rightSideMaxContentWidthProperty,
      tandem: options.tandem.createTandem( 'submergedAccordionBox' )
    } );

    const readoutItemsCache = new Map<BlockSet, {
      densityItems: ReadoutItemOptions<TReadOnlyProperty<Material>>[];
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
            readoutItem: model.liquidMaterialProperty,
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
      submergedAccordionBox.setReadoutItems( itemsForBoth.submergedItems );
      densityAccordionBox.setReadoutItems( itemsForBoth.densityItems );
    } );

    const numberControlPanel = new ComparisonControlPanel( model.massProperty, model.volumeProperty, model.densityProperty, model.blockSetProperty, {
      sliderTrackSize: new Dimension2( 80, 0.5 ),
      tandem: tandem // just pass through, because ComparisonControlPanel doesn't instrument the Panel.
    } );

    this.rightSidePanelsVBox = new VBox( {
      children: [ numberControlPanel, densityAccordionBox, submergedAccordionBox ],
      spacing: MARGIN
    } );
    this.addChild( this.rightSidePanelsVBox );

    // Info button and associated dialog
    this.scaleHeightControl = new ScaleHeightControl( model.poolScale, model.poolScaleHeightProperty,
      model.poolBounds, model.pool.liquidYInterpolatedProperty, this, {
        tandem: options.tandem.createTandem( 'scaleHeightControl' )
      } );
    this.addChild( this.scaleHeightControl );

    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    this.transformEmitter.addListener( () => this.layoutRightSidePanels() );
    this.rightSidePanelsVBox.localBoundsProperty.lazyLink( () => this.layoutRightSidePanels() );

    this.addChild( this.popupLayer );

    const scaleViews = this.massViews.filter( massView => massView instanceof ScaleView );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cuboidPDOMLayer,

      // Note: only the leftmost land scale is focusable in this screen, but we use the same code as the other screens for consistency
      // The blocks are added (a) pool then (b) outside, but the focus order is (a) outside then (b) pool
      ..._.reverse( scaleViews.map( scaleView => scaleView.focusablePath ) ),
      this.scaleHeightControl,

      blocksRadioButtonGroup,

      numberControlPanel,

      fluidSelectionPanel
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
      densityAccordionBox,
      submergedAccordionBox,
      this.resetAllButton
    ];
  }

  // Recalculate the space between the right visible bounds and the right side of the pool, for controls/etc to be positioned.
  private layoutRightSidePanels(): void {
    const rightSideOfPoolViewPoint = this.modelToViewPoint(
      new Vector3( this.model.pool.bounds.maxX, this.model.pool.bounds.maxY, this.model.pool.bounds.maxZ )
    );
    const availableRightSpace = this.visibleBoundsProperty.value.right - this.scaleHeightControl.right;

    // 2 margins for the spacing outside the panel, and 2 margins for the panel's content margin
    this.rightSideMaxContentWidthProperty.value = Math.min( availableRightSpace - 4 * MARGIN, MAX_RIGHT_SIDE_CONTENT_WIDTH );
    this.rightSidePanelsVBox.top = rightSideOfPoolViewPoint.y + MARGIN;
    this.rightSidePanelsVBox.right = this.visibleBoundsProperty.value.right - MARGIN;
  }

  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // X margin should be based on the front of the pool
    this.scaleHeightControl.x = this.modelToViewPoint( new Vector3(
      this.model.poolBounds.maxX,
      this.model.poolBounds.minY,
      this.model.poolBounds.maxZ
    ) ).plusXY( DensityBuoyancyCommonConstants.MARGIN / 2, 0 ).x;

    // Y should be based on the bottom of the front of the scale (in the middle of the pool)
    this.scaleHeightControl.y = this.modelToViewPoint( new Vector3(
      this.model.poolBounds.maxX,
      this.model.poolBounds.minY,
      this.model.poolScale.getBounds().maxZ
    ) ).y;

    this.layoutRightSidePanels();
  }


  public static getBuoyancyIntroIcon(): Node {
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

      const waterMaterial = new THREE.MeshLambertMaterial( {
        transparent: true
      } );
      const waterColor = DensityBuoyancyCommonColors.materialWaterColorProperty.value;
      waterMaterial.color = ThreeUtils.colorToThree( waterColor );
      waterMaterial.opacity = waterColor.alpha;

      // Fake it!
      const waterGeometry = new THREE.BoxGeometry( 1, 1, 0.2 );

      const water = new THREE.Mesh( waterGeometry, waterMaterial );
      water.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.5, 0.12 ) ) );
      scene.add( water );
    } );

  }

  public static getBuoyancyBasicsCompareIcon(): Node {
    return new Path( smileWinkSolidShape, { stroke: 'red', fill: 'blue' } );
  }
}

densityBuoyancyCommon.register( 'BuoyancyBasicsCompareScreenView', BuoyancyBasicsCompareScreenView );