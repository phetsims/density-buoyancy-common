// Copyright 2019-2020, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import inheritance from '../../../../phet-core/js/inheritance.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

/**
 * @param {constructor} type - Should be a DensityBuoyancyModel-based type
 * @param {Enumeration} Mode - A mode Enumeration
 */
const DensityBuoyancyModal = ( type, Mode ) => {
  assert && assert( _.includes( inheritance( type ), DensityBuoyancyModel ), 'Only DensityBuoyancyModel subtypes should mix DensityBuoyancyModal' );

  return class extends type {
    /**
     * @param {function(Mode):Array.<Mass>} createMasses
     * @param {function(Mode,Array.<Mass>)} positionMasses
     * @param {*} ...args
     */
    constructor( createMasses, positionMasses, ...args ) {
      super( ...args );

      // @public {Property.<Mode>}
      this.modeProperty = new Property( Mode.SAME_MASS );

      // @private
      this.positionMasses = positionMasses;

      // @private {Object.<Mode,Array.<Mass>>}
      this.modeToMassesMap = {};

      Mode.VALUES.forEach( mode => {
        this.modeToMassesMap[ mode ] = createMasses( this, mode );
        positionMasses( this, mode, this.modeToMassesMap[ mode ] );
      } );

      this.modeProperty.link( ( mode, oldMode ) => {
        if ( oldMode ) {
          this.modeToMassesMap[ oldMode ].forEach( mass => this.masses.remove( mass ) );
        }
        this.modeToMassesMap[ mode ].forEach( mass => this.masses.push( mass ) );
      } );
    }

    /**
     * Resets values to their original state
     * @public
     * @override
     */
    reset() {
      this.modeProperty.reset();

      Mode.VALUES.forEach( mode => this.modeToMassesMap[ mode ].forEach( mass => mass.reset() ) );

      super.reset();

      Mode.VALUES.forEach( mode => this.positionMasses( this, mode, this.modeToMassesMap[ mode ] ) );
    }
  };
};

densityBuoyancyCommon.register( 'DensityBuoyancyModal', DensityBuoyancyModal );
export default DensityBuoyancyModal;