// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityComparingModel = require( 'DENSITY_BUOYANCY_COMMON/density/model/DensityComparingModel' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  const modeMysteryString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.mystery' );
  const modeSameDensityString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameDensity' );
  const modeSameMassString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameMass' );
  const modeSameVolumeString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameVolume' );

  // constants
  const modeStringMap = {
    [ DensityComparingModel.Mode.SAME_MASS.name ]: modeSameMassString,
    [ DensityComparingModel.Mode.SAME_VOLUME.name ]: modeSameVolumeString,
    [ DensityComparingModel.Mode.SAME_DENSITY.name ]: modeSameDensityString,
    [ DensityComparingModel.Mode.MYSTERY.name ]: modeMysteryString
  };

  class DensityComparingScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {DensityBuoyancyModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem );

      if ( !this.enabled ) {
        return this;
      }

      const modeControl = new VerticalAquaRadioButtonGroup( model.modeProperty, DensityComparingModel.Mode.VALUES.map( mode => {
        return {
          node: new Text( modeStringMap[ mode.name ], { font: new PhetFont( 12 ) } ),
          value: mode
        };
      } ) );
      this.addChild( new AlignBox( new Panel( modeControl ), {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'top',
        margin: 10
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'DensityComparingScreenView', DensityComparingScreenView );
} );
