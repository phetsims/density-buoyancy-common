// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
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

class DensityExploreScreenView extends SecondaryMassScreenView {
  /**
   * @param {DensityExploreModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    const tandem = options.tandem;

    super( model, merge( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    // @protected {Node} - Used in the super
    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      tandem
    );

    const accordionTandem = tandem.createTandem( 'densityReadoutBox' );
    const densityReadoutBox = new AccordionBox( new DensityReadoutNode(
      // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
      new DerivedProperty( [ model.primaryMass.materialProperty ], material => material.density ),
      new DerivedProperty( [ model.secondaryMass.materialProperty ], material => material.density ),
      model.secondaryMass.visibleProperty,
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

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      return new Vector2( boxBounds.left, visibleBounds.centerY );
    } );

    this.addSecondMassControl( model.secondaryMass.visibleProperty );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityExploreScreenView', DensityExploreScreenView );
export default DensityExploreScreenView;