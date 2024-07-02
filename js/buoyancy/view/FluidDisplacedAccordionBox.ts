// Copyright 2024, University of Colorado Boulder

/**
 * A display to show the excess pool liquid that has been displaced.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BeakerNode, { BeakerNodeOptions } from '../../../../scenery-phet/js/BeakerNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Color, Node, RichText, Text } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Gravity from '../../common/model/Gravity.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Material from '../../common/model/Material.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import BuoyancyLabScreenView from './BuoyancyLabScreenView.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import { GeneralScaleReadoutNode } from '../../common/view/ScaleReadoutNode.js';
import { DisplayType } from '../../common/model/Scale.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';

type SelfOptions = EmptySelfOptions;

type FluidDisplacedAccordionBoxOptions = SelfOptions & PickRequired<AccordionBoxOptions, 'tandem'>;

const CONTENT_WIDTH = 105;

// For custom fluid densities, hollywood the color to ensure good contrast with the beaker fluid and the panel background, see https://github.com/phetsims/buoyancy/issues/154
const SAME_COLOR_MIN_DENSITY_THRESHOLD = 1000; // 1 kg/L

// Beaker expects a range between 0 (empty) and 1 (full)
const BEAKER_RANGE = new Range( 0, 1 );

export default class FluidDisplacedAccordionBox extends AccordionBox {

  public constructor( displayedDisplacedVolumeProperty: ReadOnlyProperty<number>, // Imported as property to link to it in phet-io
                      maxBeakerVolume: number,
                      fluidMaterialProperty: TReadOnlyProperty<Material>,
                      gravityProperty: TReadOnlyProperty<Gravity>,
                      providedOptions?: FluidDisplacedAccordionBoxOptions ) {
    const options = optionize<FluidDisplacedAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {
      titleNode: new RichText( DensityBuoyancyCommonStrings.fluidDisplacedStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 100,
        lineWrap: 90,
        maxHeight: 40
      } ),
      expandedDefaultValue: true,
      fill: DensityBuoyancyCommonColors.panelBackgroundProperty,

      titleAlignX: 'left',
      titleAlignY: 'center',
      titleXMargin: 5,
      titleXSpacing: 10,

      contentXMargin: 2,
      contentYMargin: 2,
      contentXSpacing: 2,
      contentYSpacing: 2,

      accessibleName: DensityBuoyancyCommonStrings.fluidDisplacedStringProperty
    }, providedOptions );

    const beakerVolumeProperty = new NumberProperty( 0, { range: BEAKER_RANGE.copy() } );

    const solutionFillProperty = new DynamicProperty<Color, Color, Material>( fluidMaterialProperty, {
      derive: material => material.liquidColor!,
      map: color => {

        // Below this threshold, use the same color for better contrast, see https://github.com/phetsims/buoyancy/issues/154
        if ( fluidMaterialProperty.value.custom ) {

          if ( fluidMaterialProperty.value.density < SAME_COLOR_MIN_DENSITY_THRESHOLD ) {
            color = Material.getCustomLiquidColor( SAME_COLOR_MIN_DENSITY_THRESHOLD, DensityBuoyancyCommonConstants.FLUID_DENSITY_RANGE_PER_M3 ).value;
          }

          return color.withAlpha( 0.8 );
        }
        else {
          return color;
        }
      }
    } );

    const beakerNode = new BeakerNode( beakerVolumeProperty, combineOptions<BeakerNodeOptions>( {
      solutionFill: solutionFillProperty
    }, FluidDisplacedAccordionBox.getBeakerOptions() ) );

    displayedDisplacedVolumeProperty.link( displayedLiters => {
      beakerVolumeProperty.value = displayedLiters / maxBeakerVolume;
    } );

    const numberDisplay = new NumberDisplay( displayedDisplacedVolumeProperty, new Range( 0, maxBeakerVolume ), {
      valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
      useRichText: true,
      decimalPlaces: 2,
      textOptions: {
        font: new PhetFont( 14 ),
        maxWidth: beakerNode.width * 0.66 // recognizing that this isn't the maxWidth of the whole NumberDisplay.
      },
      opacity: 0.8
    } );

    const displacedWeightProperty = new DerivedProperty( [
      gravityProperty,
      displayedDisplacedVolumeProperty,
      fluidMaterialProperty
    ], ( gravity, displacedVolume, fluidMaterial ) => {

      // Convert density units from kg/m^3=>kg/L
      return ( fluidMaterial.density / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER ) *
             gravity.value * displacedVolume;
    }, {
      tandem: options.tandem.createTandem( 'displacedWeightProperty' ),
      phetioValueType: NumberIO,
      phetioFeatured: true
    } );

    const scaleIcon = BuoyancyLabScreenView.getFluidDisplacedAccordionBoxScaleIcon();

    const forceReadout = new GeneralScaleReadoutNode( displacedWeightProperty, gravityProperty, DisplayType.NEWTONS, {
      textMaxWidth: scaleIcon.width * 0.8 // margins on the scale, and the icon goes beyond the actual scale, see https://github.com/phetsims/density-buoyancy-common/issues/108
    } );

    forceReadout.childBoundsProperty.link( () => {
      forceReadout.centerX = beakerNode.centerX;
    } );

    numberDisplay.bottom = beakerNode.bottom - beakerNode.height * 0.05;
    numberDisplay.right = beakerNode.right;
    scaleIcon.top = beakerNode.bottom - 13;
    forceReadout.centerY = scaleIcon.bottom - 13;
    scaleIcon.centerX = forceReadout.centerX = beakerNode.centerX;

    numberDisplay.boundsProperty.link( () => {
      numberDisplay.right = beakerNode.right;
    } );

    const panel = new Panel(
      new Node( {
        children: [ scaleIcon, beakerNode, numberDisplay, forceReadout ]
      } ),
      combineOptions<PanelOptions>( {}, DensityBuoyancyCommonConstants.PANEL_OPTIONS, {
        yMargin: DensityBuoyancyCommonConstants.MARGIN_SMALL,
        stroke: null
      } )
    );
    super( panel, options );

    this.addLinkedElement( displayedDisplacedVolumeProperty, {
      tandemName: 'displacedVolumeProperty'
    } );
  }

  private static getBeakerOptions(): BeakerNodeOptions {
    return {
      lineWidth: 1,
      beakerHeight: CONTENT_WIDTH * 0.55,
      beakerWidth: CONTENT_WIDTH,
      yRadiusOfEnds: CONTENT_WIDTH * 0.12,
      ticksVisible: true,
      numberOfTicks: 9, // The top is the 10th tick mark
      majorTickMarkModulus: 5
    };
  }

  /**
   * Create an icon which can be used for the Lab screen home screen and navigation bar icons.
   * NOTE: observe the duplication with the code above, this will allow us to adjust the icon independently of
   * the in-simulation representation.
   */
  public static createIcon(): Node {

    const scaleIcon = BuoyancyLabScreenView.getFluidDisplacedAccordionBoxScaleIcon();
    scaleIcon.scale( 1.8 );

    const newtonUnitText = new Text( DensityBuoyancyCommonStrings.newtonsUnitStringProperty, {
      font: new PhetFont( {
        size: 34,
        weight: 'bold'
      } ),
      maxWidth: scaleIcon.width * 0.8 // margins on the scale, and the icon goes beyond the actual scale, see https://github.com/phetsims/density-buoyancy-common/issues/108
    } );

    const beakerNode = new BeakerNode( new NumberProperty( 0.2, {
      range: BEAKER_RANGE.copy()
    } ), combineOptions<BeakerNodeOptions>( {
      solutionFill: Material.WATER.liquidColor
    }, FluidDisplacedAccordionBox.getBeakerOptions() ) );

    scaleIcon.top = beakerNode.bottom - 30;
    scaleIcon.centerX = beakerNode.centerX;
    newtonUnitText.centerY = scaleIcon.bottom - 21;
    newtonUnitText.centerX = beakerNode.centerX;

    return new Node( {
      children: [ scaleIcon, beakerNode, newtonUnitText ]
    } );
  }
}

densityBuoyancyCommon.register( 'FluidDisplacedAccordionBox', FluidDisplacedAccordionBox );