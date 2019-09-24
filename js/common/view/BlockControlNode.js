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
  const Dimension2 = require( 'DOT/Dimension2' );
  const DynamicProperty = require( 'AXON/DynamicProperty' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const kilogramsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPattern' );
  const litersPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/litersPattern' );
  const massString = require( 'string!DENSITY_BUOYANCY_COMMON/mass' );
  const materialAluminumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.aluminum' );
  const materialBrickString = require( 'string!DENSITY_BUOYANCY_COMMON/material.brick' );
  const materialIceString = require( 'string!DENSITY_BUOYANCY_COMMON/material.ice' );
  const materialStyrofoamString = require( 'string!DENSITY_BUOYANCY_COMMON/material.styrofoam' );
  const materialWoodString = require( 'string!DENSITY_BUOYANCY_COMMON/material.wood' );
  const volumeString = require( 'string!DENSITY_BUOYANCY_COMMON/volume' );

  // constants
  const LITERS_IN_CUBIC_METER = 1000;

  class BlockControlNode extends VBox {
    /**
     * @param {Cuboid} cuboid
     * @param {Node} listParent
     * @param {Object} [options]
     */
    constructor( cuboid, listParent, options ) {
      super( {
        spacing: 3,
        align: 'left'
      } );

      const materialProperty = new DynamicProperty( new Property( cuboid ), {
        derive: 'materialProperty',
        bidirectional: true
      } );

      const massNumberProperty = new NumberProperty( cuboid.massProperty.value );

      // liters to m^3
      const volumeProperty = new NumberProperty( cuboid.volumeProperty.value / LITERS_IN_CUBIC_METER );

      const comboBox = new ComboBox( [
        new ComboBoxItem( new Text( materialStyrofoamString, { font: new PhetFont( 12 ) } ), Material.STYROFOAM ),
        new ComboBoxItem( new Text( materialWoodString, { font: new PhetFont( 12 ) } ), Material.WOOD ),
        new ComboBoxItem( new Text( materialIceString, { font: new PhetFont( 12 ) } ), Material.ICE ),
        new ComboBoxItem( new Text( materialBrickString, { font: new PhetFont( 12 ) } ), Material.BRICK ),
        new ComboBoxItem( new Text( materialAluminumString, { font: new PhetFont( 12 ) } ), Material.ALUMINUM )
        // TODO: custom!
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

      const massNumberControl = new NumberControl( massString, massNumberProperty, new Range( 0, 27 ), merge( {
        numberDisplayOptions: {
          valuePattern: StringUtils.fillIn( kilogramsPatternString, {
            kilograms: '{{value}}'
          } )
        }
      }, numberControlOptions ) );
      const volumeNumberControl = new NumberControl( volumeString, volumeProperty, new Range( 1, 10 ), merge( {
        numberDisplayOptions: {
          valuePattern: StringUtils.fillIn( litersPatternString, {
            liters: '{{value}}'
          } )
        }
      }, numberControlOptions ) );

      // mass.updateSize( size );

      this.children = [
        comboBox,
        massNumberControl,
        volumeNumberControl
      ];

      this.mutate( options );
    }
  }

  return densityBuoyancyCommon.register( 'BlockControlNode', BlockControlNode );
} );
