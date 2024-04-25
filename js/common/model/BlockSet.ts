// Copyright 2022-2024, University of Colorado Boulder

/**
 * Determines the mode difference between one block and two blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export class BlockSet extends EnumerationValue {
  public static readonly SAME_MASS = new BlockSet();
  public static readonly SAME_VOLUME = new BlockSet();
  public static readonly SAME_DENSITY = new BlockSet();

  public static readonly enumeration = new Enumeration( BlockSet, {
    phetioDocumentation: 'Block set'
  } );
}

densityBuoyancyCommon.register( 'BlockSet', BlockSet );