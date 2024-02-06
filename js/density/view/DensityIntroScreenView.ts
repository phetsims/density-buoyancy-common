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
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityReadoutNode from './DensityReadoutNode.js';
import DensityIntroModel from '../model/DensityIntroModel.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import DensityMaterials from '../../common/view/DensityMaterials.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class DensityIntroScreenView extends SecondaryMassScreenView<DensityIntroModel> {

  protected rightBox: Node;

  public constructor( model: DensityIntroModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      { tandem: tandem }
    );

    const accordionTandem = tandem.createTandem( 'densityAccordionBox' );
    const densityAccordionBox = new AccordionBox( new DensityReadoutNode(
      // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
      new DerivedProperty( [ model.primaryMass.materialProperty ], material => material.density ),
      new DerivedProperty( [ model.secondaryMass.materialProperty ], material => material.density ),
      model.secondaryMass.visibleProperty,
      {
        tandem: accordionTandem.createTandem( 'densityReadout' ),
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    ), combineOptions<AccordionBoxOptions>( {
      titleNode: new RichText( new DerivedProperty( [
        DensityBuoyancyCommonPreferences.volumeUnitsProperty,
        DensityBuoyancyCommonStrings.densityReadoutStringProperty,
        DensityBuoyancyCommonStrings.densityReadoutDecimetersCubedStringProperty
      ], ( units, litersReadout, decimetersCubedReadout ) => {
        return units === 'liters' ? litersReadout : decimetersCubedReadout;
      } ), {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200,
        visiblePropertyOptions: {
          phetioReadOnly: true
        },
        tandem: accordionTandem.createTandem( 'titleText' )
      } ),
      expandedProperty: model.densityExpandedProperty,
      buttonAlign: 'left' as const,
      tandem: accordionTandem
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
    this.rightBarrierViewPointProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    }, {
      strictAxonDependencies: false // This workaround is deemed acceptable for visibleBoundsProperty listening, https://github.com/phetsims/faradays-electromagnetic-lab/issues/65
    } );

    this.addSecondMassControl( model.modeProperty );

    this.addChild( this.popupLayer );
  }

  public static getDensityIntroIcon(): Node {
    if ( !ThreeUtils.isWebGLEnabled() ) {
      return DensityBuoyancyScreenView.getFallbackIcon();
    }

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
