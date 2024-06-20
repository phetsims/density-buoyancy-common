// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { AlignBox, Node, RichText } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityNumberLineNode from './DensityNumberLineNode.js';
import DensityIntroModel from '../model/DensityIntroModel.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import { DensityMaterials } from '../../common/view/MaterialView.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import BlocksRadioButtonGroup from '../../common/view/BlocksRadioButtonGroup.js';
import MassView from '../../common/view/MassView.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN_SMALL;

type DensityIntroScreenViewOptions = StrictOmit<DensityBuoyancyScreenViewOptions, 'canShowForces' | 'supportsDepthLines' | 'forcesInitiallyDisplayed' | 'massValuesInitiallyDisplayed' >;

export default class DensityIntroScreenView extends DensityBuoyancyScreenView<DensityIntroModel> {

  private rightBox: PrimarySecondaryControlsNode;

  public constructor( model: DensityIntroModel, options: DensityIntroScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, 1 / 16, combineOptions<DensityBuoyancyScreenViewOptions>( {
      canShowForces: false,
      supportsDepthLines: false,
      forcesInitiallyDisplayed: false,
      massValuesInitiallyDisplayed: true,
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer, {
        tandem: tandem,
        maxCustomMass: 10
      } );

    const accordionTandem = tandem.createTandem( 'densityAccordionBox' );
    const accordionBoxTitleStringProperty = new DerivedProperty( [
      DensityBuoyancyCommonPreferences.volumeUnitsProperty,
      DensityBuoyancyCommonStrings.densityReadoutStringProperty,
      DensityBuoyancyCommonStrings.densityReadoutDecimetersCubedStringProperty
    ], ( units, litersReadout, decimetersCubedReadout ) => {
      return units === 'liters' ? litersReadout : decimetersCubedReadout;
    } );
    const densityAccordionBox = new AccordionBox( new DensityNumberLineNode( {
        displayDensities: [
          // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
          {
            densityProperty: new DerivedProperty( [ model.primaryMass.materialProperty ], material => material.density ),
            nameProperty: model.primaryMass.tag.nameProperty,
            visibleProperty: new BooleanProperty( true ),
            isHiddenProperty: new BooleanProperty( false ),
            color: DensityBuoyancyCommonColors.labelPrimaryProperty
          },
          {
            densityProperty: new DerivedProperty( [ model.secondaryMass.materialProperty ], material => material.density ),
            nameProperty: model.secondaryMass.tag.nameProperty,
            visibleProperty: model.secondaryMass.visibleProperty,
            isHiddenProperty: new BooleanProperty( false ),
            color: DensityBuoyancyCommonColors.labelSecondaryProperty
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
        maxWidth: 200,
        visiblePropertyOptions: {
          phetioReadOnly: true
        },
        tandem: accordionTandem.createTandem( 'titleText' )
      } ),
      buttonAlign: 'left' as const,
      tandem: accordionTandem,
      accessibleName: accordionBoxTitleStringProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( densityAccordionBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( new AlignBox( this.rightBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    } );

    const blocksRadioButtonGroup = new BlocksRadioButtonGroup( model.modeProperty, {
      tandem: this.tandem.createTandem( 'blocksRadioButtonGroup' )
    } );
    blocksRadioButtonGroup.bottom = this.resetAllButton.bottom;
    blocksRadioButtonGroup.right = this.resetAllButton.left - 20;
    this.addChild( blocksRadioButtonGroup );

    this.addChild( this.popupLayer );

    // Layer for the focusable masses. Must be in the scene graph, so they can populate the pdom order
    const primaryCubeLayer = new Node( { pdomOrder: [] } );
    this.addChild( primaryCubeLayer );
    const secondaryCubeLayer = new Node( { pdomOrder: [] } );
    this.addChild( secondaryCubeLayer );

    // The focus order is described in https://github.com/phetsims/density-buoyancy-common/issues/121
    this.pdomPlayAreaNode.pdomOrder = [

      primaryCubeLayer,
      this.rightBox.primaryControlNode,

      secondaryCubeLayer,
      this.rightBox.secondaryControlNode
    ];

    const massViewAdded = ( massView: MassView ) => {
      if ( massView.mass === model.primaryMass ) {
        primaryCubeLayer.pdomOrder = [ ...primaryCubeLayer.pdomOrder!, massView.focusablePath ];
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
      else if ( massView.mass === model.secondaryMass ) {
        secondaryCubeLayer.pdomOrder = [ ...secondaryCubeLayer.pdomOrder!, massView.focusablePath ];
        // nothing to do for removal since disposal of the node will remove it from the pdom order
      }
    };
    this.massViews.addItemAddedListener( massViewAdded );
    this.massViews.forEach( massViewAdded );

    this.resetEmitter.addListener( () => {
      densityAccordionBox.reset();
    } );

    this.pdomControlAreaNode.pdomOrder = [
      blocksRadioButtonGroup,
      densityAccordionBox,
      this.resetAllButton
    ];
  }

  public static getDensityIntroIcon(): Node {

    return DensityBuoyancyScreenView.getAngledIcon( 5.5, new Vector3( 0, 0, 0 ), scene => {

      const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

      const box = new THREE.Mesh( boxGeometry, new THREE.MeshStandardMaterial( {
        map: DensityMaterials.woodColorTexture,
        normalMap: DensityMaterials.woodNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: DensityMaterials.woodRoughnessTexture,
        metalness: 0
        // NOTE: Removed the environment map for now
      } ) );
      box.position.copy( ThreeUtils.vectorToThree( new Vector3( 0, 0, 0 ) ) );

      scene.add( box );

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

densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );