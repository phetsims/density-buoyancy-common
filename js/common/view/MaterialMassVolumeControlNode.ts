// Copyright 2019-2024, University of Colorado Boulder

/**
 * A control that allows modification of the mass and volume (which can be linked, or unlinked for custom materials).
 * This also has support for changing the material, see MaterialControlNode.
 *
 * Note that NumberControl does not support mutating the provided Range (just the enabled range subset), and so this
 * class can create two NumberControl instances for controlling the mass. See options.highDensityMaxMass for details.
 * This was much easier than updating NumberControl and NumberDisplay to support a dynamic range, see https://github.com/phetsims/buoyancy/issues/31.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import { Node, Text, TColor, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';
import MaterialControlNode, { MaterialControlNodeOptions } from './MaterialControlNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';

// constants
const LITERS_IN_CUBIC_METER = DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER;
const TRACK_HEIGHT = 3;

// A workaround for changing a DerivedProperty range Property to a NumberProperty, where the new range AND value will
// not overlap with the previous one.
class WorkaroundRange extends Range {
  public override contains( value: number ): boolean { return true; }
}

type SelfOptions = {
  minMass?: number; // The minimum mass available to select
  maxMass?: number; // The maximum mass available to select

  // Used in the Applications Screen View to increase the mass range for dense materials. null opts out of this feature.
  highDensityMaxMass?: number | null;
  // Used only with highDensityMaxMass, Density above which the range switches from normal to high density mass control.
  highDensityThreshold?: number;

  minVolumeLiters?: number;
  maxVolumeLiters?: number;
  color?: TColor;
};

export type MaterialMassVolumeControlNodeOptions = SelfOptions & MaterialControlNodeOptions;

export default class MaterialMassVolumeControlNode extends MaterialControlNode {

  public constructor( materialProperty: Property<Material>,
                      massProperty: ReadOnlyProperty<number>,
                      volumeProperty: Property<number>,
                      materials: Material[],
                      setVolume: ( volume: number ) => void,
                      listParent: Node,
                      providedOptions: MaterialMassVolumeControlNodeOptions ) {

    const options = optionize<MaterialMassVolumeControlNodeOptions, SelfOptions, MaterialControlNodeOptions>()( {
      minMass: 0.1,
      maxMass: 27,
      highDensityMaxMass: null,
      highDensityThreshold: 2700,
      minVolumeLiters: 1,
      maxVolumeLiters: 10,
      minCustomMass: 0.5,
      maxCustomMass: 27,
      minCustomVolumeLiters: 1,
      color: DensityBuoyancyCommonConstants.THUMB_FILL
    }, providedOptions );

    // If we will be creating a high density mass NumberControl in addition to the normal one.
    const supportTwoMassNumberControls = !!options.highDensityMaxMass;

    const massNumberControlContainerTandem = options.tandem.createTandem( 'massNumberControl' );
    const volumeNumberControlTandem = options.tandem.createTandem( 'volumeNumberControl' );

    super( materialProperty, volumeProperty, materials, listParent, options );

    // We need to use "locks" since our behavior is different based on whether the model or user is changing the value
    let modelMassChanging = false;
    let userMassChanging = false;
    let modelVolumeChanging = false;
    let userVolumeChanging = false;

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const enabledMassRangeProperty = new DerivedProperty( [ materialProperty ], material => {
      if ( material.custom ) {
        return new Range( options.minCustomMass, options.maxCustomMass );
      }
      else {
        const density = material.density;

        const maxMassRange = supportTwoMassNumberControls && density > options.highDensityThreshold ? options.highDensityMaxMass! : options.maxMass;

        const minMass = Utils.clamp( density * options.minVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, maxMassRange );
        const maxMass = Utils.clamp( density * options.maxVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, maxMassRange );

        return new WorkaroundRange( minMass, maxMass );
      }
    }, {
      reentrant: true,
      phetioState: false,
      phetioValueType: Range.RangeIO,
      tandem: massNumberControlContainerTandem.createTandem( 'enabledMassRangeProperty' ),
      valueComparisonStrategy: 'equalsFunction'
    } );

    const enabledVolumeRangeProperty = new DerivedProperty( [ materialProperty ], material => {
      return new WorkaroundRange(
        material.custom ? Math.max( options.minVolumeLiters, options.minCustomVolumeLiters ) : options.minVolumeLiters,
        options.maxVolumeLiters
      );
    }, {
      valueComparisonStrategy: 'equalsFunction'
    } );

    // passed to the NumberControl
    const numberControlMassProperty = new NumberProperty( massProperty.value, {
      tandem: massNumberControlContainerTandem.createTandem( 'numberControlMassProperty' ),
      phetioState: false,
      phetioReadOnly: true,
      units: 'kg'
    } );

    // passed to the NumberControl - liters from m^3
    const numberControlVolumeProperty = new NumberProperty( volumeProperty.value * LITERS_IN_CUBIC_METER, {
      range: new Range( options.minVolumeLiters, options.maxVolumeLiters ),
      tandem: volumeNumberControlTandem.createTandem( 'numberControlVolumeProperty' ),
      phetioState: false,
      phetioReadOnly: true,
      units: 'L'
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    numberControlVolumeProperty.lazyLink( liters => {
      if ( !modelVolumeChanging && !userMassChanging ) {
        const cubicMeters = liters / LITERS_IN_CUBIC_METER;

        userVolumeChanging = true;

        // If we're custom, adjust the density
        if ( materialProperty.value.custom ) {
          materialProperty.value = Material.createCustomSolidMaterial( {
            density: massProperty.value / cubicMeters
          } );
        }
        setVolume( cubicMeters );

        userVolumeChanging = false;
      }
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    volumeProperty.lazyLink( cubicMeters => {
      if ( !userVolumeChanging ) {
        modelVolumeChanging = true;

        // If the value is close to min/max, massage it to the exact value, see https://github.com/phetsims/density/issues/46
        let volumeLiters = cubicMeters * LITERS_IN_CUBIC_METER;
        if ( volumeLiters > options.minVolumeLiters && volumeLiters < options.minVolumeLiters + 1e-10 ) {
          volumeLiters = options.minVolumeLiters;
        }
        if ( volumeLiters < options.maxVolumeLiters && volumeLiters > options.maxVolumeLiters - 1e-10 ) {
          volumeLiters = options.maxVolumeLiters;
        }

        numberControlVolumeProperty.value = Utils.clamp( volumeLiters, options.minVolumeLiters, options.maxVolumeLiters );

        modelVolumeChanging = false;
      }
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    numberControlMassProperty.lazyLink( mass => {
      if ( !modelMassChanging && !userVolumeChanging ) {
        userMassChanging = true;

        // It is possible for the volumeProperty to be 0, so avoid the infinte density case, see https://github.com/phetsims/density-buoyancy-common/issues/78
        if ( materialProperty.value.custom && volumeProperty.value > 0 ) {
          materialProperty.value = Material.createCustomSolidMaterial( {
            density: mass / volumeProperty.value
          } );
        }
        else {
          setVolume( mass / materialProperty.value.density );
        }

        userMassChanging = false;
      }
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    massProperty.lazyLink( mass => {
      if ( !userMassChanging ) {
        modelMassChanging = true;

        enabledMassRangeProperty.recomputeDerivation();

        // If the value is close to min/max, massage it to the exact value, see https://github.com/phetsims/density/issues/46
        let adjustedMass = mass;
        const min = enabledMassRangeProperty.value.min;
        const max = enabledMassRangeProperty.value.max;
        if ( adjustedMass > min && adjustedMass < min + 1e-10 ) {
          adjustedMass = min;
        }
        if ( adjustedMass < max && adjustedMass > max - 1e-10 ) {
          adjustedMass = max;
        }

        numberControlMassProperty.value = Utils.clamp( adjustedMass, min, max );

        modelMassChanging = false;
      }
    } );

    const volumeNumberControl = new NumberControl( DensityBuoyancyCommonStrings.volumeStringProperty, numberControlVolumeProperty, new Range( options.minVolumeLiters, options.maxVolumeLiters ), combineOptions<NumberControlOptions>( {
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb( {
          thumbFill: options.color,
          tandem: volumeNumberControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
        } ),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: ( value: number ) => Utils.roundSymmetric( value * 2 ) / 2,
        phetioLinkedProperty: volumeProperty
      },
      numberDisplayOptions: {
        valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
        useRichText: true,
        useFullHeight: true
      },
      arrowButtonOptions: {
        enabledEpsilon: DensityBuoyancyCommonConstants.TOLERANCE,
        scale: DensityBuoyancyCommonConstants.ARROW_BUTTON_SCALE
      },
      enabledRangeProperty: enabledVolumeRangeProperty,
      tandem: volumeNumberControlTandem,
      titleNodeOptions: {
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    const massContainerNode = new Node();

    const createMassNumberControl = ( maxMass: number, tandemName?: string ) => {
      const numberControlTandem = tandemName ? massNumberControlContainerTandem.createTandem( tandemName ) :
                                  massNumberControlContainerTandem;

      return new NumberControl(
        DensityBuoyancyCommonStrings.massStringProperty,
        numberControlMassProperty,
        new Range( options.minMass, maxMass ),
        combineOptions<NumberControlOptions>( {
          sliderOptions: {
            thumbNode: new PrecisionSliderThumb( {
              thumbFill: options.color,
              tandem: numberControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
            } ),
            thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
            constrainValue: ( value: number ) => {
              const range = enabledMassRangeProperty.value;

              // Don't snap before ranges, since this doesn't work for Styrofoam case, see
              // https://github.com/phetsims/density/issues/46
              if ( value <= range.min ) {
                return range.min;
              }
              if ( value >= range.max ) {
                return range.max;
              }
              return enabledMassRangeProperty.value.constrainValue( Utils.toFixedNumber( value, 1 ) );
            },
            phetioLinkedProperty: massProperty
          },
          numberDisplayOptions: {
            valuePattern: DensityBuoyancyCommonConstants.KILOGRAMS_PATTERN_STRING_PROPERTY,
            useFullHeight: true
          },
          arrowButtonOptions: {
            enabledEpsilon: DensityBuoyancyCommonConstants.TOLERANCE
          },
          enabledRangeProperty: enabledMassRangeProperty,
          tandem: numberControlTandem,
          titleNodeOptions: {
            visiblePropertyOptions: {
              phetioReadOnly: true
            }
          },

          visiblePropertyOptions: {
            // We don't want them messing with visibility if we are toggling it for low/high density
            phetioReadOnly: supportTwoMassNumberControls
          }
        }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );
    };

    if ( supportTwoMassNumberControls ) {
      const lowDensityMassNumberControl = createMassNumberControl( options.maxMass, 'lowDensityMassNumberControl' );
      const highDensityMassNumberControl = createMassNumberControl( options.highDensityMaxMass!, 'highDensityMassNumberControl' );

      massContainerNode.addChild( lowDensityMassNumberControl );
      massContainerNode.addChild( highDensityMassNumberControl );

      // listener doesn't need removal, since everything here lives for the lifetime of the simulation
      materialProperty.link( material => {
        if ( supportTwoMassNumberControls ) {
          const highDensityAndNotCustom = material.density > options.highDensityThreshold && !material.custom;
          highDensityMassNumberControl.visible = highDensityAndNotCustom;
          lowDensityMassNumberControl.visible = !highDensityAndNotCustom;
        }
      } );
    }
    else {
      massContainerNode.addChild( createMassNumberControl( options.maxMass ) );
    }

    const fallbackContainer = new Node();
    const massVolumeVBox = new VBox( combineOptions<VBoxOptions>( {
      children: [ massContainerNode, volumeNumberControl ],
      spacing: 15
    } ) );

    this.addChild( fallbackContainer );
    this.addChild( massVolumeVBox );

    let fallbackNode = null;

    // TODO: Use ToggleNode?, https://github.com/phetsims/density-buoyancy-common/issues/95
    materialProperty.link( material => {
      fallbackContainer.removeAllChildren();
      if ( material.hidden ) {
        fallbackNode = new Text( DensityBuoyancyCommonStrings.whatIsTheMaterialStringProperty, {
          font: new PhetFont( 14 )
        } );
        fallbackNode.maxWidth = massVolumeVBox.width;
        fallbackNode.center = massVolumeVBox.center;
        fallbackContainer.addChild( fallbackNode );
      }
      else {
        fallbackNode = null;
      }
      massVolumeVBox.visible = fallbackNode === null;
    } );

    this.minContentWidth = massVolumeVBox.width;

    this.mutate( options );
  }

  /**
   * Returns the default NumberControl options used by this component.
   */
  public static getNumberControlOptions(): NumberControlOptions {
    return {
      delta: 0.01,
      sliderOptions: {
        trackSize: new Dimension2( 120, TRACK_HEIGHT )
      },
      numberDisplayOptions: {
        decimalPlaces: 2,
        textOptions: {
          maxWidth: 60
        },
        useFullHeight: true
      },
      layoutFunction: NumberControl.createLayoutFunction4( {
        sliderPadding: 5
      } ),
      titleNodeOptions: {
        font: DensityBuoyancyCommonConstants.ITEM_FONT,
        maxWidth: 90
      },
      arrowButtonOptions: {
        scale: DensityBuoyancyCommonConstants.ARROW_BUTTON_SCALE
      }
    };
  }
}

densityBuoyancyCommon.register( 'MaterialMassVolumeControlNode', MaterialMassVolumeControlNode );