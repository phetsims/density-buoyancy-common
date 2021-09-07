// Copyright 2020-2021, University of Colorado Boulder

/**
 * Mix-in for modal Density/Buoyancy models, where callbacks will create/position masses for each set.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import inheritance from '../../../../phet-core/js/inheritance.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

/**
 * @param {constructor} type - Should be a DensityBuoyancyModel-based type
 * @param {Enumeration} BlockSet - A blockSet Enumeration
 * @param {BlockSet} initialMode - The initial BlockSet
 */
const BlockSetModel = ( type, BlockSet, initialMode ) => {
  assert && assert( _.includes( inheritance( type ), DensityBuoyancyModel ), 'Only DensityBuoyancyModel subtypes should mix BlockSetModel' );

  return class extends type {
    /**
     * @param {Tandem} tandem
     * @param {function(DensityBuoyancyModel,BlockSet):Array.<Mass>} createMassesCallback - Creates masses (when given a blockSet)
     * @param {function(DensityBuoyancyModel,BlockSet,Array.<Mass>)} regenerateMassesCallback - Regenerate masses (when given a blockSet)
     * @param {function(DensityBuoyancyModel,BlockSet,Array.<Mass>)} positionMassesCallback - Positions masses (for a given blockSet)
     * @param {*} args
     */
    constructor( tandem, createMassesCallback, regenerateMassesCallback, positionMassesCallback, ...args ) {
      super( ...args );

      // @public {Property.<BlockSet>}
      this.blockSetProperty = new EnumerationProperty( BlockSet, initialMode, {
        tandem: tandem.createTandem( 'blockSets' ).createTandem( 'blockSetProperty' )
      } );

      // @private
      this.createMassesCallback = createMassesCallback;
      this.regenerateMassesCallback = regenerateMassesCallback;
      this.positionMassesCallback = positionMassesCallback;

      // @private {Object.<BlockSet,Array.<Mass>>}
      this.blockSetToMassesMap = {};

      // Create and position masses on startup
      BlockSet.VALUES.forEach( blockSet => {
        this.blockSetToMassesMap[ blockSet ] = this.createMassesCallback( this, blockSet );

        // Make them invisible by default, they will be made visible when their blockSet is up
        this.blockSetToMassesMap[ blockSet ].forEach( mass => {
          mass.visibleProperty.value = false;
          this.availableMasses.push( mass );
        } );

        this.positionMasses( blockSet );
      } );

      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      this.blockSetProperty.link( ( blockSet, oldBlockSet ) => {
        if ( oldBlockSet ) {
          this.blockSetToMassesMap[ oldBlockSet ].forEach( mass => {
            mass.visibleProperty.value = false;
          } );
        }
        this.blockSetToMassesMap[ blockSet ].forEach( mass => {
          mass.visibleProperty.value = true;
        } );
      } );
    }

    /**
     * Positions masses.
     * @private
     *
     * @param {Mode} blockSet
     */
    positionMasses( blockSet ) {
      this.positionMassesCallback( this, blockSet, this.blockSetToMassesMap[ blockSet ] );
    }

    /**
     * Regenerates the masses for a specific blockSet.
     * @public
     *
     * @param {Mode} blockSet
     */
    regenerate( blockSet ) {
      this.regenerateMassesCallback( this, blockSet, this.blockSetToMassesMap[ blockSet ] );
      this.positionMasses( blockSet );
    }

    /**
     * Resets values to their original state
     * @public
     * @override
     */
    reset() {
      this.blockSetProperty.reset();

      // Reset every available mass.
      BlockSet.VALUES.forEach( blockSet => this.blockSetToMassesMap[ blockSet ].forEach( mass => mass.reset() ) );

      super.reset();

      // Reposition AFTER the reset
      BlockSet.VALUES.forEach( blockSet => this.positionMasses( blockSet ) );

      // Rehandle visibility, since we reset them
      BlockSet.VALUES.forEach( blockSet => this.blockSetToMassesMap[ blockSet ].forEach( mass => { mass.visibleProperty.value = blockSet === this.blockSetProperty.value; } ) );
    }
  };
};

densityBuoyancyCommon.register( 'BlockSetModel', BlockSetModel );
export default BlockSetModel;