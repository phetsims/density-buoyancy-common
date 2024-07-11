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
import NumberProperty from '../../../../axon/js/NumberProperty.js';

type SelfOptions = {
  mysteryMaterials: Material[]; // Provide empty list to opt out.
};

export type BlockControlNodeOptions = MaterialMassVolumeControlNodeOptions & SelfOptions;

export default class BlockControlNode extends MaterialMassVolumeControlNode {
  public constructor( cuboid: Cuboid, listParent: Node, numberControlMassPropertyFeatured: boolean, options: BlockControlNodeOptions ) {

    // Add mystery materials at the end. Note custom will appear before mystery materials. This is handled
    // by the supertype, see https://github.com/phetsims/density-buoyancy-common/issues/161
    const materials = Material.SIMPLE_MASS_MATERIALS.concat( options.mysteryMaterials );

    super( cuboid.materialProperty, cuboid.massProperty, cuboid.volumeProperty, materials,
      cubicMeters => cuboid.updateSize( Cube.boundsFromVolume( cubicMeters ) ), listParent, numberControlMassPropertyFeatured, options );

    if ( options.useDensityControlInsteadOfMassControl ) {

      assert && assert( cuboid.adjustableMaterial, 'useDensityControlInsteadOfMassControl should only be used with adjustable materials' );

      const densityNumberControlTandem = options.tandem.createTandem( 'densityNumberControl' );

      // TODO: Lots of work needed here, https://github.com/phetsims/density-buoyancy-common/issues/256
      // TODO: Manually set material to custom when this property changes? https://github.com/phetsims/density-buoyancy-common/issues/256
      const customDensityProperty = new NumberProperty( 1000, {} );

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