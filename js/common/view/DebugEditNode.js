// Copyright 2019-2020, University of Colorado Boulder

/**
 * Shows an editor panel for debugging purposes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Cone from '../model/Cone.js';
import Cuboid from '../model/Cuboid.js';
import Ellipsoid from '../model/Ellipsoid.js';
import HorizontalCylinder from '../model/HorizontalCylinder.js';
import Material from '../model/Material.js';
import VerticalCylinder from '../model/VerticalCylinder.js';

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
    const gravityForceInterpolatedProperty = new DynamicProperty( massProperty, {
      derive: 'gravityForceInterpolatedProperty'
    } );
    const buoyancyForceInterpolatedProperty = new DynamicProperty( massProperty, {
      derive: 'buoyancyForceInterpolatedProperty'
    } );
    const contactForceInterpolatedProperty = new DynamicProperty( massProperty, {
      derive: 'contactForceInterpolatedProperty'
    } );

    const comboBoxItemTextOptions = {
      font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
      maxWidth: 160
    };
    const comboBox = new ComboBox( [
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.aluminum, comboBoxItemTextOptions ), Material.ALUMINUM ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.brick, comboBoxItemTextOptions ), Material.BRICK ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.copper, comboBoxItemTextOptions ), Material.COPPER ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.ice, comboBoxItemTextOptions ), Material.ICE ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.platinum, comboBoxItemTextOptions ), Material.PLATINUM ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.steel, comboBoxItemTextOptions ), Material.STEEL ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.styrofoam, comboBoxItemTextOptions ), Material.STYROFOAM ),
      new ComboBoxItem( new Text( densityBuoyancyCommonStrings.material.wood, comboBoxItemTextOptions ), Material.WOOD )
    ], materialProperty, listParent, {
      xMargin: 8,
      yMargin: 4
    } );

    const massText = new Text( '', {
      font: new PhetFont( 10 ),
      maxWidth: 160
    } );
    const volumeText = new Text( '', {
      font: new PhetFont( 10 ),
      maxWidth: 160
    } );
    const gravityForceText = new Text( '', {
      font: new PhetFont( 10 ),
      maxWidth: 160
    } );
    const buoyancyForceText = new Text( '', {
      font: new PhetFont( 10 ),
      maxWidth: 160
    } );
    const contactForceText = new Text( '', {
      font: new PhetFont( 10 ),
      maxWidth: 160
    } );

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
      massText.text = `Mass: ${StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPattern, {
        kilograms: Utils.toFixed( mass, 6 )
      } )}`;
    } );
    volumeProperty.link( volume => {
      volumeText.text = `Volume: ${StringUtils.fillIn( densityBuoyancyCommonStrings.litersPattern, {
        liters: Utils.toFixed( volume, 6 )
      } )}`;
    } );
    gravityForceInterpolatedProperty.link( gravityForce => {
      gravityForceText.text = `Gravity: ${Utils.toFixed( gravityForce.x, 6 )}, ${Utils.toFixed( gravityForce.y, 6 )}`;
    } );
    buoyancyForceInterpolatedProperty.link( buoyancyForce => {
      buoyancyForceText.text = `Buoyancy: ${Utils.toFixed( buoyancyForce.x, 6 )}, ${Utils.toFixed( buoyancyForce.y, 6 )}`;
    } );
    contactForceInterpolatedProperty.link( contactForce => {
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
        valuePattern: '{{value}} m',
        useFullHeight: true
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

densityBuoyancyCommon.register( 'DebugEditNode', DebugEditNode );
export default DebugEditNode;