// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const ComboBox = require( 'SUN/ComboBox' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
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
  const materialAluminumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.aluminum' );
  const materialBrickString = require( 'string!DENSITY_BUOYANCY_COMMON/material.brick' );
  const materialCustomString = require( 'string!DENSITY_BUOYANCY_COMMON/material.custom' );
  const materialIceString = require( 'string!DENSITY_BUOYANCY_COMMON/material.ice' );
  const materialStyrofoamString = require( 'string!DENSITY_BUOYANCY_COMMON/material.styrofoam' );
  const materialWoodString = require( 'string!DENSITY_BUOYANCY_COMMON/material.wood' );
  const volumeString = require( 'string!DENSITY_BUOYANCY_COMMON/volume' );

  // constants
  const LITERS_IN_CUBIC_METER = 1000;
  const MIN_MASS = 0;
  const MAX_CUSTOM_MASS = 10;
  const MAX_MASS = 27;
  const MIN_VOLUME_LITERS = 1;
  const MAX_VOLUME_LITERS = 10;
  const CUSTOM_MATERIAL_PLACEHOLDER = null;

  class BlockControlNode extends VBox {
    /**
     * @param {Cuboid} cuboid
     * @param {Node} listParent
     * @param {Object} [options]
     */
    constructor( cuboid, listParent, options ) {
      super( {
        spacing: 3,
        align: 'left',

        // {Node|null}
        labelNode: null
      } );

      const materialProperty = new DynamicProperty( new Property( cuboid ), {
        derive: 'materialProperty',
        bidirectional: true,
        map: material => {
          return material.custom ? CUSTOM_MATERIAL_PLACEHOLDER : material;
        },
        inverseMap: material => {
          return material || Material.createCustomMaterial( {
            density: cuboid.materialProperty.value.density
          } );
        },
        reentrant: true
      } );

      let modelMassChanging = false;
      let userMassChanging = false;
      let modelVolumeChanging = false;
      let userVolumeChanging = false;

      const massNumberProperty = new NumberProperty( cuboid.massProperty.value );

      // liters from m^3
      const volumeProperty = new NumberProperty( cuboid.volumeProperty.value * LITERS_IN_CUBIC_METER );

      volumeProperty.lazyLink( liters => {
        if ( !modelVolumeChanging ) {
          const cubicMeters = liters / LITERS_IN_CUBIC_METER;

          userVolumeChanging = true;

          // If we're custom, adjust the density
          if ( cuboid.materialProperty.value.custom ) {
            cuboid.materialProperty.value = Material.createCustomMaterial( {
              density: cuboid.massProperty.value / cubicMeters
            } );
          }
          cuboid.updateSize( Cuboid.boundsFromVolume( cubicMeters ) );

          userVolumeChanging = false;
        }
      } );
      cuboid.volumeProperty.lazyLink( cubicMeters => {
        if ( !userVolumeChanging ) {
          // TODO: handle re-entrance?
          modelVolumeChanging = true;

          volumeProperty.value = cubicMeters * LITERS_IN_CUBIC_METER;

          modelVolumeChanging = false;
        }
      } );

      massNumberProperty.lazyLink( mass => {
        if ( !modelMassChanging ) {
          userMassChanging = true;

          if ( cuboid.materialProperty.value.custom ) {
            cuboid.materialProperty.value = Material.createCustomMaterial( {
              density: mass / cuboid.volumeProperty.value
            } );
          }
          else {
            volumeProperty.value = mass / cuboid.materialProperty.value.density * LITERS_IN_CUBIC_METER;
          }

          userMassChanging = false;
        }
      } );
      cuboid.massProperty.lazyLink( mass => {
        if ( !userMassChanging ) {
          modelMassChanging = true;

          massNumberProperty.value = mass;

          modelMassChanging = false;
        }
      } );

      const enabledMassRangeProperty = new DerivedProperty( [ cuboid.materialProperty ], material => {
        if ( material.custom ) {
          return new Range( MIN_MASS, MAX_CUSTOM_MASS );
        }
        else {
          const density = material.density;

          const minMass = Util.clamp( density * MIN_VOLUME_LITERS / LITERS_IN_CUBIC_METER, MIN_MASS, MAX_MASS );
          const maxMass = Util.clamp( density * MAX_VOLUME_LITERS / LITERS_IN_CUBIC_METER, MIN_MASS, MAX_MASS );

          return new Range( minMass, maxMass );
        }
      }, {
        reentrant: true
      } );

      const comboBox = new ComboBox( [
        new ComboBoxItem( new Text( materialStyrofoamString, { font: new PhetFont( 12 ) } ), Material.STYROFOAM ),
        new ComboBoxItem( new Text( materialWoodString, { font: new PhetFont( 12 ) } ), Material.WOOD ),
        new ComboBoxItem( new Text( materialIceString, { font: new PhetFont( 12 ) } ), Material.ICE ),
        new ComboBoxItem( new Text( materialBrickString, { font: new PhetFont( 12 ) } ), Material.BRICK ),
        new ComboBoxItem( new Text( materialAluminumString, { font: new PhetFont( 12 ) } ), Material.ALUMINUM ),
        new ComboBoxItem( new Text( materialCustomString, { font: new PhetFont( 12 ) } ), CUSTOM_MATERIAL_PLACEHOLDER )
      ], materialProperty, listParent, {
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

      const massNumberControl = new NumberControl( massString, massNumberProperty, new Range( MIN_MASS, MAX_MASS ), merge( {
        sliderOptions: {
          enabledRangeProperty: enabledMassRangeProperty
        },
        numberDisplayOptions: {
          valuePattern: StringUtils.fillIn( kilogramsPatternString, {
            kilograms: '{{value}}'
          } )
        }
      }, numberControlOptions ) );
      const volumeNumberControl = new NumberControl( volumeString, volumeProperty, new Range( MIN_VOLUME_LITERS, MAX_VOLUME_LITERS ), merge( {
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

  return densityBuoyancyCommon.register( 'BlockControlNode', BlockControlNode );
} );
