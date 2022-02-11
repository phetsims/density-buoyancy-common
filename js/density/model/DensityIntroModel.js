// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import { MassTag } from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import TwoBlockMode from '../../common/model/TwoBlockMode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class DensityIntroModel extends DensityBuoyancyModel {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    const tandem = options.tandem;

    super( merge( {
      showMassesDefault: true,
      canShowForces: false
    }, options ) );
    
    // @public {Property.<Mode>}
    this.modeProperty = new EnumerationDeprecatedProperty( TwoBlockMode, TwoBlockMode.ONE_BLOCK, {
      tandem: tandem.createTandem( 'modeProperty' )
    } );

    const blocksTandem = tandem.createTandem( 'blocks' );

    // @public (read-only) {Mass}
    this.primaryMass = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: MassTag.PRIMARY,
      tandem: blocksTandem.createTandem( 'blockA' )
    } );
    this.availableMasses.push( this.primaryMass );
    this.secondaryMass = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( 0.2, 0.2 ), 13.5, {
      tag: MassTag.SECONDARY,
      tandem: blocksTandem.createTandem( 'blockB' ),
      visible: false
    } );
    this.availableMasses.push( this.secondaryMass );

    this.modeProperty.link( mode => {
      this.secondaryMass.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

    // @public {Property.<boolean>}
    this.densityExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'densityExpandedProperty' )
    } );
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.modeProperty.reset();

    this.primaryMass.reset();
    this.secondaryMass.reset();

    this.densityExpandedProperty.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'DensityIntroModel', DensityIntroModel );
export default DensityIntroModel;