// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const BooleanRectangularToggleButton = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityComparingModel = require( 'DENSITY_BUOYANCY_COMMON/density/model/DensityComparingModel' );
  const DensityTableNode = require( 'DENSITY_BUOYANCY_COMMON/density/view/DensityTableNode' );
  const Panel = require( 'SUN/Panel' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector3 = require( 'DOT/Vector3' );
  const VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  const hideTableString = require( 'string!DENSITY_BUOYANCY_COMMON/hideTable' );
  const modeMysteryString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.mystery' );
  const modeSameDensityString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameDensity' );
  const modeSameMassString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameMass' );
  const modeSameVolumeString = require( 'string!DENSITY_BUOYANCY_COMMON/mode.sameVolume' );
  const showTableString = require( 'string!DENSITY_BUOYANCY_COMMON/showTable' );

  // constants
  const modeStringMap = {
    [ DensityComparingModel.Mode.SAME_MASS.name ]: modeSameMassString,
    [ DensityComparingModel.Mode.SAME_VOLUME.name ]: modeSameVolumeString,
    [ DensityComparingModel.Mode.SAME_DENSITY.name ]: modeSameDensityString,
    [ DensityComparingModel.Mode.MYSTERY.name ]: modeMysteryString
  };
  const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

  class DensityCompareScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {DensityComparingModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem, {
        cameraLookAt: new Vector3( 0, 0, 0 )
      } );

      if ( !this.enabled ) {
        return this;
      }

      const modeControl = new VerticalAquaRadioButtonGroup( model.modeProperty, DensityComparingModel.Mode.VALUES.map( mode => {
        return {
          node: new Text( modeStringMap[ mode.name ], { font: new PhetFont( 12 ) } ),
          value: mode
        };
      } ), {
        spacing: 8
      } );
      const modePanel = new Panel( modeControl, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

      const tableControl = new BooleanRectangularToggleButton(
        new Text( hideTableString, { font: new PhetFont( 12 ) } ),
        new Text( showTableString, { font: new PhetFont( 12 ) } ),
        model.tableVisibleProperty, {

      } );

      model.tableVisibleProperty.link( tableVisible => {
        tableControl.setBaseColor( tableVisible ? PhetColorScheme.RESET_ALL_BUTTON_BASE_COLOR : PhetColorScheme.BUTTON_YELLOW );
      } );

      model.modeProperty.link( mode => {
        tableControl.visible = mode === DensityComparingModel.Mode.MYSTERY;
      } );

      const rightContent = new VBox( {
        spacing: MARGIN,
        children: [
          modePanel,
          tableControl
        ]
      } );

      this.addChild( new AlignBox( rightContent, {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'top',
        margin: MARGIN
      } ) );

      const densityTablePanel = new Panel( new DensityTableNode(), {
        xMargin: 15,
        yMargin: 10
      } );
      this.addChild( new AlignBox( densityTablePanel, {
        alignBounds: this.layoutBounds,
        xAlign: 'center',
        yAlign: 'top',
        margin: MARGIN
      } ) );
      Property.multilink( [ model.tableVisibleProperty, model.modeProperty ], ( visible, mode ) => {
        densityTablePanel.visible = visible && mode === DensityComparingModel.Mode.MYSTERY;
      } );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'DensityCompareScreenView', DensityCompareScreenView );
} );
