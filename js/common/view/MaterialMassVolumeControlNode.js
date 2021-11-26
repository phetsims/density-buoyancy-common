// Copyright 2019-2021, University of Colorado Boulder

/**
 * A control that allows modification of the mass and volume (which can be linked, or unlinked for custom materials).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationIO from '../../../../phet-core/js/EnumerationIO.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import { VBox } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';

// constants
const LITERS_IN_CUBIC_METER = 1000;
const TRACK_HEIGHT = 3;

// A workaround for changing a DerivedProperty range Property to a NumberProperty, where the new range AND value will
// not overlap with the previous one.
class WorkaroundRange extends Range {
  /**
   * @public
   * @override
   *
   * @param {number} value
   * @returns {boolean}
   */
  contains( value ) { return true; }
}

class MaterialMassVolumeControlNode extends VBox {
  /**
   * @param {Property.<Material>} materialProperty
   * @param {Property.<number>} massProperty
   * @param {Property.<number>} volumeProperty
   * @param {Array.<Material>} materials
   * @param {function(number)} setVolume
   * @param {Node} listParent
   * @param {Object} [options]
   */
  constructor( materialProperty, massProperty, volumeProperty, materials, setVolume, listParent, options ) {

    options = merge( {
      // {Node|null}
      labelNode: null,

      // {number}
      minMass: 0.1,
      minCustomMass: 0.5,
      maxCustomMass: 10,
      maxMass: 27,
      minVolumeLiters: 1,
      maxVolumeLiters: 10,

      // {PaintDef}
      color: null
    }, options );

    const tandem = options.tandem;

    const massNumberControlTandem = tandem.createTandem( 'massNumberControl' );
    const volumeNumberControlTandem = tandem.createTandem( 'volumeNumberControl' );

    super( {
      spacing: 15,
      align: 'left'
    } );

    const MaterialEnumeration = Enumeration.byKeys( [ ...materials.map( material => material.identifier ), 'CUSTOM' ] );

    const comboBoxMaterialProperty = new DynamicProperty( new Property( materialProperty ), {
      bidirectional: true,
      map: material => {
        return material.custom ? MaterialEnumeration.CUSTOM : MaterialEnumeration[ material.identifier ];
      },
      inverseMap: materialEnum => {
        if ( materialEnum === MaterialEnumeration.CUSTOM ) {
          return Material.createCustomSolidMaterial( {
            density: Utils.clamp( materialProperty.value.density, options.minCustomMass / volumeProperty.value, options.maxCustomMass / volumeProperty.value )
          } );
        }
        else {
           return Material[ materialEnum.name ];
        }
      },
      reentrant: true,
      phetioState: false,
      tandem: options.tandem.createTandem( 'comboBoxMaterialProperty' ),
      validValues: MaterialEnumeration.VALUES,
      phetioType: Property.PropertyIO( EnumerationIO( MaterialEnumeration ) )
    } );

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

        const minMass = Utils.clamp( density * options.minVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass );
        const maxMass = Utils.clamp( density * options.maxVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass );

        return new WorkaroundRange( minMass, maxMass );
      }
    }, {
      reentrant: true,
      phetioState: false,
      phetioType: DerivedProperty.DerivedPropertyIO( Range.RangeIO ),
      tandem: massNumberControlTandem.createTandem( 'enabledMassRangeProperty' )
    } );

    // passed to the NumberControl
    const massNumberProperty = new NumberProperty( massProperty.value, {
      tandem: massNumberControlTandem.createTandem( 'massNumberProperty' ),
      phetioState: false,
      range: enabledMassRangeProperty,
      phetioStudioControl: false
    } );

    // passed to the NumberControl - liters from m^3
    const numberControlVolumeProperty = new NumberProperty( volumeProperty.value * LITERS_IN_CUBIC_METER, {
      range: new Range( options.minVolumeLiters, options.maxVolumeLiters ),
      tandem: volumeNumberControlTandem.createTandem( 'numberControlVolumeProperty' ),
      phetioState: false,
      phetioStudioControl: false
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

        if ( materialProperty.value.custom ) {
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

    const comboMaxWidth = options.labelNode ? 110 : 160;
    const comboBox = new ComboBox( [
      ...materials.map( material => {
        return new ComboBoxItem( new Text( material.name, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: comboMaxWidth
        } ), MaterialEnumeration[ material.identifier ], { tandemName: `${material.tandemName}Item` } );
      } ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.custom, {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: comboMaxWidth,
        tandemName: 'custom'
      } ), MaterialEnumeration.CUSTOM, { tandemName: 'customItem' } )
    ], comboBoxMaterialProperty, listParent, {
      xMargin: 8,
      yMargin: 4,
      tandem: tandem.createTandem( 'comboBox' )
    } );

    const massNumberControl = new NumberControl( densityBuoyancyCommonStrings.mass, massNumberProperty, new Range( options.minMass, options.maxMass ), merge( {
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb( {
          thumbFill: options.color,
          tandem: massNumberControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
        } ),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: value => enabledMassRangeProperty.value.constrainValue( Utils.toFixedNumber( value, 1 ) ),
        phetioLinkedProperty: massProperty
      },
      numberDisplayOptions: {
        valuePattern: StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPattern, {
          kilograms: '{{value}}'
        } ),
        useFullHeight: true
      },
      arrowButtonOptions: {
        enabledEpsilon: 1e-7
      },
      enabledRangeProperty: enabledMassRangeProperty,
      tandem: massNumberControlTandem,
      titleNodeOptions: {
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    const volumeNumberControl = new NumberControl( densityBuoyancyCommonStrings.volume, numberControlVolumeProperty, new Range( options.minVolumeLiters, options.maxVolumeLiters ), merge( {
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb( {
          thumbFill: options.color,
          tandem: volumeNumberControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
        } ),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: value => Utils.roundSymmetric( value * 2 ) / 2,
        phetioLinkedProperty: volumeProperty
      },
      numberDisplayOptions: {
        valuePattern: StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
          liters: '{{value}}'
        } ),
        useFullHeight: true
      },
      arrowButtonOptions: {
        enabledEpsilon: 1e-7
      },
      tandem: volumeNumberControlTandem,
      titleNodeOptions: {
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    this.children = [
      new HBox( {
        spacing: 5,
        children: [
          comboBox,
          ...[ options.labelNode ].filter( _.identity )
        ]
      } ),
      massNumberControl,
      volumeNumberControl
    ];

    this.mutate( options );
  }

  /**
   * Returns the default NumberControl options used by this component.
   * @public
   *
   * @returns {Object}
   */
  static getNumberControlOptions() {
    return {
      delta: 0.01,
      sliderOptions: {
        trackSize: new Dimension2( 120, TRACK_HEIGHT )
      },
      numberDisplayOptions: {
        decimalPlaces: 2,
        font: new PhetFont( 14 ),
        textOptions: {
          maxWidth: 60
        },
        useFullHeight: true
      },
      layoutFunction: NumberControl.createLayoutFunction4(),
      titleNodeOptions: {
        font: new PhetFont( { size: 14, weight: 'bold' } ),
        maxWidth: 90
      }
    };
  }
}

densityBuoyancyCommon.register( 'MaterialMassVolumeControlNode', MaterialMassVolumeControlNode );
export default MaterialMassVolumeControlNode;