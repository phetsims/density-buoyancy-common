// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { ManualConstraint, Node, VBox } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import ABControlsNode from '../../common/view/ABControlsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyBasicsExploreModel from '../model/BuoyancyBasicsExploreModel.js';
import SubmergedAccordionBox from '../../buoyancy/view/SubmergedAccordionBox.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import BlocksModeRadioButtonGroup from '../../common/view/BlocksModeRadioButtonGroup.js';
import FluidSelectionPanel from '../../buoyancy/view/FluidSelectionPanel.js';
import CuboidView from '../../common/view/CuboidView.js';
import ScaleView from '../../common/view/ScaleView.js';
import MassView from '../../common/view/MassView.js';
import DensityAccordionBox from '../../buoyancy/view/DensityAccordionBox.js';
import BuoyancyScreenView from '../../buoyancy/view/BuoyancyScreenView.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import getBuoyancyExploreIcon from '../../buoyancy/view/getBuoyancyExploreIcon.js';

type BuoyancyExploreScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class BuoyancyBasicsExploreScreenView extends BuoyancyScreenView<BuoyancyBasicsExploreModel> {

  private readonly rightBox: ABControlsNode;

  public constructor( model: BuoyancyBasicsExploreModel, options: BuoyancyExploreScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      supportsDepthLines: true,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: true,
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_BASICS_CAMERA_LOOK_AT,
      viewOffset: DensityBuoyancyCommonConstants.BUOYANCY_BASICS_VIEW_OFFSET
    }, options ) );

    this.addAlignBox( this.displayOptionsPanel, 'left', 'bottom' );

    this.rightBox = new ABControlsNode(
      model.blockA,
      model.blockB,
      this.popupLayer, {
        useDensityControlInsteadOfMassControl: true,
        syncCustomMaterialDensity: false,
        ownsCustomDensityRange: false,
        customKeepsConstantDensity: true,
        tandem: tandem,
        minCustomMass: 0.1,
        maxCustomMass: 15
      }
    );

    const fluidPanel = new FluidSelectionPanel( model.pool.fluidMaterialProperty, this.popupLayer, {
      tandem: options.tandem.createTandem( 'fluidPanel' )
    } );

    this.addAlignBox( fluidPanel, 'center', 'bottom' );

    const densityComparisonAccordionBox = new DensityAccordionBox( DensityBuoyancyCommonStrings.densityComparisonStringProperty, {
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'densityComparisonAccordionBox' )
    } );

    const percentSubmergedAccordionBox = new SubmergedAccordionBox( {
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'percentSubmergedAccordionBox' )
    } );

    const customExploreScreenFormatting = [ model.blockA, model.blockB ].map( mass => {
      return {
        readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.blockPatternStringProperty, { tag: mass.nameProperty } ),
        readoutFormat: { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: mass.tag.colorProperty }
      };
    } );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.blockB.visibleProperty.link( visible => {
      const masses = visible ? [ model.blockA, model.blockB ] : [ model.blockA ];
      const submergedReadoutItems = masses.map( ( mass, index ) => {
        return {
          readoutItem: mass,
          readoutNameProperty: customExploreScreenFormatting[ index ].readoutNameProperty,
          readoutFormat: customExploreScreenFormatting[ index ].readoutFormat
        };
      } );
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
      percentSubmergedAccordionBox.setReadoutItems( submergedReadoutItems );
      densityComparisonAccordionBox.setReadoutItems( densityReadoutItems );
    } );

    const rightSideVBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'right',
      children: [
        this.rightBox,
        densityComparisonAccordionBox,
        percentSubmergedAccordionBox
      ]
    } );

    this.addAlignBox( rightSideVBox, 'right', 'top' );

    const blocksModeRadioButtonGroup = new BlocksModeRadioButtonGroup( model.modeProperty, {
      tandem: this.tandem.createTandem( 'blocksModeRadioButtonGroup' )
    } );

    ManualConstraint.create( this, [ this.resetAllButton, blocksModeRadioButtonGroup ],
      ( resetAllButtonWrapper, blocksModeRadioButtonGroupWrapper ) => {

        // Set the location of the blocks mode radio button relative to the reset all button, or the right side of the screen
        // if the reset all button is not visible
        blocksModeRadioButtonGroupWrapper.right = resetAllButtonWrapper.visible ? ( resetAllButtonWrapper.left - DensityBuoyancyCommonConstants.MARGIN ) : resetAllButtonWrapper.right;
        blocksModeRadioButtonGroupWrapper.bottom = resetAllButtonWrapper.bottom;
      } );

    this.addChild( blocksModeRadioButtonGroup );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ rightSideVBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {

      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    } );

    this.addChild( this.popupLayer );

    this.resetEmitter.addListener( () => {
      densityComparisonAccordionBox.reset();
      percentSubmergedAccordionBox.reset();
    } );

    const cuboidViews = this.massViews.filter( massView => massView instanceof CuboidView );
    const scaleViews = this.massViews.filter( massView => massView instanceof ScaleView );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cuboidViews[ 0 ].focusablePath,
      this.rightBox.controlANode,

      cuboidPDOMLayer,
      this.rightBox.controlBNode,

      // Note: only the leftmost land scale is focusable in this screen, but we use the same code as the other screens for consistency
      // The blocks are added (a) pool then (b) outside, but the focus order is (a) outside then (b) pool
      ..._.reverse( scaleViews.map( scaleView => scaleView.focusablePath ) ),

      this.poolScaleHeightControl,

      fluidPanel
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView instanceof CuboidView && massView.mass === model.blockB ) {
        cuboidPDOMLayer.pdomOrder = [ ...cuboidPDOMLayer.pdomOrder!, massView.focusablePath ];
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
    };
    this.massViews.addItemAddedListener( massViewAdded );
    this.massViews.forEach( massViewAdded );

    this.pdomControlAreaNode.pdomOrder = [
      blocksModeRadioButtonGroup,
      this.displayOptionsPanel,
      densityComparisonAccordionBox,
      percentSubmergedAccordionBox,
      this.resetAllButton
    ];
  }

  public static getBuoyancyBasicsExploreIcon(): Node {
    return getBuoyancyExploreIcon();
  }
}

densityBuoyancyCommon.register( 'BuoyancyBasicsExploreScreenView', BuoyancyBasicsExploreScreenView );