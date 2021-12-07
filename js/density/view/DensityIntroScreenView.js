// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignPropertyBox } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityReadoutNode from './DensityReadoutNode.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class DensityIntroScreenView extends SecondaryMassScreenView {
  /**
   * @param {DensityIntroModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    const tandem = options.tandem;

    super( model, merge( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    // @protected {Node} - Used in the super
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
    ), merge( {
      titleNode: new Text( densityBuoyancyCommonStrings.densityReadout, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200,
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      } ),
      expandedProperty: model.densityExpandedProperty,
      buttonAlign: 'left',
      tandem: accordionTandem
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignPropertyBox( densityAccordionBox, this.visibleBoundsProperty, {
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( new AlignPropertyBox( this.rightBox, this.visibleBoundsProperty, {
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    } );

    this.addSecondMassControl( model.modeProperty );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );
export default DensityIntroScreenView;