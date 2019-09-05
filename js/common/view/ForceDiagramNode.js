// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );

  // strings
  const newtonsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/newtonsPattern' );

  // constants
  const arrowOptions = {
    stroke: null,
    tailWidth: 4,
    headWidth: 15,
    headHeight: 12
  };
  const forceScale = 7;
  const arrowSpacing = arrowOptions.headWidth + 3;
  const labelFont = new PhetFont( { size: 12, weight: 'bold' } );

  class ForceDiagramNode extends Node {
    /**
     * @param {Mass} mass
     * @param {Property.<boolean>} showGravityForceProperty
     * @param {Property.<boolean>} showBuoyancyForceProperty
     * @param {Property.<boolean>} showContactForceProperty
     * @param {Property.<boolean>} showForceValuesProperty
     */
    constructor( mass, showGravityForceProperty, showBuoyancyForceProperty, showContactForceProperty, showForceValuesProperty ) {
      super();

      // @public {Mass}
      this.mass = mass;

      // @private {Property.<boolean>}
      this.showGravityForceProperty = showGravityForceProperty;
      this.showBuoyancyForceProperty = showBuoyancyForceProperty;
      this.showContactForceProperty = showContactForceProperty;
      this.showForceValuesProperty = showForceValuesProperty;

      // @private {ArrowNode}
      this.gravityArrowNode = new ArrowNode( 0, 0, 0, 0, _.extend( {
        fill: DensityBuoyancyCommonColorProfile.gravityForceProperty
      }, arrowOptions ) );
      this.buoyancyArrowNode = new ArrowNode( 0, 0, 0, 0, _.extend( {
        fill: DensityBuoyancyCommonColorProfile.buoyancyForceProperty
      }, arrowOptions ) );
      this.contactArrowNode = new ArrowNode( 0, 0, 0, 0, _.extend( {
        fill: DensityBuoyancyCommonColorProfile.contactForceProperty
      }, arrowOptions ) );

      // @private {Text}
      this.gravityLabelText = new Text( '', {
        font: labelFont,
        fill: DensityBuoyancyCommonColorProfile.gravityForceProperty
      } );
      this.buoyancyLabelText = new Text( '', {
        font: labelFont,
        fill: DensityBuoyancyCommonColorProfile.buoyancyForceProperty
      } );
      this.contactLabelText = new Text( '', {
        font: labelFont,
        fill: DensityBuoyancyCommonColorProfile.contactForceProperty
      } );

      const panelOptions = {
        stroke: null,
        fill: DensityBuoyancyCommonColorProfile.massLabelBackgroundProperty,
        cornerRadius: 0,
        xMargin: 2,
        yMargin: 1
      };

      // @private {Node}
      this.gravityLabelNode = new Panel( this.gravityLabelText, panelOptions );
      this.buoyancyLabelNode = new Panel( this.buoyancyLabelText, panelOptions );
      this.contactLabelNode = new Panel( this.contactLabelText, panelOptions );

      // Set up references
      this.gravityArrowNode.label = this.gravityLabelNode;
      this.buoyancyArrowNode.label = this.buoyancyLabelNode;
      this.contactArrowNode.label = this.contactLabelNode;

      // @private {Line}
      this.axisNode = new Line( {
        stroke: 'black'
      } );
    }

    /**
     * Updates the displayed view.
     */
    update() {
      const upwardArrows = [];
      const downwardArrows = [];
      const labels = [];

      const updateArrow = ( forceProperty, showForceProperty, arrowNode, textNode, labelNode ) => {
        const y = forceProperty.value.y;
        if ( showForceProperty.value && Math.abs( y ) > 1e-5 ) {
          arrowNode.setTip( 0, -y * forceScale );
          ( y > 0 ? upwardArrows : downwardArrows ).push( arrowNode );

          if ( this.showForceValuesProperty.value ) {
            textNode.text = StringUtils.fillIn( newtonsPatternString, {
              newtons: Util.toFixed( forceProperty.value.magnitude, 2 )
            } );
            labels.push( labelNode );
          }
        }
      };

      // Documentation specifies that contact force should always be on the left if there are conflicts
      updateArrow( this.mass.contactForceProperty, this.showContactForceProperty, this.contactArrowNode, this.contactLabelText, this.contactLabelNode );
      updateArrow( this.mass.gravityForceProperty, this.showGravityForceProperty, this.gravityArrowNode, this.gravityLabelText, this.gravityLabelNode );
      updateArrow( this.mass.buoyancyForceProperty, this.showBuoyancyForceProperty, this.buoyancyArrowNode, this.buoyancyLabelText, this.buoyancyLabelNode );

      this.children = [
        ...upwardArrows,
        ...downwardArrows,
        ...( upwardArrows.length + downwardArrows.length > 0 ? [ this.axisNode ] : [] ),
        ...labels
      ];

      const positionArrow = ( array, index, isUp ) => {
        const arrow = array[ index ];
        arrow.x = ( index - ( array.length - 1 ) / 2 ) * arrowSpacing;
        if ( this.showForceValuesProperty.value ) {
          if ( isUp ) {
            arrow.label.bottom = -2;
          }
          else {
            arrow.label.top = 2;
          }
          if ( index + 1 < array.length ) {
            arrow.label.right = arrow.left - 2;
          }
          else {
            arrow.label.left = arrow.right + 2;
          }
        }
      };

      // Layout arrows with spacing
      for ( let i = 0; i < upwardArrows.length; i++ ) {
        positionArrow( upwardArrows, i, true );
      }
      for ( let i = 0; i < downwardArrows.length; i++ ) {
        positionArrow( downwardArrows, i, false );
      }

      const axisHalfWidth = Math.max( upwardArrows.length, downwardArrows.length ) * 10 - 5;
      this.axisNode.x1 = -axisHalfWidth;
      this.axisNode.x2 = axisHalfWidth;
    }
  }

  return densityBuoyancyCommon.register( 'ForceDiagramNode', ForceDiagramNode );
} );
