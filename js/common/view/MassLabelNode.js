// Copyright 2019-2020, University of Colorado Boulder

/**
 * A label shown in front of a mass that shows its mass-value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColorProfile from './DensityBuoyancyCommonColorProfile.js';
import LabelTexture from './LabelTexture.js';

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
const PRIMARY_LABEL = createMassLabel( densityBuoyancyCommonStrings.massLabel.primary, DensityBuoyancyCommonColorProfile.labelAProperty );
const SECONDARY_LABEL = createMassLabel( densityBuoyancyCommonStrings.massLabel.secondary, DensityBuoyancyCommonColorProfile.labelBProperty );

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
      } ),
      maxWidth: 200
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
      readoutText.text = StringUtils.fillIn( densityBuoyancyCommonStrings.kilogramsPattern, {
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
   * Returns a NodeTexture for the primary.
   * @public
   *
   * @returns {NodeTexture}
   */
  static getPrimaryTexture() {
    return new LabelTexture( PRIMARY_LABEL );
  }

  /**
   * Returns a NodeTexture for the secondary.
   * @public
   *
   * @returns {NodeTexture}
   */
  static getSecondaryTexture() {
    return new LabelTexture( SECONDARY_LABEL );
  }

  /**
   * Returns a basic texture for a given (short) string label.
   * @public
   *
   * @param {string} string
   * @returns {NodeTexture}
   */
  static getBasicLabelTexture( string ) {
    const label = new Text( string, {
      font: new PhetFont( { size: 24, weight: 'bold' } ),
      maxWidth: 100
    } );
    const rectangle = new Rectangle( 0, 0, label.width + 5, label.height + 3, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      fill: 'white'
    } );
    label.center = rectangle.center;
    rectangle.addChild( label );

    return new LabelTexture( rectangle );
  }
}

// @public {Node}
MassLabelNode.PRIMARY_LABEL = PRIMARY_LABEL;
MassLabelNode.SECONDARY_LABEL = SECONDARY_LABEL;

densityBuoyancyCommon.register( 'MassLabelNode', MassLabelNode );
export default MassLabelNode;