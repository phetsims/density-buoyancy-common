// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const ComboBox = require( 'SUN/ComboBox' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const Cone = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cone' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const DynamicProperty = require( 'AXON/DynamicProperty' );
  const Ellipsoid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Ellipsoid' );
  const HorizontalCylinder = require( 'DENSITY_BUOYANCY_COMMON/common/model/HorizontalCylinder' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const VerticalCylinder = require( 'DENSITY_BUOYANCY_COMMON/common/model/VerticalCylinder' );

  // strings
  const kilogramsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPattern' );
  const litersPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/litersPattern' );
  const materialAluminumString = require( 'string!DENSITY_BUOYANCY_COMMON/material.aluminum' );
  const materialBrickString = require( 'string!DENSITY_BUOYANCY_COMMON/material.brick' );
  const materialCopperString = require( 'string!DENSITY_BUOYANCY_COMMON/material.copper' );
  const materialIceString = require( 'string!DENSITY_BUOYANCY_COMMON/material.ice' );
  const materialSteelString = require( 'string!DENSITY_BUOYANCY_COMMON/material.steel' );
  const materialStyrofoamString = require( 'string!DENSITY_BUOYANCY_COMMON/material.styrofoam' );
  const materialWoodString = require( 'string!DENSITY_BUOYANCY_COMMON/material.wood' );

  class DebugEditNode extends VBox {
    /**
     * @param {Property.<Mass>} massProperty
     * @param {Node} listParent
     * @param {Object} [options]
     */
    constructor( massProperty, listParent, options ) {
      super( {
        spacing: 3,
        align: 'left'
      } );

      const materialProperty = new DynamicProperty( massProperty, {
        derive: 'materialProperty',
        bidirectional: true
      } );

      const massNumberProperty = new DynamicProperty( massProperty, {
        derive: 'massProperty'
      } );
      const volumeProperty = new DynamicProperty( massProperty, {
        derive: 'volumeProperty'
      } );
      const gravityForceProperty = new DynamicProperty( massProperty, {
        derive: 'gravityForceProperty'
      } );
      const buoyancyForceProperty = new DynamicProperty( massProperty, {
        derive: 'buoyancyForceProperty'
      } );
      const contactForceProperty = new DynamicProperty( massProperty, {
        derive: 'contactForceProperty'
      } );

      const comboBox = new ComboBox( [
        new ComboBoxItem( new Text( materialAluminumString, { font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT } ), Material.ALUMINUM ),
        new ComboBoxItem( new Text( materialBrickString, { font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT } ), Material.BRICK ),
        new ComboBoxItem( new Text( materialCopperString, { font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT } ), Material.COPPER ),
        new ComboBoxItem( new Text( materialIceString, { font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT } ), Material.ICE ),
        new ComboBoxItem( new Text( materialSteelString, { font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT } ), Material.STEEL ),
        new ComboBoxItem( new Text( materialStyrofoamString, { font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT } ), Material.STYROFOAM ),
        new ComboBoxItem( new Text( materialWoodString, { font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT } ), Material.WOOD )
      ], materialProperty, listParent, {
        xMargin: 8,
        yMargin: 4
      } );

      const massText = new Text( '', { font: new PhetFont( 10 ) } );
      const volumeText = new Text( '', { font: new PhetFont( 10 ) } );
      const gravityForceText = new Text( '', { font: new PhetFont( 10 ) } );
      const buoyancyForceText = new Text( '', { font: new PhetFont( 10 ) } );
      const contactForceText = new Text( '', { font: new PhetFont( 10 ) } );

      const readoutsContainer = new VBox( {
        spacing: 1,
        align: 'left',
        children: [
          massText,
          volumeText,
          gravityForceText,
          buoyancyForceText,
          contactForceText
        ]
      } );

      massNumberProperty.link( mass => {
        massText.text = `Mass: ${StringUtils.fillIn( kilogramsPatternString, {
          kilograms: Utils.toFixed( mass, 6 )
        } )}`;
      } );
      volumeProperty.link( volume => {
        volumeText.text = `Volume: ${StringUtils.fillIn( litersPatternString, {
          liters: Utils.toFixed( volume, 6 )
        } )}`;
      } );
      gravityForceProperty.link( gravityForce => {
        gravityForceText.text = `Gravity: ${Utils.toFixed( gravityForce.x, 6 )}, ${Utils.toFixed( gravityForce.y, 6 )}`;
      } );
      buoyancyForceProperty.link( buoyancyForce => {
        buoyancyForceText.text = `Buoyancy: ${Utils.toFixed( buoyancyForce.x, 6 )}, ${Utils.toFixed( buoyancyForce.y, 6 )}`;
      } );
      contactForceProperty.link( contactForce => {
        contactForceText.text = `Contact: ${Utils.toFixed( contactForce.x, 6 )}, ${Utils.toFixed( contactForce.y, 6 )}`;
      } );

      const controlsContainer = new VBox( {
        spacing: 5
      } );
      const disposables = [];
      const numberControlOptions = {
        delta: 0.01,
        sliderOptions: {
          trackSize: new Dimension2( 100, 3 ),
          thumbSize: new Dimension2( 8, 20 )
        },
        numberDisplayOptions: {
          decimalPlaces: 2,
          valuePattern: '{{value}} m'
        },
        layoutFunction: NumberControl.createLayoutFunction1( {
          arrowButtonsXSpacing: 5
        } )
      };

      massProperty.link( mass => {
        disposables.forEach( disposable => disposable.dispose() );
        disposables.length = 0;

        function addProperty( name, property, range ) {
          const numberControl = new NumberControl( name, property, range, numberControlOptions );
          controlsContainer.addChild( numberControl );
          disposables.push( property );
          disposables.push( numberControl );
        }

        if ( mass instanceof Cuboid || mass instanceof Ellipsoid ) {
          const widthProperty = new Property( mass.sizeProperty.value.width );
          const heightProperty = new Property( mass.sizeProperty.value.height );
          const depthProperty = new Property( mass.sizeProperty.value.depth );

          widthProperty.lazyLink( width => {
            mass.updateSize( mass.sizeProperty.value.withMinX( -width / 2 ).withMaxX( width / 2 ) );
          } );
          heightProperty.lazyLink( height => {
            mass.updateSize( mass.sizeProperty.value.withMinY( -height / 2 ).withMaxY( height / 2 ) );
          } );
          depthProperty.lazyLink( depth => {
            mass.updateSize( mass.sizeProperty.value.withMinZ( -depth / 2 ).withMaxZ( depth / 2 ) );
          } );

          addProperty( 'Width', widthProperty, new Range( 0.01, 0.2 ) );
          addProperty( 'Height', heightProperty, new Range( 0.01, 0.2 ) );
          addProperty( 'Depth', depthProperty, new Range( 0.01, 0.2 ) );
        }
        else if ( mass instanceof HorizontalCylinder ) {
          const radiusProperty = new Property( mass.radiusProperty.value );
          const lengthProperty = new Property( mass.lengthProperty.value );

          radiusProperty.lazyLink( radius => {
            mass.updateSize( radius, mass.lengthProperty.value );
          } );
          lengthProperty.lazyLink( length => {
            mass.updateSize( mass.radiusProperty.value, length );
          } );

          addProperty( 'Radius', radiusProperty, new Range( 0.01, 0.1 ) );
          addProperty( 'Length', lengthProperty, new Range( 0.01, 0.2 ) );
        }
        else if ( mass instanceof VerticalCylinder || mass instanceof Cone ) {
          const radiusProperty = new Property( mass.radiusProperty.value );
          const heightProperty = new Property( mass.heightProperty.value );

          radiusProperty.lazyLink( radius => {
            mass.updateSize( radius, mass.heightProperty.value );
          } );
          heightProperty.lazyLink( height => {
            mass.updateSize( mass.radiusProperty.value, height );
          } );

          addProperty( 'Radius', radiusProperty, new Range( 0.01, 0.1 ) );
          addProperty( 'Height', heightProperty, new Range( 0.01, 0.2 ) );
        }
      } );

      this.children = [
        comboBox,
        controlsContainer,
        readoutsContainer
      ];

      this.mutate( options );
    }
  }

  return densityBuoyancyCommon.register( 'DebugEditNode', DebugEditNode );
} );
