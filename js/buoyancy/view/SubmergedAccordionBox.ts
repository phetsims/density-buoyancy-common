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
import ReadoutListAccordionBox, { CustomReadoutObject, ReadoutListAccordionBoxOptions } from './ReadoutListAccordionBox.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';

export default class SubmergedAccordionBox extends ReadoutListAccordionBox {

  public constructor(
    private readonly gravityProperty: TReadOnlyProperty<Gravity>,
    private readonly liquidMaterialProperty: TReadOnlyProperty<Material>,
    providedOptions?: ReadoutListAccordionBoxOptions
  ) {

    const options = combineOptions<ReadoutListAccordionBoxOptions>( {
      visibleProperty: DensityBuoyancyCommonPreferences.percentageSubmergedVisibleProperty
    }, providedOptions );

    super( DensityBuoyancyCommonStrings.percentSubmergedStringProperty, options );
  }

  public override generateReadout( customObject: CustomReadoutObject ): {
    nameProperty: TReadOnlyProperty<string>;
    valueProperty: TReadOnlyProperty<string>;
  } {
    const mass = customObject.mass!;
    assert && assert( mass, 'Mass should be defined' );

    return {
      nameProperty: customObject.customNameProperty ? customObject.customNameProperty : mass.nameProperty,
      valueProperty: new DerivedProperty(
        [
          mass.volumeProperty,
          mass.buoyancyForceInterpolatedProperty,
          this.gravityProperty,
          this.liquidMaterialProperty
        ], ( volume, buoyancy, gravity, liquid ) => {
          return Utils.toFixed( 100 * buoyancy?.magnitude / ( volume * gravity.value * liquid.density ), 1 ) + '%';
        } )
    };
  }


  public override dispose(): void {
    this.cleanupEmitter.emit();
    super.dispose();
  }
}

densityBuoyancyCommon.register( 'SubmergedAccordionBox', SubmergedAccordionBox );
