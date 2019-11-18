// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const ComboBox = require( 'SUN/ComboBox' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const DynamicProperty = require( 'AXON/DynamicProperty' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const kilogramsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPattern' );
  const litersPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/litersPattern' );
  const massString = require( 'string!DENSITY_BUOYANCY_COMMON/mass' );
  const materialCustomString = require( 'string!DENSITY_BUOYANCY_COMMON/material.custom' );
  const volumeString = require( 'string!DENSITY_BUOYANCY_COMMON/volume' );

  // constants
  const LITERS_IN_CUBIC_METER = 1000;
  const CUSTOM_MATERIAL_PLACEHOLDER = null;

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
        minMass: 0,
        maxCustomMass: 10,
        maxMass: 27,
        minVolumeLiters: 1,
        maxVolumeLiters: 10
      }, options );

      super( {
        spacing: 3,
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
        if ( !modelVolumeChanging ) {
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
          // TODO: handle re-entrance?
          modelVolumeChanging = true;

          numberControlVolumeProperty.value = cubicMeters * LITERS_IN_CUBIC_METER;

          modelVolumeChanging = false;
        }
      } );

      massNumberProperty.lazyLink( mass => {
        if ( !modelMassChanging ) {
          userMassChanging = true;

          if ( materialProperty.value.custom ) {
            materialProperty.value = Material.createCustomSolidMaterial( {
              density: mass / volumeProperty.value
            } );
          }
          else {
            numberControlVolumeProperty.value = mass / materialProperty.value.density * LITERS_IN_CUBIC_METER;
          }

          userMassChanging = false;
        }
      } );
      massProperty.lazyLink( mass => {
        if ( !userMassChanging ) {
          modelMassChanging = true;

          massNumberProperty.value = mass;

          modelMassChanging = false;
        }
      } );

      const enabledMassRangeProperty = new DerivedProperty( [ materialProperty ], material => {
        if ( material.custom ) {
          return new Range( options.minMass, options.maxCustomMass );
        }
        else {
          const density = material.density;

          const minMass = Util.clamp( density * options.minVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass );
          const maxMass = Util.clamp( density * options.maxVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass );

          return new Range( minMass, maxMass );
        }
      }, {
        reentrant: true
      } );

      const comboBox = new ComboBox( [
        ...materials.map( material => {
          return new ComboBoxItem( new Text( material.name, { font: new PhetFont( 12 ) } ), material );
        } ),
        new ComboBoxItem( new Text( materialCustomString, { font: new PhetFont( 12 ) } ), CUSTOM_MATERIAL_PLACEHOLDER )
      ], comboBoxMaterialProperty, listParent, {
        xMargin: 8,
        yMargin: 4
      } );

      const numberControlOptions = {
        delta: 0.01,
        sliderOptions: {
          trackSize: new Dimension2( 120, 3 ),
          thumbSize: new Dimension2( 8, 20 )
        },
        numberDisplayOptions: {
          decimalPlaces: 2
        },
        layoutFunction: NumberControl.createLayoutFunction4( {
          // TODO: createBottomContent for custom? or no?
        } )
      };

      const massNumberControl = new NumberControl( massString, massNumberProperty, new Range( options.minMass, options.maxMass ), merge( {
        sliderOptions: {
          enabledRangeProperty: enabledMassRangeProperty
        },
        numberDisplayOptions: {
          valuePattern: StringUtils.fillIn( kilogramsPatternString, {
            kilograms: '{{value}}'
          } )
        }
      }, numberControlOptions ) );
      const volumeNumberControl = new NumberControl( volumeString, numberControlVolumeProperty, new Range( options.minVolumeLiters, options.maxVolumeLiters ), merge( {
        numberDisplayOptions: {
          valuePattern: StringUtils.fillIn( litersPatternString, {
            liters: '{{value}}'
          } )
        }
      }, numberControlOptions ) );

      // TODO: ensure maxWidth for combo box contents so this isn't an issue. How do we want to do layout?
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
  }

  return densityBuoyancyCommon.register( 'MaterialMassVolumeControlNode', MaterialMassVolumeControlNode );
} );
