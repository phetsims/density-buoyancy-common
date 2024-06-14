// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows a combined NumberControl/ComboBox for controlling liquid density.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import ComboNumberControl, { ComboNumberControlOptions } from './ComboNumberControl.js';
import optionize from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';

type SelfOptions = {

  // A subset of the provided materials that should be invisible on startup. Created for PhET-iO
  // consistency and customization.
  invisibleMaterials?: Material[];
};

// No required super options but tandem
type ParentOptions = WithRequired<Partial<ComboNumberControlOptions<Material>>, 'tandem'>;

type DensityControlNodeOptions = SelfOptions & ParentOptions;

export default class FluidDensityControlNode extends ComboNumberControl<Material> {
  public constructor(
    liquidMaterialProperty: Property<Material>,
    materials: Material[],
    customMaterial: Material, // also appears in the list above
    listParent: Node,
    providedOptions: DensityControlNodeOptions ) {

    const options = optionize<DensityControlNodeOptions, SelfOptions, ParentOptions>()( {
      invisibleMaterials: []
    }, providedOptions );

    assert && assert( _.every( options.invisibleMaterials, invisible => materials.includes( invisible ) ),
      'invisible material must be in full list.' );

    super( {
      tandem: options.tandem,
      titleProperty: DensityBuoyancyCommonStrings.fluidDensityStringProperty,
      valuePatternProperty: DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY,
      property: liquidMaterialProperty,
      range: new Range( 0.5, 15 ),
      toNumericValue: material => material.density / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER,
      createCustomValue: density => Material.createCustomLiquidMaterial( {
        density: density * DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER,
        densityRange: DensityBuoyancyCommonConstants.FLUID_DENSITY_RANGE_PER_M3
      } ),
      isCustomValue: material => material.custom,
      isHiddenValue: material => material.hidden,
      listParent: listParent,
      comboItems: materials.map( material => {
        return {
          value: material,
          createNode: () => new Text( material.nameProperty, {
            font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
            maxWidth: 160
          } ),
          tandemName: `${material.tandemName}Item`,
          a11yName: material.nameProperty,
          comboBoxListItemNodeOptions: {
            visible: !options.invisibleMaterials.includes( material )
          }
        };
      } ),
      customValue: customMaterial,
      numberControlOptions: {
        delta: 0.01,
        sliderOptions: {
          // Slightly longer, see https://github.com/phetsims/buoyancy/issues/33
          trackSize: new Dimension2( 130, 0.5 ),
          accessibleName: DensityBuoyancyCommonStrings.fluidDensityStringProperty
        },
        arrowButtonOptions: {
          scale: DensityBuoyancyCommonConstants.ARROW_BUTTON_SCALE
        }
      },
      comboBoxOptions: {
        listPosition: 'above'
      },
      getFallbackNode: material => {
        if ( material.hidden ) {
          return new Text( DensityBuoyancyCommonStrings.whatIsTheFluidDensityStringProperty, {
            font: new PhetFont( 14 )
          } );
        }
        else {
          return null;
        }
      }
    } );
  }
}

densityBuoyancyCommon.register( 'FluidDensityControlNode', FluidDensityControlNode );