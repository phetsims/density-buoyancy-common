// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const Checkbox = require( 'SUN/Checkbox' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const buoyancyString = require( 'string!DENSITY_BUOYANCY_COMMON/buoyancy' );
  const contactString = require( 'string!DENSITY_BUOYANCY_COMMON/contact' );
  const forcesString = require( 'string!DENSITY_BUOYANCY_COMMON/forces' );
  const forceValuesString = require( 'string!DENSITY_BUOYANCY_COMMON/forceValues' );
  const gravityString = require( 'string!DENSITY_BUOYANCY_COMMON/gravity' );
  const massesString = require( 'string!DENSITY_BUOYANCY_COMMON/masses' );

  // constants
  const arrowSpacing = 15;
  const maxWidth = 300;
  const arrowLength = 60;
  const arrowOptions = {
    stroke: null,
    headWidth: 15,
    headHeight: 15,
    tailWidth: 4
  };
  const labelOptions = {
    font: new PhetFont( 14 ),
    maxWidth: maxWidth
  };
  const checkboxOptions = {

  };
  const checkboxSpacing = 5;

  class DisplayOptionsNode extends VBox {
    /**
     * @param {DensityBuoyancyModel} model
     * @param {Object} [options]
     */
    constructor( model, options ) {

      options = merge( {
        spacing: 10,
        align: 'left'
      }, options );

      const forceAlignGroup = new AlignGroup();

      const forcesText = new Text( forcesString, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: maxWidth
      } );

      const gravityNode = new HBox( {
        spacing: arrowSpacing,
        children: [
          new AlignBox( new Checkbox( new Text( gravityString, labelOptions ), model.showGravityForceProperty, checkboxOptions ), {
            group: forceAlignGroup,
            xAlign: 'left'
          } ),
          new ArrowNode( 0, 0, arrowLength, 0, merge( {
            fill: DensityBuoyancyCommonColorProfile.gravityForceProperty
          }, arrowOptions ) )
        ]
      } );

      const buoyancyNode = new HBox( {
        spacing: arrowSpacing,
        children: [
          new AlignBox( new Checkbox( new Text( buoyancyString, labelOptions ), model.showBuoyancyForceProperty, checkboxOptions ), {
            group: forceAlignGroup,
            xAlign: 'left'
          } ),
          new ArrowNode( 0, 0, arrowLength, 0, merge( {
            fill: DensityBuoyancyCommonColorProfile.buoyancyForceProperty
          }, arrowOptions ) )
        ]
      } );

      const contactNode = new HBox( {
        spacing: arrowSpacing,
        children: [
          new AlignBox( new Checkbox( new Text( contactString, labelOptions ), model.showContactForceProperty, checkboxOptions ), {
            group: forceAlignGroup,
            xAlign: 'left'
          } ),
          new ArrowNode( 0, 0, arrowLength, 0, merge( {
            fill: DensityBuoyancyCommonColorProfile.contactForceProperty
          }, arrowOptions ) )
        ]
      } );

      const massesNode = new Checkbox( new Text( massesString, labelOptions ), model.showMassesProperty, checkboxOptions );
      const forceValuesNode = new Checkbox( new Text( forceValuesString, labelOptions ), model.showForceValuesProperty, checkboxOptions );

      const separator = new Line( 0, 0, Math.max(
        forcesText.width,
        gravityNode.width,
        buoyancyNode.width,
        contactNode.width,
        massesNode.width,
        forceValuesNode.width
      ), 0, {
        stroke: 'gray'
      } );

      options.children = [
        forcesText,
        new VBox( {
          spacing: 8,
          align: 'left',
          children: [
            new VBox( {
              spacing: checkboxSpacing,
              align: 'left',
              children: [
                gravityNode,
                buoyancyNode,
                contactNode
              ]
            } ),
            separator,
            new VBox( {
              spacing: checkboxSpacing,
              align: 'left',
              children: [
                massesNode,
                forceValuesNode
              ]
            } )
          ]
        } )
      ];

      super( options );
    }
  }

  return densityBuoyancyCommon.register( 'DisplayOptionsNode', DisplayOptionsNode );
} );
