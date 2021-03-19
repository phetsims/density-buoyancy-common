// Copyright 2020, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import inheritance from '../../../../phet-core/js/inheritance.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

/**
 * @param {constructor} type - Should be a DensityBuoyancyModel-based type
 * @param {Enumeration} Mode - A mode Enumeration
 * @param {Mode} initialMode - The initial Mode
 */
const DensityBuoyancyModal = ( type, Mode, initialMode ) => {
  assert && assert( _.includes( inheritance( type ), DensityBuoyancyModel ), 'Only DensityBuoyancyModel subtypes should mix DensityBuoyancyModal' );

  return class extends type {
    /**
     * @param {function(Mode):Array.<Mass>} createMassesCallback
     * @param {function(Mode,Array.<Mass>)} positionMassesCallback
     * @param {*} ...args
     */
    constructor( createMassesCallback, positionMassesCallback, ...args ) {
      super( ...args );

      // @public {Property.<Mode>}
      this.modeProperty = new EnumerationProperty( Mode, initialMode );

      // @private
      this.createMassesCallback = createMassesCallback;
      this.positionMassesCallback = positionMassesCallback;

      // @private {Object.<Mode,Array.<Mass>>}
      this.modeToMassesMap = {};

      Mode.VALUES.forEach( mode => {
        this.createMasses( mode );
        this.positionMasses( mode );
      } );

      this.modeProperty.link( ( mode, oldMode ) => {
        if ( oldMode ) {
          this.removeMasses( oldMode );
        }
        this.addMasses( mode );
      } );
    }

    /**
     * Adds masses.
     * @private
     *
     * @param {Mode} mode
     */
    addMasses( mode ) {
      this.modeToMassesMap[ mode ].forEach( mass => this.masses.push( mass ) );
    }

    /**
     * Removes masses.
     * @private
     *
     * @param {Mode} mode
     */
    removeMasses( mode ) {
      this.modeToMassesMap[ mode ].forEach( mass => this.masses.remove( mass ) );
    }

    /**
     * Creates masses.
     * @private
     *
     * @param {Mode} mode
     */
    createMasses( mode ) {
      this.modeToMassesMap[ mode ] = this.createMassesCallback( this, mode );
    }

    /**
     * Positions masses.
     * @private
     *
     * @param {Mode} mode
     */
    positionMasses( mode ) {
      this.positionMassesCallback( this, mode, this.modeToMassesMap[ mode ] );
    }

    /**
     * Regenerates the masses for a specific mode.
     * @public
     *
     * @param {Mode} mode
     */
    regenerate( mode ) {
      if ( this.modeProperty.value === mode ) {
        this.removeMasses( mode );
      }

      this.createMasses( mode );
      this.positionMasses( mode );

      if ( this.modeProperty.value === mode ) {
        this.addMasses( mode );
      }
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

      Mode.VALUES.forEach( mode => this.positionMasses( mode ) );
    }
  };
};

densityBuoyancyCommon.register( 'DensityBuoyancyModal', DensityBuoyancyModal );
export default DensityBuoyancyModal;