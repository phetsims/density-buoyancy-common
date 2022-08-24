// Copyright 2019-2022, University of Colorado Boulder

/**
 * A label shown in front of a mass that shows its mass-value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { TPaint, ManualConstraint, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Mass from '../model/Mass.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import LabelTexture from './LabelTexture.js';

// constants
const MASS_LABEL_SIZE = 32;
const createMassLabel = ( string: TReadOnlyProperty<string>, fill: TPaint ) => {
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
  label.localBoundsProperty.link( () => {
    label.center = rectangle.center;
  } );
  rectangle.addChild( label );
  return rectangle;
};

const PRIMARY_LABEL_DEPENDENCIES = [ densityBuoyancyCommonStrings.massLabel.primaryProperty, DensityBuoyancyCommonColors.labelAProperty ];
const SECONDARY_LABEL_DEPENDENCIES = [ densityBuoyancyCommonStrings.massLabel.secondaryProperty, DensityBuoyancyCommonColors.labelBProperty ];

const PRIMARY_LABEL = createMassLabel( densityBuoyancyCommonStrings.massLabel.primaryProperty, DensityBuoyancyCommonColors.labelAProperty );
const SECONDARY_LABEL = createMassLabel( densityBuoyancyCommonStrings.massLabel.secondaryProperty, DensityBuoyancyCommonColors.labelBProperty );

export default class MassLabelNode extends Node {

  public readonly mass: Mass;
  private readonly showMassesProperty: TReadOnlyProperty<boolean>;
  private readonly showMassesListener: ( n: boolean ) => void;
  private readonly readoutTextProperty: TReadOnlyProperty<string>;

  public constructor( mass: Mass, showMassesProperty: TReadOnlyProperty<boolean> ) {
    super();

    this.readoutTextProperty = new DerivedProperty( [
      mass.massProperty,
      densityBuoyancyCommonStrings.kilogramsPatternProperty
    ], ( mass, pattern ) => {
      return StringUtils.fillIn( pattern, {
        kilograms: Utils.toFixed( mass, 2 )
      } );
    } );

    const readoutText = new Text( this.readoutTextProperty, {
      font: new PhetFont( {
        size: 18
      } ),
      maxWidth: 70
    } );
    const readoutPanel = new Panel( readoutText, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      xMargin: 4,
      yMargin: 4
    } );

    this.addChild( readoutPanel );

    this.mass = mass;
    this.showMassesProperty = showMassesProperty;

    // Keep it centered
    ManualConstraint.create( this, [ readoutPanel ], readoutWrapper => {
      readoutWrapper.center = Vector2.ZERO;
    } );

    this.showMassesListener = shown => {
      readoutPanel.visible = shown;
    };

    this.showMassesProperty.link( this.showMassesListener );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.showMassesProperty.unlink( this.showMassesListener );
    this.readoutTextProperty.dispose();

    super.dispose();
  }

  /**
   * Returns a NodeTexture for the primary.
   */
  public static getPrimaryTexture(): NodeTexture {
    const texture = new LabelTexture( PRIMARY_LABEL );

    // @ts-ignore
    Multilink.multilink( PRIMARY_LABEL_DEPENDENCIES, () => texture.update() );

    return texture;
  }

  /**
   * Returns a NodeTexture for the secondary.
   */
  public static getSecondaryTexture(): NodeTexture {
    const texture = new LabelTexture( SECONDARY_LABEL );

    // @ts-ignore
    Multilink.multilink( SECONDARY_LABEL_DEPENDENCIES, () => texture.update() );

    return texture;
  }

  /**
   * Returns a basic texture for a given (short) string label.
   */
  public static getBasicLabelTexture( string: string ): NodeTexture {
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

densityBuoyancyCommon.register( 'MassLabelNode', MassLabelNode );
export { PRIMARY_LABEL, SECONDARY_LABEL };
