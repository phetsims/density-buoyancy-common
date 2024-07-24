// Copyright 2019-2024, University of Colorado Boulder

/**
 * A mass/volume control specifically for blocks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import { Node } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cube from '../model/Cube.js';
import Cuboid from '../model/Cuboid.js';
import MaterialMassVolumeControlNode, { MaterialMassVolumeControlNodeOptions } from './MaterialMassVolumeControlNode.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';
import UnitConversionProperty from '../../../../axon/js/UnitConversionProperty.js';
import Range from '../../../../dot/js/Range.js';

type SelfOptions = {
  mysteryMaterials: Material[]; // Provide empty list to opt out. // TODO AV: delete, https://github.com/phetsims/density-buoyancy-common/issues/270
};

export type BlockControlNodeOptions = MaterialMassVolumeControlNodeOptions & SelfOptions;

export default class BlockControlNode extends MaterialMassVolumeControlNode {
  public constructor( cuboid: Cuboid, listParent: Node, numberControlMassPropertyFeatured: boolean, options: BlockControlNodeOptions ) {

    const materials = cuboid.materialProperty.availableValues;

    // If we have useDensityControlInsteadOfMassControl, we control the logic completely here, and hence do not want the  one-way synchronization in the super.
    if ( assert && options.useDensityControlInsteadOfMassControl ) {
      assert && assert( options.syncCustomMaterialDensity === false );
    }

    super( cuboid.materialProperty, cuboid.massProperty, cuboid.volumeProperty, materials,
      cubicMeters => cuboid.updateSize( Cube.boundsFromVolume( cubicMeters ) ), listParent, numberControlMassPropertyFeatured, options );

    if ( options.useDensityControlInsteadOfMassControl ) {

      const densityNumberControlTandem = options.tandem.createTandem( 'densityNumberControl' );

      const customDensityProperty = cuboid.materialProperty.customMaterial.densityProperty;

      let isChangingToPredefinedMaterialLock = false;

      // When the user changes the density by dragging the slider, automatically switch from the predefined material to
      // the custom material
      customDensityProperty.lazyLink( () => {
        if ( !isChangingToPredefinedMaterialLock ) {
          cuboid.materialProperty.value = cuboid.materialProperty.customMaterial;
        }
      } );

      // In the explore screen, when switching from custom to wood, change the density back to the wood density
      // However, when switching to a mystery material, do not change the custom value. This prevents clever students from discovering
      // the mystery values by using the UI instead of by computing them, see https://github.com/phetsims/buoyancy/issues/54
      cuboid.materialProperty.lazyLink( material => {
        if ( !material.custom && !material.hidden ) {
          isChangingToPredefinedMaterialLock = true;
          customDensityProperty.value = material.density;
          isChangingToPredefinedMaterialLock = false;
        }
      } );

      const densityAsLitersProperty = new UnitConversionProperty( customDensityProperty, {
        factor: 1 / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
      } );

      const densityNumberControl = new NumberControl(
        DensityBuoyancyCommonStrings.densityStringProperty,
        densityAsLitersProperty,
        new Range( customDensityProperty.range.min / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER, 10 ),
        combineOptions<NumberControlOptions>( {
          sliderOptions: {
            accessibleName: DensityBuoyancyCommonStrings.densityStringProperty,
            thumbNode: new PrecisionSliderThumb( {
              tandem: densityNumberControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' ),
              thumbFill: options.color
            } )
          },
          numberDisplayOptions: {
            valuePattern: DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY
          },
          tandem: densityNumberControlTandem
        }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );
      this.densityControlPlaceholderLayer.addChild( densityNumberControl );
    }
  }
}

densityBuoyancyCommon.register( 'BlockControlNode', BlockControlNode );