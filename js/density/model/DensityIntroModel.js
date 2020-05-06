// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

class DensityIntroModel extends DensityBuoyancyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem, {
      constraintMaxX: 0.45,
      showMassesDefault: true
    } );

    // @public {Property.<boolean>}
    this.secondaryMassVisibleProperty = new BooleanProperty( false );

    // @public {Mass}
    this.primaryMass = Cuboid.createWithMass( this.engine, Material.WOOD, new Vector2( -0.2, 0.2 ), 2, {
      tag: Mass.MassTag.PRIMARY
    } );
    this.secondaryMass = Cuboid.createWithMass( this.engine, Material.ALUMINUM, new Vector2( -0.2, 0.35 ), 13.5, {
      tag: Mass.MassTag.SECONDARY
    } );

    this.masses.push( this.primaryMass );

    this.secondaryMassVisibleProperty.lazyLink( secondaryMassVisible => {
      if ( secondaryMassVisible ) {
        this.masses.push( this.secondaryMass );
      }
      else {
        this.masses.remove( this.secondaryMass );
      }
    } );

    // @public {Property.<boolean>}
    this.densityReadoutExpandedProperty = new BooleanProperty( false );
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.secondaryMassVisibleProperty.reset();

    this.primaryMass.reset();
    this.secondaryMass.reset();

    this.densityReadoutExpandedProperty.reset();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'DensityIntroModel', DensityIntroModel );
export default DensityIntroModel;