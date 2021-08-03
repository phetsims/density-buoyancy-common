// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import AlignPropertyBox from '../../../../scenery/js/layout/AlignPropertyBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
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
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem, {
      cameraLookAt: new Vector3( 0, 0, 0 )
    } );

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    // @protected {Node} - Used in the super
    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      model.secondaryMassVisibleProperty,
      this.popupLayer,
      tandem
    );

    const accordionTandem = tandem.createTandem( 'densityReadoutBox' );
    const densityReadoutBox = new AccordionBox( new DensityReadoutNode(
      new DerivedProperty( [ model.primaryMass.materialProperty ], material => material.density ),
      new DerivedProperty( [ model.secondaryMass.materialProperty ], material => material.density ),
      model.secondaryMassVisibleProperty,
      accordionTandem.createTandem( 'densityReadout' )
    ), merge( {
      titleNode: new Text( densityBuoyancyCommonStrings.densityReadout, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200
      } ),
      expandedProperty: model.densityReadoutExpandedProperty,
      buttonAlign: 'left',
      tandem: accordionTandem
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignPropertyBox( densityReadoutBox, this.visibleBoundsProperty, {
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( new AlignPropertyBox( this.rightBox, this.visibleBoundsProperty, {
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addSecondMassControl();

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );
export default DensityIntroScreenView;