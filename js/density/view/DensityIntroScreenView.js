// Copyright 2019-2020, University of Colorado Boulder

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
  const DensityReadoutNode = require( 'DENSITY_BUOYANCY_COMMON/density/view/DensityReadoutNode' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const PrimarySecondaryControlsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/PrimarySecondaryControlsNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector3 = require( 'DOT/Vector3' );

  // strings
  const densityReadoutString = require( 'string!DENSITY_BUOYANCY_COMMON/densityReadout' );

  // constants
  const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

  class DensityIntroScreenView extends DensityBuoyancyScreenView {

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

      const rightBox = new PrimarySecondaryControlsNode(
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
        titleAlignX: 'left'
      } );

      this.addChild( new AlignBox( densityReadoutBox, {
        alignBounds: this.layoutBounds,
        xAlign: 'center',
        yAlign: 'top',
        yMargin: MARGIN
      } ) );

      this.addChild( new AlignBox( rightBox, {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'top',
        xMargin: MARGIN,
        yMargin: MARGIN
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );
} );
