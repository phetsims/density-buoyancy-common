// Copyright 2019-2024, University of Colorado Boulder

/**
 * An AccordionBox that displays the percentage of each material that is submerged.
 *
 * @author Agustín Vallejo
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utils from '../../../../dot/js/Utils.js';
import ReadoutListAccordionBox, { ReadoutData, ReadoutListAccordionBoxOptions } from './ReadoutListAccordionBox.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

type DensityReadoutType = TReadOnlyProperty<Material>;

type ParentOptions = ReadoutListAccordionBoxOptions<DensityReadoutType>;
type SelfOptions = EmptySelfOptions;
type DensityAccordionBoxOptions = SelfOptions & ParentOptions;

export default class DensityAccordionBox extends ReadoutListAccordionBox<DensityReadoutType> {

  public constructor( providedOptions?: DensityAccordionBoxOptions ) {

    const options = optionize<DensityAccordionBoxOptions, SelfOptions, ParentOptions>()( {
      expandedDefaultValue: false
    }, providedOptions );

    super( DensityBuoyancyCommonStrings.densityStringProperty, options );
  }

  public override generateReadoutData( materialProperty: DensityReadoutType ): ReadoutData {

    // Use DynamicProperty so that this name is updated based on the material AND material's name changing.
    const nameProperty = new DynamicProperty<string, string, Material>( materialProperty, {
      derive: material => material.nameProperty
    } );

    // Returns the filled in string for the material readout or '?' if the material is hidden
    const valueProperty = new DerivedStringProperty(
      [
        materialProperty,
        DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY,
        DensityBuoyancyCommonStrings.questionMarkStringProperty
      ],
      ( material, patternStringProperty, questionMarkString ) => {
        return material.hidden ?
               questionMarkString :
               StringUtils.fillIn( patternStringProperty, {
                 value: Utils.toFixed( material.density / 1000, 2 ),
                 decimalPlaces: 2
               } );
      } );


    this.cleanupEmitter.addListener( () => {
      nameProperty.dispose();
      valueProperty.dispose();
    } );

    return {
      nameProperty: nameProperty,
      valueProperty: valueProperty
    };
  }
}

densityBuoyancyCommon.register( 'DensityAccordionBox', DensityAccordionBox );