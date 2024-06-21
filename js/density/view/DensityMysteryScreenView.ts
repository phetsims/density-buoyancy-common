// Copyright 2020-2024, University of Colorado Boulder

/**
 * The main view for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import { AlignBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityMysteryModel, { MysteryBlockSet } from '../model/DensityMysteryModel.js';
import DensityTableNode from './DensityTableNode.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import TextureQuad from '../../../../mobius/js/TextureQuad.js';
import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScaleView from '../../common/view/ScaleView.js';
import MassView from '../../common/view/MassView.js';
import CuboidView from '../../common/view/CuboidView.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

type DensityMysteryScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' | 'initialForceScale'>;

export default class DensityMysteryScreenView extends DensityBuoyancyScreenView<DensityMysteryModel> {
  public constructor( model: DensityMysteryModel, options: DensityMysteryScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      canShowForces: false,
      supportsDepthLines: false,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: false,
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    const densityTableAccordionBoxTandem = tandem.createTandem( 'densityTableAccordionBox' );
    const densityTableAccordionBox = new AccordionBox( new DensityTableNode(), combineOptions<AccordionBoxOptions>( {
      titleNode: new Text( DensityBuoyancyCommonStrings.densityTableStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200,
        tandem: densityTableAccordionBoxTandem.createTandem( 'titleText' )
      } ),
      expandedDefaultValue: false,
      tandem: densityTableAccordionBoxTandem,
      accessibleName: DensityBuoyancyCommonStrings.densityTableStringProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( densityTableAccordionBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const blocksPanelTandem = tandem.createTandem( 'blocksPanel' );
    const blocksModeRadioButtonGroupTandem = blocksPanelTandem.createTandem( 'blocksModeRadioButtonGroup' );

    const blocksModeRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.blockSetProperty, MysteryBlockSet.enumeration.values.map( blockSet => {
      return {
        createNode: tandem => new Text( blockSet.stringProperty, {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 65,
          tandem: tandem.createTandem( 'labelText' )
        } ),
        value: blockSet,
        tandemName: `${blockSet.tandemName}RadioButton`,
        options: {
          accessibleName: blockSet.stringProperty
        }
      };
    } ), {
      align: 'left',
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      tandem: blocksModeRadioButtonGroupTandem
    } );
    const randomBlocksRefreshButton = new RefreshButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.regenerate( MysteryBlockSet.RANDOM );
      },
      iconHeight: 20,
      tandem: blocksPanelTandem.createTandem( 'randomBlocksRefreshButton' )
    } );
    const blockSetContent = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL
    } );

    // Include the refresh button when in random blockSet.
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.blockSetProperty.link( blockSet => {
      blockSetContent.children = blockSet === MysteryBlockSet.RANDOM ? [
        blocksModeRadioButtonGroup,
        randomBlocksRefreshButton
      ] : [
        blocksModeRadioButtonGroup
      ];
    } );

    const blockSetPanel = new Panel( new VBox( {
      children: [
        new Text( DensityBuoyancyCommonStrings.blocksStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 85,
          tandem: blocksPanelTandem.createTandem( 'titleText' )
        } ),
        blockSetContent
      ],
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'left'
    } ), combineOptions<PanelOptions>( {
      tandem: blocksPanelTandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );

    this.addChild( new AlignBox( blockSetPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );

    this.resetEmitter.addListener( () => {
      densityTableAccordionBox.reset();
    } );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const cuboidPDOMLayer = new Node( { pdomOrder: [] } );
    this.addChild( cuboidPDOMLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      cuboidPDOMLayer,

      blockSetPanel,

      densityTableAccordionBox
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

  public static getDensityMysteryIcon(): Node {

    return DensityBuoyancyScreenView.getAngledIcon( 4, new Vector3( 0, -0.01, 0 ), scene => {

      const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

      const box = new THREE.Mesh( boxGeometry, new THREE.MeshLambertMaterial( {
        color: 0x00ff00
      } ) );
      box.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0.03, 0 ) ) );

      scene.add( box );

      const labelSize = 0.1;
      const label = new TextureQuad( new NodeTexture( new Text( '?', {
        font: new PhetFont( {
          size: 120
        } ),
        center: new Vector2( 128, 128 )
      } ), {
        width: 256,
        height: 256
      } ), labelSize, labelSize );

      label.position.copy( ThreeUtils.vectorToThree( new Vector3( 0 - labelSize * 0.5, 0.03, 0.15 ) ) );

      scene.add( label );

      const scaleGeometry = ScaleView.getScaleGeometry();

      const scale = new THREE.Mesh( scaleGeometry, new THREE.MeshStandardMaterial( {
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0x666666
      } ) );

      scale.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, -0.03, 0 ) ) );
      scene.add( scale );
    } );
  }
}

densityBuoyancyCommon.register( 'DensityMysteryScreenView', DensityMysteryScreenView );