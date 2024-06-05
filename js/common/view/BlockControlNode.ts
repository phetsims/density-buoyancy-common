// Copyright 2019-2024, University of Colorado Boulder

/**
 * A mass/volume control specifically for blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import MaterialEnumeration from '../model/MaterialEnumeration.js';

type SelfOptions = {
  mysteryMaterials?: Material[];
};

export type BlockControlNodeOptions = MaterialMassVolumeControlNodeOptions & SelfOptions;

export default class BlockControlNode extends MaterialMassVolumeControlNode {
  public constructor( cuboid: Cuboid, listParent: Node, numberControlMassPropertyFeatured: boolean, options: BlockControlNodeOptions ) {

    // Add mystery materials at the end, if provided. Note custom will appear before mystery materials. This is handled
    // elsewhere, see https://github.com/phetsims/density-buoyancy-common/issues/161
    const materials = options.mysteryMaterials ?
                      DensityBuoyancyCommonConstants.SIMPLE_MASS_MATERIALS.concat( options.mysteryMaterials ) :
                      DensityBuoyancyCommonConstants.SIMPLE_MASS_MATERIALS;

    super( cuboid.materialProperty, cuboid.massProperty, cuboid.volumeProperty, materials,
      cubicMeters => cuboid.updateSize( Cube.boundsFromVolume( cubicMeters ) ), listParent, numberControlMassPropertyFeatured, options );

    if ( options.useDensityControlInsteadOfMassControl ) {

      assert && assert( cuboid.adjustableMaterial, 'useDensityControlInsteadOfMassControl should only be used with adjustable materials' );

      const densityNumberControlTandem = options.tandem.createTandem( 'densityNumberControl' );
      const customDensityProperty = cuboid.customDensityProperty!;

      customDensityProperty.lazyLink( () => {
        cuboid.materialEnumProperty!.value = MaterialEnumeration.CUSTOM;
      } );

      const densityAsLitersProperty = new UnitConversionProperty( customDensityProperty, {
        factor: 1 / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER
      } );

      const densityNumberControl = new NumberControl( DensityBuoyancyCommonStrings.densityStringProperty,
        densityAsLitersProperty, new Range( customDensityProperty.range.min / DensityBuoyancyCommonConstants.LITERS_IN_CUBIC_METER, 10 ),
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