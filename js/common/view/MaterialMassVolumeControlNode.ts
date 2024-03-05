// Copyright 2019-2024, University of Colorado Boulder

/**
 * A control that allows modification of the mass and volume (which can be linked, or unlinked for custom materials).
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
import { Node, Text, TPaint, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';
import MaterialControlNode, { MaterialControlNodeOptions } from './MaterialControlNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';

// constants
const LITERS_IN_CUBIC_METER = 1000;
const TRACK_HEIGHT = 3;

// A workaround for changing a DerivedProperty range Property to a NumberProperty, where the new range AND value will
// not overlap with the previous one.
class WorkaroundRange extends Range {
  public override contains( value: number ): boolean { return true; }
}

type SelfOptions = {
  minMass?: number;
  lowDensityMaxMass?: number;
  highDensityMaxMass?: number | null; // Used in the Applications Screen View to increase the mass range for dense materials
  highDensityThreshold?: number; // Density above which the range switches from light to heavy
  minVolumeLiters?: number;
  maxVolumeLiters?: number;
  color?: TPaint;
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
      lowDensityMaxMass: 27,
      highDensityMaxMass: null,
      highDensityThreshold: 2700,
      minVolumeLiters: 1,
      maxVolumeLiters: 10,
      minCustomMass: 0.5,
      maxCustomMass: 10,
      minCustomVolumeLiters: 1,
      color: null
    }, providedOptions );

    const massNumberControlTandem = options.tandem.createTandem( 'massNumberControl' );
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

        const maxMassRange = options.highDensityMaxMass && density > options.highDensityThreshold ? options.highDensityMaxMass : options.lowDensityMaxMass;

        const minMass = Utils.clamp( density * options.minVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, maxMassRange );
        const maxMass = Utils.clamp( density * options.maxVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, maxMassRange );

        return new WorkaroundRange( minMass, maxMass );
      }
    }, {
      reentrant: true,
      phetioState: false,
      phetioValueType: Range.RangeIO,
      tandem: massNumberControlTandem.createTandem( 'enabledMassRangeProperty' ),
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
    const massNumberProperty = new NumberProperty( massProperty.value, {
      tandem: massNumberControlTandem.createTandem( 'numberControlMassProperty' ),
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
    massNumberProperty.lazyLink( mass => {
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

        massNumberProperty.value = Utils.clamp( adjustedMass, min, max );

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
        enabledEpsilon: DensityBuoyancyCommonConstants.TOLERANCE
      },
      enabledRangeProperty: enabledVolumeRangeProperty,
      tandem: volumeNumberControlTandem,
      titleNodeOptions: {
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    const volumeContainerNode = new Node( {
        children: [ volumeNumberControl ]
      }
    );

    const massContainerNode = new Node( {
        children: []
      }
    );

    const createMassNumberControl = ( maxMass: number, tandemName: string ) => {
      return new NumberControl( DensityBuoyancyCommonStrings.massStringProperty, massNumberProperty, new Range( options.minMass, maxMass ), combineOptions<NumberControlOptions>( {
        sliderOptions: {
          thumbNode: new PrecisionSliderThumb( {
            thumbFill: options.color,
            tandem: massNumberControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
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
        tandem: massNumberControlTandem,
        titleNodeOptions: {
          visiblePropertyOptions: {
            phetioReadOnly: true
          }
        }
      }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );
    };

    const lowDensityNumberControl = createMassNumberControl( options.lowDensityMaxMass, 'lowDensity' );
    let highDensityNumberControl = new Node();
    if ( options.highDensityMaxMass ) {
      highDensityNumberControl = createMassNumberControl( options.highDensityMaxMass, 'highDensity' );
    }

    massContainerNode.addChild( lowDensityNumberControl );
    massContainerNode.addChild( highDensityNumberControl );

    materialProperty.link( material => {
      if ( options.highDensityMaxMass ) {
        const highDensityAndNotCustom = material.density > options.highDensityThreshold && !material.custom;
        highDensityNumberControl.visible = highDensityAndNotCustom;
        lowDensityNumberControl.visible = !highDensityAndNotCustom;
      }
    } );

    const fallbackContainer = new Node();
    const massVolumeVBox = new VBox( combineOptions<VBoxOptions>( {
      children: [ massContainerNode, volumeContainerNode ],
      spacing: 15
    } ) );

    this.addChild( fallbackContainer );
    this.addChild( massVolumeVBox );

    let fallbackNode = null;

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
      }
    };
  }
}

densityBuoyancyCommon.register( 'MaterialMassVolumeControlNode', MaterialMassVolumeControlNode );
