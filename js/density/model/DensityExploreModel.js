// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main model for the Explore screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class DensityExploreModel extends DensityBuoyancyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem, {
      showMassesDefault: true,
      canShowForces: false
    } );

    // @public {Mass}
    this.primaryMass = Cuboid.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: Mass.MassTag.PRIMARY,
      tandem: tandem.createTandem( 'primaryMass' )
    } );
    this.availableMasses.push( this.primaryMass );
    this.secondaryMass = Cuboid.createWithMass( this.engine, Material.ALUMINUM, new Vector2( -0.2, 0.35 ), 13.5, {
      tag: Mass.MassTag.SECONDARY,
      tandem: tandem.createTandem( 'secondaryMass' ),
      visible: false
    } );
    this.availableMasses.push( this.secondaryMass );

    // @public {Property.<boolean>}
    this.densityReadoutExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'densityReadoutExpandedProperty' )
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

    this.densityReadoutExpandedProperty.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'DensityExploreModel', DensityExploreModel );
export default DensityExploreModel;