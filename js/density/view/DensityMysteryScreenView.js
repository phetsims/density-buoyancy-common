// Copyright 2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityTableNode = require( 'DENSITY_BUOYANCY_COMMON/density/view/DensityTableNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector3 = require( 'DOT/Vector3' );

  // strings
  const densitiesOfVariousMaterialsString = require( 'string!DENSITY_BUOYANCY_COMMON/densitiesOfVariousMaterials' );

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

  return densityBuoyancyCommon.register( 'DensityMysteryScreenView', DensityMysteryScreenView );
} );
