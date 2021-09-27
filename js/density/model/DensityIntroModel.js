// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main model for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Cube from '../../common/model/Cube.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
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

    const blocksTandem = tandem.createTandem( 'blocks' );

    // @public (read-only) {Mass}
    this.primaryMass = Cube.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: Mass.MassTag.PRIMARY,
      tandem: blocksTandem.createTandem( 'blockA' )
    } );
    this.availableMasses.push( this.primaryMass );
    this.secondaryMass = Cube.createWithMass( this.engine, Material.ALUMINUM, new Vector2( -0.2, 0.35 ), 13.5, {
      tag: Mass.MassTag.SECONDARY,
      tandem: blocksTandem.createTandem( 'blockB' ),
      visible: false
    } );
    this.availableMasses.push( this.secondaryMass );

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
    this.primaryMass.reset();
    this.secondaryMass.reset();

    this.densityExpandedProperty.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'DensityIntroModel', DensityIntroModel );
export default DensityIntroModel;