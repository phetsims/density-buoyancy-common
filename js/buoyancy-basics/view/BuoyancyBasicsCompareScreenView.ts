// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Compare screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { AlignBox, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
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
import BuoyancyIntroModel from '../../buoyancy/model/BuoyancyIntroModel.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import BlockSet from '../../common/model/BlockSet.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import { ReadoutItemOptions } from '../../buoyancy/view/ReadoutListAccordionBox.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Mass from '../../common/model/Mass.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import DensityMaterials from '../../common/view/DensityMaterials.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';


// Any others are invisible in the radio buttons, and are only available through PhET-iO if a client decides
// to show them, https://github.com/phetsims/buoyancy/issues/58
const VISIBLE_FLUIDS = [
  Material.GASOLINE,
  Material.WATER,
  Material.SEAWATER,
  Material.HONEY,
  Material.MERCURY
];

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

// Relatively arbitrary default
const MAX_RIGHT_SIDE_CONTENT_WIDTH = ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2;

export default class BuoyancyBasicsCompareScreenView extends DensityBuoyancyScreenView<BuoyancyBasicsCompareModel> {

  private readonly rightSideMaxContentWidthProperty = new Property( MAX_RIGHT_SIDE_CONTENT_WIDTH );
  private readonly readoutPanelsVBox = new VBox( { spacing: MARGIN } );

  public constructor( model: BuoyancyIntroModel, options: DensityBuoyancyScreenViewOptions ) {

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      // Custom just for this screen
      cameraLookAt: new Vector3( 0, -0.1, 0 ),

      layoutBounds: ScreenView.DEFAULT_LAYOUT_BOUNDS // used by constant above.
    }, options ) );

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

    const displayOptionsPanel = new Panel( new BuoyancyDisplayOptionsNode( model, { includeVectorScaleControl: false } ),
      DensityBuoyancyCommonConstants.PANEL_OPTIONS );
    this.addChild( new AlignBox( displayOptionsPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const radioButtonLabelOptions = {
      font: new PhetFont( 14 ),
      maxWidth: 120
    };
    const radioButtonGroupTandem = options.tandem.createTandem( 'liquidMaterialRadioButtonGroup' );

    model.liquidMaterialProperty instanceof ReadOnlyProperty && this.addLinkedElement( model.liquidMaterialProperty, {
      tandem: radioButtonGroupTandem.createTandem( 'property' )
    } );

    const fluidBox = new HBox( {
      spacing: 20,
      children: DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MATERIALS.map( material => {
        return new AquaRadioButton( model.liquidMaterialProperty, material,
          new Text( material.nameProperty, radioButtonLabelOptions ), {
            tandem: radioButtonGroupTandem.createTandem( `${material.tandemName}RadioButton` ),
            visible: VISIBLE_FLUIDS.includes( material )
          } );
      } )
    } );
    const fluidTitle = new Text( DensityBuoyancyCommonStrings.fluidStringProperty, {
      font: DensityBuoyancyCommonConstants.TITLE_FONT,
      maxWidth: 160
    } );
    const fluidPanel = new Panel( new VBox( {
      children: [ fluidTitle, fluidBox ],
      spacing: 3,
      align: 'left'
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( fluidPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );


    // Materials are set in densityBox.setMaterials() below
    const densityBox = new DensityAccordionBox( {
      expandedProperty: model.densityExpandedProperty,
      contentWidthMax: this.rightSideMaxContentWidthProperty
    } );

    const submergedBox = new SubmergedAccordionBox( model.gravityProperty, model.liquidMaterialProperty, {
      contentWidthMax: this.rightSideMaxContentWidthProperty
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
      submergedBox.setReadoutItems( itemsForBoth.submergedItems );
      densityBox.setReadoutItems( itemsForBoth.densityItems );
    } );

    this.readoutPanelsVBox = new VBox( {
      children: [ densityBox, submergedBox ],
      spacing: MARGIN
    } );
    this.addChild( this.readoutPanelsVBox );

    this.addChild( this.popupLayer );
  }

  // Recalculate the space between the right visible bounds and the right side of the pool, for controls/etc to be positioned.
  private layoutRightSidePanels(): void {
    const rightSideOfPoolViewPoint = this.modelToViewPoint(
      new Vector3( this.model.pool.bounds.maxX, this.model.pool.bounds.maxY, this.model.pool.bounds.maxZ )
    );
    const availableRightSpace = this.visibleBoundsProperty.value.right - rightSideOfPoolViewPoint.x;

    // 2 margins for the spacing outside the panel, and 2 margins for the panel's content margin
    this.rightSideMaxContentWidthProperty.value = Math.min( availableRightSpace - 4 * MARGIN, MAX_RIGHT_SIDE_CONTENT_WIDTH );
    this.readoutPanelsVBox.top = rightSideOfPoolViewPoint.y + MARGIN;
    this.readoutPanelsVBox.left = rightSideOfPoolViewPoint.x + MARGIN;
  }

  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );
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
}

densityBuoyancyCommon.register( 'BuoyancyBasicsCompareScreenView', BuoyancyBasicsCompareScreenView );