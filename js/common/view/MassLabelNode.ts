// Copyright 2019-2024, University of Colorado Boulder

/**
 * A label shown in front of a mass that shows its mass-value. This is not to be confused with a label for the name of
 * the mass (see MassTagView).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import { DotUtils } from '../../../../dot/js/imports.js';

export default class MassLabelNode extends Node {

  public readonly mass: Mass;
  private readonly showMassesProperty: TReadOnlyProperty<boolean>;
  private readonly showMassesListener: ( n: boolean ) => void;
  private readonly readoutStringProperty: TReadOnlyProperty<string>;

  public constructor( mass: Mass, showMassesProperty: TReadOnlyProperty<boolean> ) {
    super( {
      pickable: false
    } );

    this.readoutStringProperty = new DerivedProperty(
      [ mass.materialProperty, mass.massProperty, DensityBuoyancyCommonStrings.kilogramsPatternStringProperty ],
      ( material, mass, patternStringProperty ) => {
        return material.hidden ?
               '?' :
               StringUtils.fillIn( patternStringProperty, {
                 kilograms: DotUtils.toFixed( mass, 2 ),
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
    this.readoutStringProperty.dispose();

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'MassLabelNode', MassLabelNode );
