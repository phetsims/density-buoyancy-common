// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Node, RichText } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import ABControlsNode from '../../common/view/ABControlsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityNumberLineNode from './DensityNumberLineNode.js';
import DensityIntroModel from '../model/DensityIntroModel.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import BlocksModeRadioButtonGroup from '../../common/view/BlocksModeRadioButtonGroup.js';
import MassView from '../../common/view/MassView.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';

type DensityIntroScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class DensityIntroScreenView extends DensityBuoyancyScreenView<DensityIntroModel> {

  private readonly rightBox: ABControlsNode;

  public constructor( model: DensityIntroModel, options: DensityIntroScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      canShowForces: false,
      supportsDepthLines: false,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: true,
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    this.rightBox = new ABControlsNode(
      model.blockA,
      model.blockB,
      this.popupLayer, {
        tandem: tandem,
        maxCustomMass: 10
      } );

    const accordionTandem = tandem.createTandem( 'densityAccordionBox' );
    const accordionBoxTitleStringProperty = new DerivedStringProperty( [
      DensityBuoyancyCommonPreferences.volumeUnitsProperty,
      DensityBuoyancyCommonStrings.densityReadoutStringProperty,
      DensityBuoyancyCommonStrings.densityReadoutDecimetersCubedStringProperty
    ], ( units, litersReadout, decimetersCubedReadout ) => {
      return units === 'liters' ? litersReadout : decimetersCubedReadout;
    }, {
      tandem: accordionTandem.createTandem( 'titleStringProperty' )
    } );
    const densityAccordionBox = new AccordionBox( new DensityNumberLineNode( {
        displayDensities: [
          {
            densityProperty: model.blockA.materialProperty.densityProperty,
            nameProperty: model.blockA.tag.nameProperty,
            visibleProperty: new BooleanProperty( true ),
            isHiddenProperty: new BooleanProperty( false ),
            color: DensityBuoyancyCommonColors.tagAProperty
          },
          {
            densityProperty: model.blockB.materialProperty.densityProperty,
            nameProperty: model.blockB.tag.nameProperty,
            visibleProperty: model.blockB.visibleProperty,
            isHiddenProperty: new BooleanProperty( false ),
            color: DensityBuoyancyCommonColors.tagBProperty
          }
        ],
        tandem: accordionTandem.createTandem( 'densityReadout' ),
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    ), combineOptions<AccordionBoxOptions>( {
      titleNode: new RichText( accordionBoxTitleStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200
      } ),
      buttonAlign: 'left' as const,
      tandem: accordionTandem,
      accessibleName: accordionBoxTitleStringProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );
    this.addAlignBox( densityAccordionBox, 'center', 'top' );

    this.addAlignBox( this.rightBox, 'right', 'top' );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {

      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    } );

    const blocksModeRadioButtonGroup = new BlocksModeRadioButtonGroup( model.modeProperty, {
      tandem: this.tandem.createTandem( 'blocksModeRadioButtonGroup' )
    } );
    blocksModeRadioButtonGroup.bottom = this.resetAllButton.bottom;
    blocksModeRadioButtonGroup.right = this.resetAllButton.left - 20;
    this.addChild( blocksModeRadioButtonGroup );

    this.addChild( this.popupLayer );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    // TODO: Is it important to say pdomOrder:[] here? If so, document why. If not, remove it. https://github.com/phetsims/density-buoyancy-common/issues/329
    const cubeALayer = new Node( { pdomOrder: [] } );
    this.addChild( cubeALayer );
    const cubeBLayer = new Node( { pdomOrder: [] } );
    this.addChild( cubeBLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cubeALayer,
      this.rightBox.controlANode,

      cubeBLayer,
      this.rightBox.controlBNode
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView.mass === model.blockA ) {
        cubeALayer.pdomOrder = [ ...cubeALayer.pdomOrder!, massView.focusablePath ];
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
      else if ( massView.mass === model.blockB ) {
        cubeBLayer.pdomOrder = [ ...cubeBLayer.pdomOrder!, massView.focusablePath ];
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
    };
    this.massViews.addItemAddedListener( massViewAdded );
    this.massViews.forEach( massViewAdded );

    this.resetEmitter.addListener( () => {
      densityAccordionBox.reset();
    } );

    this.pdomControlAreaNode.pdomOrder = [
      blocksModeRadioButtonGroup,
      densityAccordionBox,
      this.resetAllButton
    ];
  }
}

densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );