// Copyright 2019-2024, University of Colorado Boulder

/**
 * A label shown in front of a mass that shows its mass-value. This is not to be confused with a label for the name of
 * the mass (see MassTagNode).
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { ManualConstraint, Node, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Mass from '../model/Mass.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utils from '../../../../dot/js/Utils.js';

export default class MassLabelNode extends Node {

  private readonly mass: Mass;
  private readonly showMassValuesProperty: TReadOnlyProperty<boolean>;
  private readonly showMassesListener: ( n: boolean ) => void;
  private readonly readoutStringProperty: TReadOnlyProperty<string>;

  public constructor( mass: Mass, showMassValuesProperty: TReadOnlyProperty<boolean> ) {
    super( {
      pickable: false
    } );

    this.readoutStringProperty = new DerivedProperty(
      [
        mass.materialProperty,
        mass.volumeProperty,
        DensityBuoyancyCommonStrings.kilogramsPatternStringProperty,
        DensityBuoyancyCommonStrings.questionMarkStringProperty
      ],
      (
        material,
        volume,
        patternStringProperty,
        questionMarkString
      ) => {
        return material.hidden ?
               questionMarkString :
               StringUtils.fillIn( patternStringProperty, {
                 // Deriving the mass instead of using massProperty to avoid including the contained mass, for the case of the boat
                 kilograms: Utils.toFixed( volume * material.density, 2 ),
                 decimalPlaces: 2
               } );
      } );

    const readoutText = new Text( this.readoutStringProperty, {
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
    this.showMassValuesProperty = showMassValuesProperty;

    // Keep it centered
    ManualConstraint.create( this, [ readoutPanel ], readoutWrapper => {
      readoutWrapper.center = Vector2.ZERO;
    } );

    this.showMassesListener = shown => {
      readoutPanel.visible = shown;
    };

    this.showMassValuesProperty.link( this.showMassesListener );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.showMassValuesProperty.unlink( this.showMassesListener );
    this.readoutStringProperty.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'MassLabelNode', MassLabelNode );