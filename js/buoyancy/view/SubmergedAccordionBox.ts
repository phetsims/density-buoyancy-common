// Copyright 2019-2024, University of Colorado Boulder

/**
 * An AccordionBox that displays the percentage of a material that is submerged in a fluid.
 *
 * @author Agustín Vallejo
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Utils from '../../../../dot/js/Utils.js';
import ReadoutListAccordionBox, { ReadoutData, ReadoutListAccordionBoxOptions } from './ReadoutListAccordionBox.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
import Mass from '../../common/model/Mass.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';

export default class SubmergedAccordionBox extends ReadoutListAccordionBox<Mass> {

  public constructor( providedOptions?: ReadoutListAccordionBoxOptions<Mass> ) {

    const options = combineOptions<ReadoutListAccordionBoxOptions<Mass>>( {
      visibleProperty: DensityBuoyancyCommonPreferences.percentageSubmergedVisibleProperty,
      readoutItems: [],
      expandedDefaultValue: false,

      accessibleName: DensityBuoyancyCommonStrings.percentSubmergedStringProperty
    }, providedOptions );

    super( DensityBuoyancyCommonStrings.percentSubmergedStringProperty, options );
  }

  protected override generateReadoutData( mass: Mass ): ReadoutData {

    const patternStringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.valuePercentStringProperty, {
      value: mass.submergedMassFractionProperty
    }, {
      maps: {
        value: submergedMassFraction => Utils.toFixed( 100 * submergedMassFraction, 1 )
      }
    } );
    this.cleanupEmitter.addListener( () => {
      patternStringProperty.dispose();
    } );

    return {
      nameProperty: mass.nameProperty,
      valueProperty: patternStringProperty
    };
  }
}

densityBuoyancyCommon.register( 'SubmergedAccordionBox', SubmergedAccordionBox );