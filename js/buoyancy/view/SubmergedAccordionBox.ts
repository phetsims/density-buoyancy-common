// Copyright 2019-2024, University of Colorado Boulder

/**
 * An AccordionBox that displays the percentage of a material that is submerged in a fluid.
 *
 * @author Agustín Vallejo
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Utils from '../../../../dot/js/Utils.js';
import Gravity from '../../common/model/Gravity.js';
import Material from '../../common/model/Material.js';
import ReadoutListAccordionBox, { ReadoutData, ReadoutListAccordionBoxOptions } from './ReadoutListAccordionBox.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
import Mass from '../../common/model/Mass.js';

type SubmergedReadoutType = Mass;

export default class SubmergedAccordionBox extends ReadoutListAccordionBox<SubmergedReadoutType> {

  public constructor(
    private readonly gravityProperty: TReadOnlyProperty<Gravity>,
    private readonly liquidMaterialProperty: TReadOnlyProperty<Material>,
    providedOptions?: ReadoutListAccordionBoxOptions<SubmergedReadoutType>
  ) {

    const options = combineOptions<ReadoutListAccordionBoxOptions<SubmergedReadoutType>>( {
      visibleProperty: DensityBuoyancyCommonPreferences.percentageSubmergedVisibleProperty,
      readoutItems: []
    }, providedOptions );

    super( DensityBuoyancyCommonStrings.percentSubmergedStringProperty, options );
    options.readoutItems && this.setReadoutItems( options.readoutItems );
  }

  public override generateReadoutData( mass: SubmergedReadoutType ): ReadoutData {

    return {
      nameProperty: mass.nameProperty,
      valueProperty: new DerivedProperty(
        [ mass.submergedMassFractionProperty ], submergedMassFraction => {
          return Utils.toFixed( 100 * submergedMassFraction, 1 ) + '%';
        } )
    };
  }

  public override dispose(): void {
    this.cleanupEmitter.emit();
    super.dispose();
  }
}

densityBuoyancyCommon.register( 'SubmergedAccordionBox', SubmergedAccordionBox );
