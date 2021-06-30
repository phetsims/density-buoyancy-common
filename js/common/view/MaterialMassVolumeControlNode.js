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
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';

// constants
const LITERS_IN_CUBIC_METER = 1000;
const CUSTOM_MATERIAL_PLACEHOLDER = null;
const TRACK_HEIGHT = 3;

class MaterialMassVolumeControlNode extends VBox {
  /**
   * @param {Property.<Material>} materialProperty
   * @param {Property.<number>} massProperty
   * @param {Property.<number>} volumeProperty
   * @param {Array.<Material>} materials
   * @param {function} setVolume
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

    super( {
      spacing: 15,
      align: 'left'
    } );

    const comboBoxMaterialProperty = new DynamicProperty( new Property( materialProperty ), {
      bidirectional: true,
      map: material => {
        return material.custom ? CUSTOM_MATERIAL_PLACEHOLDER : material;
      },
      inverseMap: material => {
        return material || Material.createCustomSolidMaterial( {
          density: materialProperty.value.density
        } );
      },
      reentrant: true
    } );

    let modelMassChanging = false;
    let userMassChanging = false;
    let modelVolumeChanging = false;
    let userVolumeChanging = false;

    const massNumberProperty = new NumberProperty( massProperty.value );

    // liters from m^3
    const numberControlVolumeProperty = new NumberProperty( volumeProperty.value * LITERS_IN_CUBIC_METER );

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

        numberControlVolumeProperty.value = volumeLiters;

        modelVolumeChanging = false;
      }
    } );

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

        massNumberProperty.value = adjustedMass;

        modelMassChanging = false;
      }
    } );

    const enabledMassRangeProperty = new DerivedProperty( [ materialProperty ], material => {
      if ( material.custom ) {
        return new Range( options.minCustomMass, options.maxCustomMass );
      }
      else {
        const density = material.density;

        const minMass = Utils.clamp( density * options.minVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass );
        const maxMass = Utils.clamp( density * options.maxVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass );

        return new Range( minMass, maxMass );
      }
    }, {
      reentrant: true
    } );

    const comboMaxWidth = options.labelNode ? 110 : 160;
    const comboBox = new ComboBox( [
      ...materials.map( material => {
        return new ComboBoxItem( new Text( material.name, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: comboMaxWidth
        } ), material );
      } ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.custom, {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: comboMaxWidth
      } ), CUSTOM_MATERIAL_PLACEHOLDER )
    ], comboBoxMaterialProperty, listParent, {
      xMargin: 8,
      yMargin: 4
    } );

    const massNumberControl = new NumberControl( densityBuoyancyCommonStrings.mass, massNumberProperty, new Range( options.minMass, options.maxMass ), merge( {
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb( {
          thumbFill: options.color
        } ),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: value => Utils.toFixedNumber( value, 1 )
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
      enabledRangeProperty: enabledMassRangeProperty
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    const volumeNumberControl = new NumberControl( densityBuoyancyCommonStrings.volume, numberControlVolumeProperty, new Range( options.minVolumeLiters, options.maxVolumeLiters ), merge( {
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb( {
          thumbFill: options.color
        } ),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: value => Utils.roundSymmetric( value * 2 ) / 2
      },
      numberDisplayOptions: {
        valuePattern: StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
          liters: '{{value}}'
        } ),
        useFullHeight: true
      },
      arrowButtonOptions: {
        enabledEpsilon: 1e-7
      }
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    const topRow = options.labelNode ? new HBox( {
      children: [
        comboBox,
        options.labelNode
      ],
      spacing: 5
    } ) : comboBox;

    this.children = [
      topRow,
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