// Copyright 2022, University of Colorado Boulder

/**
 * Mass shape for the Buoyancy Shapes screen. In the common model because some phet-io hackery is needed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export class MassShape extends EnumerationValue {
  public static BLOCK = new MassShape();
  public static ELLIPSOID = new MassShape();
  public static VERTICAL_CYLINDER = new MassShape();
  public static HORIZONTAL_CYLINDER = new MassShape();
  public static CONE = new MassShape();
  public static INVERTED_CONE = new MassShape();

  public static enumeration = new Enumeration( MassShape, {
    phetioDocumentation: 'Shape of the mass'
  } );
}

densityBuoyancyCommon.register( 'MassShape', MassShape );
