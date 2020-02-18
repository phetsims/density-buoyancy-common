// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityBuoyancyCommonConstants = require( 'DENSITY_BUOYANCY_COMMON/common/DensityBuoyancyCommonConstants' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NodeTexture = require( 'MOBIUS/NodeTexture' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const kilogramsPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPattern' );
  const primaryMassLabelString = require( 'string!DENSITY_BUOYANCY_COMMON/primaryMassLabel' );
  const secondaryMassLabelString = require( 'string!DENSITY_BUOYANCY_COMMON/secondaryMassLabel' );

  // constants
  const MASS_LABEL_SIZE = 32;
  const createMassLabel = ( string, fill ) => {
    const rectangle = new Rectangle( 0, 0, MASS_LABEL_SIZE, MASS_LABEL_SIZE, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      fill: fill
    } );
    const label = new Text( string, {
      font: new PhetFont( { size: 24, weight: 'bold' } ),
      fill: 'white',
      center: rectangle.center,
      maxWidth: 30
    } );
    rectangle.addChild( label );
    return rectangle;
  };
  const PRIMARY_LABEL = createMassLabel( primaryMassLabelString, DensityBuoyancyCommonColorProfile.labelAProperty );
  const SECONDARY_LABEL = createMassLabel( secondaryMassLabelString, DensityBuoyancyCommonColorProfile.labelBProperty );

  class MassLabelNode extends Node {
    /**
     * @param {Mass} mass
     * @param {Property.<boolean>} showMassesProperty
     */
    constructor( mass, showMassesProperty ) {
      super();

      const readoutText = new Text( '', {
        font: new PhetFont( {
          size: 18
        } )
      } );
      const readoutPanel = new Panel( readoutText, {
        cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
        xMargin: 4,
        yMargin: 4
      } );

      this.addChild( readoutPanel );

      // @private {Mass}
      this.mass = mass;

      // @private {Property.<boolean>}
      this.showMassesProperty = showMassesProperty;

      // @private {function(number)}
      this.massListener = mass => {
        readoutText.text = StringUtils.fillIn( kilogramsPatternString, {
          kilograms: Utils.toFixed( mass, 2 )
        } );
        readoutPanel.center = Vector2.ZERO;
      };

      // @private {function(boolean)}
      this.showMassesListener = shown => {
        readoutPanel.visible = shown;
      };

      this.mass.massProperty.link( this.massListener );
      this.showMassesProperty.link( this.showMassesListener );
    }

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose() {
      this.showMassesProperty.unlink( this.showMassesListener );
      this.mass.massProperty.unlink( this.massListener );

      super.dispose();
    }

    /**
     * Returns a NodeTexture for a given label node.
     * @private
     *
     * @param {Node} labelNode
     * @returns {NodeTexture}
     */
    static getLabelTexture( labelNode ) {
      const scaledNode = new Node( {
        children: [ labelNode ],
        scale: 2
      } );
      return new NodeTexture( scaledNode, Math.ceil( scaledNode.width ), Math.ceil( scaledNode.height ) );
    }

    /**
     * Returns a NodeTexture for the primary.
     * @public
     *
     * @returns {NodeTexture}
     */
    static getPrimaryTexture() {
      return MassLabelNode.getLabelTexture( PRIMARY_LABEL );
    }

    /**
     * Returns a NodeTexture for the secondary.
     * @public
     *
     * @returns {NodeTexture}
     */
    static getSecondaryTexture() {
      return MassLabelNode.getLabelTexture( SECONDARY_LABEL );
    }
  }

  // @public {Node}
  MassLabelNode.PRIMARY_LABEL = PRIMARY_LABEL;
  MassLabelNode.SECONDARY_LABEL = SECONDARY_LABEL;

  return densityBuoyancyCommon.register( 'MassLabelNode', MassLabelNode );
} );
