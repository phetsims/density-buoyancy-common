// Copyright 2022-2024, University of Colorado Boulder

/**
 * Determines the mode difference between one block and two blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import LocalizedStringProperty from '../../../../chipper/js/LocalizedStringProperty.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';

export default class BlockSet extends EnumerationValue {
  public static readonly SAME_MASS = new BlockSet( DensityBuoyancyCommonStrings.blockSet.sameMassStringProperty, 'sameMass' );
  public static readonly SAME_VOLUME = new BlockSet( DensityBuoyancyCommonStrings.blockSet.sameVolumeStringProperty, 'sameVolume' );
  public static readonly SAME_DENSITY = new BlockSet( DensityBuoyancyCommonStrings.blockSet.sameDensityStringProperty, 'sameDensity' );

  public constructor( public readonly stringProperty: LocalizedStringProperty, public readonly tandemName: string ) {
    super();
  }

  public static readonly enumeration = new Enumeration( BlockSet, {
    phetioDocumentation: 'Block set'
  } );

}

densityBuoyancyCommon.register( 'BlockSet', BlockSet );