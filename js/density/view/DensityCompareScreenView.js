// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityCompareModel = require( 'DENSITY_BUOYANCY_COMMON/density/model/DensityCompareModel' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector3 = require( 'DOT/Vector3' );
  const VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  const modeSameDensityString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameDensity' );
  const modeSameMassString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameMass' );
  const modeSameVolumeString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameVolume' );

  // constants
  const modeStringMap = {
    [ DensityCompareModel.Mode.SAME_MASS.name ]: modeSameMassString,
    [ DensityCompareModel.Mode.SAME_VOLUME.name ]: modeSameVolumeString,
    [ DensityCompareModel.Mode.SAME_DENSITY.name ]: modeSameDensityString
  };
  const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

  class DensityCompareScreenView extends DensityBuoyancyScreenView {
    /**
     * @param {DensityCompareModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem, {
        cameraLookAt: new Vector3( 0, 0, 0 )
      } );

      if ( !this.enabled ) {
        return this;
      }

      const modeControl = new VerticalAquaRadioButtonGroup( model.modeProperty, DensityCompareModel.Mode.VALUES.map( mode => {
        return {
          node: new Text( modeStringMap[ mode.name ], { font: new PhetFont( 12 ) } ),
          value: mode
        };
      } ), {
        spacing: 8
      } );
      const modePanel = new Panel( modeControl, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

      this.addChild( new AlignBox( modePanel, {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'top',
        margin: MARGIN
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'DensityCompareScreenView', DensityCompareScreenView );
} );
