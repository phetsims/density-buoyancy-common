// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommonStrings from '../../density-buoyancy-common-strings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityReadoutNode from './DensityReadoutNode.js';

const densityReadoutString = densityBuoyancyCommonStrings.densityReadout;

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

    if ( !this.enabled ) {
      return this;
    }

    // @private {Node}
    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      model.secondaryMassVisibleProperty,
      this.popupLayer
    );

    const densityReadoutBox = new AccordionBox( new DensityReadoutNode(
      new DerivedProperty( [ model.primaryMass.materialProperty ], material => material.density ),
      new DerivedProperty( [ model.secondaryMass.materialProperty ], material => material.density ),
      model.secondaryMassVisibleProperty
    ), {
      titleNode: new Text( densityReadoutString, { font: DensityBuoyancyCommonConstants.TITLE_FONT } ),
      expandedProperty: model.densityReadoutExpandedProperty,
      buttonAlign: 'left',
      titleYMargin: 5,
      buttonXMargin: 5,
      titleAlignX: 'left',
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS
    } );

    this.addChild( new AlignBox( densityReadoutBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'center',
      yAlign: 'top',
      yMargin: MARGIN
    } ) );

    this.addChild( new AlignBox( this.rightBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      xMargin: MARGIN,
      yMargin: MARGIN
    } ) );

    this.addSecondMassControl();

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );
export default DensityIntroScreenView;