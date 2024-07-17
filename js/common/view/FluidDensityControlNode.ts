// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows a combined NumberControl/ComboBox for controlling fluid density.
 *
 * TODO: Changing the fluid density slider on Buoyancy/Explore does not change the actual fluid density. See https://github.com/phetsims/density-buoyancy-common/issues/256
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { GatedVisibleProperty, Node, Text } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import ComboNumberControl, { ComboNumberControlOptions } from './ComboNumberControl.js';
import optionize from '../../../../phet-core/js/optionize.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import MaterialProperty from '../model/MaterialProperty.js';

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
    fluidMaterialProperty: MaterialProperty,
    materials: Material[],
    listParent: Node,
    providedOptions: DensityControlNodeOptions ) {

    const options = optionize<DensityControlNodeOptions, SelfOptions, ParentOptions>()( {
      invisibleMaterials: []
    }, providedOptions );

    assert && assert( _.every( options.invisibleMaterials, invisible => materials.includes( invisible ) ),
      'invisible material must be in full list.' );

    const numberDisplayTandem = options.tandem.createTandem( 'numberDisplay' );

    super( {
      tandem: options.tandem,

      unitsConversionFactor: 1 / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER,
      titleProperty: DensityBuoyancyCommonStrings.fluidDensityStringProperty,
      valuePatternProperty: DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY,
      property: fluidMaterialProperty,
      range: new Range( 0.5, 15 ),
      listParent: listParent,
      comboItems: materials.map( material => {
        return {
          value: material,
          createNode: () => new Text( material.nameProperty, {
            font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
            maxWidth: 160
          } ),
          tandemName: `${material.tandem.name}Item`,
          a11yName: material.nameProperty,
          comboBoxListItemNodeOptions: {
            visible: !options.invisibleMaterials.includes( material )
          }
        };
      } ),
      numberControlOptions: {
        numberDisplayOptions: {
          tandem: numberDisplayTandem,
          visibleProperty: new GatedVisibleProperty(
            new DerivedProperty( [ fluidMaterialProperty ], material => !material.hidden ),
            numberDisplayTandem
          )
        },
        sliderOptions: {
          // Slightly longer, see https://github.com/phetsims/buoyancy/issues/33
          trackSize: new Dimension2( 130, 0.5 ),
          accessibleName: DensityBuoyancyCommonStrings.fluidDensityStringProperty
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