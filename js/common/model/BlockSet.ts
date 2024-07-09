// Copyright 2022-2024, University of Colorado Boulder

/**
 * Determines which variable in the density equation is consistent across all blocks in the scene, see BlockSetModel.
 *
 * This is not the most descriptive name, as this Enumeration is specifically for "same variable" block sets, but we
 * don't want to rename this because of the PhET-iO API concerns.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
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