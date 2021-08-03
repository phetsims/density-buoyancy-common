// Copyright 2020-2021, University of Colorado Boulder

/**
 * Mix-in for modal Density/Buoyancy models, where callbacks will create/position masses for each mode.
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
     * @param {Tandem} tandem
     * @param {function(Mode):Array.<Mass>} createMassesCallback - Creates masses (when given a mode)
     * @param {function(Mode):Array.<Mass>} regenerateMassesCallback - Regenerate masses (when given a mode)
     * @param {function(Mode,Array.<Mass>)} positionMassesCallback - Positions masses (for a given mode)
     * @param {*} ...args
     */
    constructor( tandem, createMassesCallback, regenerateMassesCallback, positionMassesCallback, ...args ) {
      super( ...args );

      // @public {Property.<Mode>}
      this.modeProperty = new EnumerationProperty( Mode, initialMode, {
        tandem: tandem.createTandem( 'modeProperty' )
      } );

      // @private
      this.createMassesCallback = createMassesCallback;
      this.regenerateMassesCallback = regenerateMassesCallback;
      this.positionMassesCallback = positionMassesCallback;

      // @private {Object.<Mode,Array.<Mass>>}
      this.modeToMassesMap = {};

      // Create and position masses on startup
      Mode.VALUES.forEach( mode => {
        this.modeToMassesMap[ mode ] = this.createMassesCallback( this, mode );

        // Make them invisible by default, they will be made visible when their mode is up
        this.modeToMassesMap[ mode ].forEach( mass => {
          mass.visibleProperty.value = false;
          this.availableMasses.push( mass );
        } );

        this.positionMasses( mode );
      } );

      this.modeProperty.link( ( mode, oldMode ) => {
        if ( oldMode ) {
          this.modeToMassesMap[ oldMode ].forEach( mass => {
            mass.visibleProperty.value = false;
          } );
        }
        this.modeToMassesMap[ mode ].forEach( mass => {
          mass.visibleProperty.value = true;
        } );
      } );
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
      this.regenerateMassesCallback( this, mode, this.modeToMassesMap[ mode ] );
      this.positionMasses( mode );
    }

    /**
     * Resets values to their original state
     * @public
     * @override
     */
    reset() {
      this.modeProperty.reset();

      // Reset every available mass.
      Mode.VALUES.forEach( mode => this.modeToMassesMap[ mode ].forEach( mass => mass.reset() ) );

      super.reset();

      // Reposition AFTER the reset
      Mode.VALUES.forEach( mode => this.positionMasses( mode ) );
    }
  };
};

densityBuoyancyCommon.register( 'DensityBuoyancyModal', DensityBuoyancyModal );
export default DensityBuoyancyModal;