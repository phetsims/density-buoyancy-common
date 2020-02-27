// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommonStrings from '../../density-buoyancy-common-strings.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityTableNode from './DensityTableNode.js';

const densitiesOfVariousMaterialsString = densityBuoyancyCommonStrings.densitiesOfVariousMaterials;

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class DensityMysteryScreenView extends DensityBuoyancyScreenView {
  /**
   * @param {DensityMysteryModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem, {
      cameraLookAt: new Vector3( 0, 0, 0 )
    } );

    if ( !this.enabled ) {
      return this;
    }

    const densityBox = new AccordionBox( new DensityTableNode(), {
      titleNode: new Text( densitiesOfVariousMaterialsString, { font: DensityBuoyancyCommonConstants.TITLE_FONT } ),
      expandedProperty: model.densityTableExpandedProperty,
      fill: 'white',
      titleYMargin: 5,
      buttonXMargin: 5,
      titleAlignX: 'left',
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS
      // TODO: take common AccordionBox styles out into a file
    } );

    this.addChild( new AlignBox( densityBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityMysteryScreenView', DensityMysteryScreenView );
export default DensityMysteryScreenView;