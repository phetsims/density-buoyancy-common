// Copyright 2024, University of Colorado Boulder
/**
 * Panel that contains information and controls related to the Bottle in the Applications Screen
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants, { toLiters } from '../../../common/DensityBuoyancyCommonConstants.js';
import { GatedVisibleProperty, HBox, HSeparator, Node, Text, VBox } from '../../../../../scenery/js/imports.js';
import NumberControl, { NumberControlOptions } from '../../../../../scenery-phet/js/NumberControl.js';
import DensityBuoyancyCommonStrings from '../../../DensityBuoyancyCommonStrings.js';
import UnitConversionProperty from '../../../../../axon/js/UnitConversionProperty.js';
import { combineOptions } from '../../../../../phet-core/js/optionize.js';
import MaterialMassVolumeControlNode from '../../../common/view/MaterialMassVolumeControlNode.js';
import PrecisionSliderThumb from '../../../common/view/PrecisionSliderThumb.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import Panel from '../../../../../sun/js/Panel.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import NumberDisplay from '../../../../../scenery-phet/js/NumberDisplay.js';
import Range from '../../../../../dot/js/Range.js';
import Bottle from '../../model/applications/Bottle.js';

export default class BottlePanel extends Panel {

  public readonly contentWidth: number;

  public constructor( bottle: Bottle, popupLayer: Node, tandem: Tandem ) {
    const bottleControlsTandem = tandem.createTandem( 'bottleControls' );
    const materialInsideControlsTandem = bottleControlsTandem.createTandem( 'materialInsideControls' );
    const materialInsideControls = new MaterialMassVolumeControlNode( bottle.materialInsideProperty, bottle.materialInsideMassProperty, bottle.materialInsideVolumeProperty,
      bottle.materialInsideProperty.availableValues, volume => bottle.materialInsideVolumeProperty.set( volume ), popupLayer, {
        minMass: 0,
        minCustomMass: 0,
        maxCustomMass: 100,
        maxMass: 100,
        minVolumeLiters: bottle.materialInsideVolumeRange.min,
        maxVolumeLiters: bottle.materialInsideVolumeRange.max,
        minCustomVolumeLiters: 0.5,
        showMassAsReadout: true,
        customKeepsConstantDensity: true,
        ownsCustomDensityRange: false, // Bottle has a good range for itself.
        tandem: materialInsideControlsTandem,

        // When controlling the material inside, the custom density is an independent variable and should not automatically
        // sync with the previously selected material's density.
        syncCustomMaterialDensity: false
      } );

    // This DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const airLitersProperty = new DerivedProperty( [ bottle.materialInsideVolumeProperty ], volume => toLiters( 0.01 - volume ) );

    const customDensityControlVisibleProperty = new DerivedProperty( [ bottle.materialInsideProperty ],
      material => material.custom );

    const customBottleDensityControlTandem = materialInsideControlsTandem.createTandem( 'customBottleDensityNumberControl' );

    const correctUnitsCustomMaterialDensityProperty = new UnitConversionProperty( bottle.materialInsideProperty.customMaterial.densityProperty, {
      factor: 1 / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
    } );

    const bottleCustomInsideMaterialDensityControl = new NumberControl(
      DensityBuoyancyCommonStrings.densityStringProperty,
      correctUnitsCustomMaterialDensityProperty,
      correctUnitsCustomMaterialDensityProperty.range,
      combineOptions<NumberControlOptions>( {
        visibleProperty: new GatedVisibleProperty( customDensityControlVisibleProperty, customBottleDensityControlTandem ),
        sliderOptions: {
          accessibleName: DensityBuoyancyCommonStrings.densityStringProperty,
          phetioLinkedProperty: bottle.materialInsideProperty.customMaterial.densityProperty,
          thumbNode: new PrecisionSliderThumb( {
            tandem: customBottleDensityControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
          } )
        },
        numberDisplayOptions: {
          valuePattern: DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY
        },
        tandem: customBottleDensityControlTandem
      }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    const airVolumeMaxWidth = ( materialInsideControls.width - DensityBuoyancyCommonConstants.SPACING_SMALL ) / 2;
    const airVolumeDisplayTandem = bottleControlsTandem.createTandem( 'airVolumeDisplay' );

    const bottleBox = new VBox( {
      spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
      align: 'left',
      stretch: true,
      tandem: bottleControlsTandem,
      children: [
        new Text( DensityBuoyancyCommonStrings.materialInsideStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160,
          visibleProperty: materialInsideControls.visibleProperty
        } ),
        materialInsideControls,
        bottleCustomInsideMaterialDensityControl,
        new HSeparator(),
        new HBox( {
          tandem: airVolumeDisplayTandem,
          visibleProperty: new BooleanProperty( true, {
            tandem: airVolumeDisplayTandem.createTandem( 'visibleProperty' ),
            phetioFeatured: true
          } ),
          spacing: DensityBuoyancyCommonConstants.SPACING_SMALL,
          children: [
            new Text( DensityBuoyancyCommonStrings.airVolumeStringProperty, {
              font: DensityBuoyancyCommonConstants.READOUT_FONT,
              maxWidth: airVolumeMaxWidth * 0.95 // to account for numberDisplay padding
            } ),
            new NumberDisplay( airLitersProperty, new Range( 0, 10 ), {
              valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
              useRichText: true,
              decimalPlaces: 2,
              textOptions: {
                font: new PhetFont( 12 ),
                maxWidth: airVolumeMaxWidth * 0.9 // to account for the numberDisplay padding
              }
            } )
          ]
        } )
      ]
    } );


    super( bottleBox, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.contentWidth = bottleBox.width;
  }
}

densityBuoyancyCommon.register( 'BottlePanel', BottlePanel );