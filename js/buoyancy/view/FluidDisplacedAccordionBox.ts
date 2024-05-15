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
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Gravity from '../../common/model/Gravity.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Material from '../../common/model/Material.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import BuoyancyLabScreenView from './BuoyancyLabScreenView.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';

type SelfOptions = EmptySelfOptions;

type FluidDisplacedPanelOptions = SelfOptions & AccordionBoxOptions;

const STARTING_VOLUME = DensityBuoyancyCommonConstants.DESIRED_STARTING_POOL_VOLUME * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER;
const CONTENT_WIDTH = 105;

// Beaker expects a range between 0 (empty) and 1 (full)
const BEAKER_RANGE = new Range( 0, 1 );

export default class FluidDisplacedAccordionBox extends AccordionBox {

  public constructor( poolVolumeProperty: TReadOnlyProperty<number>,
                      maxBeakerVolume: number,
                      liquidMaterialProperty: TReadOnlyProperty<Material>,
                      gravityProperty: TReadOnlyProperty<Gravity>,
                      providedOptions?: FluidDisplacedPanelOptions ) {
    assert && assert( Utils.toFixedNumber( poolVolumeProperty.value, 7 ) === STARTING_VOLUME,
      `This class greatly expects the starting volume of the pool to be ${STARTING_VOLUME}L.` );

    const options = optionize<FluidDisplacedPanelOptions, SelfOptions, AccordionBoxOptions>()( {
      titleNode: new RichText( DensityBuoyancyCommonStrings.fluidDisplacedStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 100,
        lineWrap: 90,
        maxHeight: 40
      } ),
      expandedDefaultValue: false,
      fill: DensityBuoyancyCommonColors.panelBackgroundProperty,

      titleAlignX: 'left',
      titleAlignY: 'center',
      titleXMargin: 5,
      titleXSpacing: 10,

      contentXMargin: 2,
      contentYMargin: 2,
      contentXSpacing: 2,
      contentYSpacing: 2
    }, providedOptions );

    const displayRange = new Range( 0, maxBeakerVolume );
    const displayedDisplacedVolumeProperty = new NumberProperty( 0, { range: displayRange } );
    poolVolumeProperty.link( totalLiters => {
      const displacedVolume = totalLiters - STARTING_VOLUME;
      assert && assert( Utils.toFixedNumber( displacedVolume, 7 ) <= maxBeakerVolume,
        `pool volume exceeded expected max of ${STARTING_VOLUME + maxBeakerVolume}: ${totalLiters}` );
      displayedDisplacedVolumeProperty.value = displayRange.constrainValue( displacedVolume );
    } );

    const beakerVolumeProperty = new NumberProperty( 0, { range: BEAKER_RANGE.copy() } );

    const solutionFillProperty = new DynamicProperty<Color, Color, Material>( liquidMaterialProperty, {
      derive: material => material.liquidColor!
    } );

    const beakerNode = new BeakerNode( beakerVolumeProperty, combineOptions<BeakerNodeOptions>( {
      solutionFill: solutionFillProperty
    }, FluidDisplacedAccordionBox.getBeakerOptions() ) );

    displayedDisplacedVolumeProperty.link( displayedLiters => {
      beakerVolumeProperty.value = displayedLiters / maxBeakerVolume;
    } );

    const numberDisplay = new NumberDisplay( displayedDisplacedVolumeProperty, displayedDisplacedVolumeProperty.range, {
      numberFormatter: value => StringUtils.fillIn( DensityBuoyancyCommonStrings.litersPatternStringProperty, {
        liters: Utils.toFixed( value, 2 )
      } ),
      numberFormatterDependencies: [ DensityBuoyancyCommonStrings.litersPatternStringProperty ],
      textOptions: {
        font: new PhetFont( 14 ),
        maxWidth: beakerNode.width * 0.66 // recognizing that this isn't the maxWidth of the whole NumberDisplay.
      },
      opacity: 0.8
    } );

    const displacedFluidForceProperty = new DerivedProperty( [
      gravityProperty,
      displayedDisplacedVolumeProperty,
      liquidMaterialProperty
    ], ( gravity, displacedVolume, liquidMaterial ) => {

      // Convert density units from kg/m^3=>kg/L
      return ( liquidMaterial.density / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER ) *
             gravity.value * displacedVolume; // TODO: wait. Can I just use a buoyant force metric? https://github.com/phetsims/density-buoyancy-common/issues/95
    } );

    const readoutStringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.newtonsPatternStringProperty, {
      newtons: displacedFluidForceProperty
    }, {
      decimalPlaces: {
        newtons: 2
      }
    } );
    const scaleIcon = BuoyancyLabScreenView.getFluidDisplacedPanelScaleIcon();
    const forceReadout = new RichText( readoutStringProperty, {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } ),
      maxWidth: scaleIcon.width * 0.8 // margins on the scale, and the icon goes beyond the actual scale, see https://github.com/phetsims/density-buoyancy-common/issues/108
    } );

    readoutStringProperty.link( () => {
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
        yMargin: DensityBuoyancyCommonConstants.MARGIN / 2,
        stroke: null
      } )
    );
    super( panel, options );
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

    const scaleIcon = BuoyancyLabScreenView.getFluidDisplacedPanelScaleIcon();
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