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
  static BLOCK = new MassShape();
  static ELLIPSOID = new MassShape();
  static VERTICAL_CYLINDER = new MassShape();
  static HORIZONTAL_CYLINDER = new MassShape();
  static CONE = new MassShape();
  static INVERTED_CONE = new MassShape();

  static enumeration = new Enumeration( MassShape, {
    phetioDocumentation: 'Shape of the mass'
  } );
}

densityBuoyancyCommon.register( 'MassShape', MassShape );
