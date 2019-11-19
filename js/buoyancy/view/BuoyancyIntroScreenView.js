// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const BuoyancyIntroModel = require( 'DENSITY_BUOYANCY_COMMON/buoyancy/model/BuoyancyIntroModel' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DisplayOptionsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DisplayOptionsNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  const fluidString = require( 'string!DENSITY_BUOYANCY_COMMON/fluid' );
  const modeSameDensityString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameDensity' );
  const modeSameMassString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameMass' );
  const modeSameVolumeString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameVolume' );

  // constants
  const modeStringMap = {
    [ BuoyancyIntroModel.Mode.SAME_MASS.name ]: modeSameMassString,
    [ BuoyancyIntroModel.Mode.SAME_VOLUME.name ]: modeSameVolumeString,
    [ BuoyancyIntroModel.Mode.SAME_DENSITY.name ]: modeSameDensityString
  };
  const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

  class BuoyancyIntroScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {BuoyancyIntroModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem );

      if ( !this.enabled ) {
        return this;
      }

      const modeControl = new VerticalAquaRadioButtonGroup( model.modeProperty, BuoyancyIntroModel.Mode.VALUES.map( mode => {
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

      this.addChild( new Panel( new DisplayOptionsNode( model ), {
        xMargin: 10,
        yMargin: 10,
        left: this.layoutBounds.left + MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      const radioButtonLabelOptions = {
        font: new PhetFont( 14 )
      };
      const fluidBox = new HBox( {
        spacing: 20,
        children: [
          new AquaRadioButton( model.liquidMaterialProperty, Material.OIL, new Text( Material.OIL.name, radioButtonLabelOptions ) ),
          new AquaRadioButton( model.liquidMaterialProperty, Material.WATER, new Text( Material.WATER.name, radioButtonLabelOptions ) ),
          new AquaRadioButton( model.liquidMaterialProperty, Material.SEAWATER, new Text( Material.SEAWATER.name, radioButtonLabelOptions ) )
        ]
      } );
      const fluidTitle = new Text( fluidString, {
        font: new PhetFont( { size: 14, weight: 'bold' } ),
        right: fluidBox.left,
        bottom: fluidBox.top - 3
      } );
      this.addChild( new Panel( new Node( {
        children: [ fluidTitle, fluidBox ]
      } ), {
        xMargin: 10,
        yMargin: 10,
        centerX: this.layoutBounds.centerX,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'BuoyancyIntroScreenView', BuoyancyIntroScreenView );
} );
