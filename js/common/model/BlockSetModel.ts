// Copyright 2022-2024, University of Colorado Boulder

/**
 * Mix-in for modal Density/Buoyancy models, where callbacks will create/position masses for each set.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid from './Cuboid.js';

type SelfOptions<BlockSetValue extends EnumerationValue> = {

  // Creates masses (when given a blockSet)
  createMassesCallback: ( model: DensityBuoyancyModel, blockSet: BlockSetValue ) => Cuboid[];

  // Regenerate masses (when given a blockSet)
  regenerateMassesCallback: ( model: DensityBuoyancyModel, blockSet: BlockSetValue, masses: Cuboid[] ) => void;

  // Positions masses (for a given blockSet)
  positionMassesCallback: ( model: DensityBuoyancyModel, blockSet: BlockSetValue, masses: Cuboid[] ) => void;

  initialMode: BlockSetValue;
  BlockSet: Enumeration<BlockSetValue>;
};

export type BlockSetModelOptions<BlockSetValue extends EnumerationValue> = SelfOptions<BlockSetValue> & DensityBuoyancyModelOptions;

export default class BlockSetModel<BlockSetValue extends EnumerationValue> extends DensityBuoyancyModel {

  // TODO: https://github.com/phetsims/density-buoyancy-common/issues/123 Why is this capitalized?
  public readonly BlockSet: Enumeration<BlockSetValue>;
  public readonly blockSetProperty: Property<BlockSetValue>;

  private readonly createMassesCallback: ( model: DensityBuoyancyModel, blockSet: BlockSetValue ) => Cuboid[];
  private readonly regenerateMassesCallback: ( model: DensityBuoyancyModel, blockSet: BlockSetValue, masses: Cuboid[] ) => void;
  private readonly positionMassesCallback: ( model: DensityBuoyancyModel, blockSet: BlockSetValue, masses: Cuboid[] ) => void;

  public readonly blockSetToMassesMap: Map<BlockSetValue, Cuboid[]>;

  public constructor( options: BlockSetModelOptions<BlockSetValue> ) {
    super( options );

    this.BlockSet = options.BlockSet;

    const tandem = options.tandem;

    // {Property.<BlockSetValue>}
    this.blockSetProperty = new EnumerationProperty( options.initialMode, {
      tandem: tandem.createTandem( 'blockSets' ).createTandem( 'blockSetProperty' ),
      phetioDocumentation: 'Controls the set of blocks to be displayed',
      phetioFeatured: true
    } );

    this.createMassesCallback = options.createMassesCallback;
    this.regenerateMassesCallback = options.regenerateMassesCallback;
    this.positionMassesCallback = options.positionMassesCallback;

    this.blockSetToMassesMap = new Map<BlockSetValue, Cuboid[]>();

    // Create and position masses on startup
    options.BlockSet.values.forEach( blockSet => {
      this.blockSetToMassesMap.set( blockSet, this.createMassesCallback( this, blockSet ) );

      // Make them invisible by default, they will be made visible when their blockSet is up
      this.blockSetToMassesMap.get( blockSet )!.forEach( mass => {
        mass.internalVisibleProperty.value = false;
        this.availableMasses.push( mass );
      } );

      this.positionMasses( blockSet );
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.blockSetProperty.link( ( blockSet, oldBlockSet ) => {
      if ( oldBlockSet ) {
        this.blockSetToMassesMap.get( oldBlockSet )!.forEach( mass => {
          mass.internalVisibleProperty.value = false;
        } );
      }
      this.blockSetToMassesMap.get( blockSet )!.forEach( mass => {
        mass.internalVisibleProperty.value = true;
      } );
    } );
  }

  /**
   * Positions masses.
   */
  private positionMasses( blockSet: BlockSetValue ): void {
    this.positionMassesCallback( this, blockSet, this.blockSetToMassesMap.get( blockSet )! );
    this.syncPreviousMassPositionsToCurrent();
  }

  /**
   * Regenerates the masses for a specific blockSet.
   */
  public regenerate( blockSet: BlockSetValue ): void {
    this.regenerateMassesCallback( this, blockSet, this.blockSetToMassesMap.get( blockSet )! );
    this.positionMasses( blockSet );
  }

  /**
   * Resets values to their original state
   */
  public override reset(): void {
    this.blockSetProperty.reset();

    // Reset every available mass.
    this.BlockSet.values.forEach( blockSet => this.blockSetToMassesMap.get( blockSet )!.forEach( mass => mass.reset() ) );

    super.reset();

    // Reposition AFTER the reset
    this.BlockSet.values.forEach( blockSet => this.positionMasses( blockSet ) );

    // Update the visibility again since it was reset above
    this.BlockSet.values.forEach( blockSet => this.blockSetToMassesMap.get( blockSet )!.forEach( mass => {
      mass.internalVisibleProperty.value = blockSet === this.blockSetProperty.value;
    } ) );
  }
}

densityBuoyancyCommon.register( 'BlockSetModel', BlockSetModel );