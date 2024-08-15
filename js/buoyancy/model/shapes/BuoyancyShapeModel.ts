// Copyright 2024, University of Colorado Boulder

/**
 * The main model for a single shape model object in the sim. This manages changing the shape, phet-io, and updating
 * the size of the shape
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Mass from '../../../common/model/Mass.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import { MassShape } from '../../../common/model/MassShape.js';
import MassTag from '../../../common/model/MassTag.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../../tandem/js/PhetioObject.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import BuoyancyShapesModel from './BuoyancyShapesModel.js';
import ReferenceIO from '../../../../../tandem/js/types/ReferenceIO.js';
import Range from '../../../../../dot/js/Range.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';

export type BuoyancyShapeModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default class BuoyancyShapeModel {

  // The currently selected shape, from which the mass changes to this type.
  public readonly shapeNameProperty: Property<MassShape>;
  public readonly widthRatioProperty: Property<number>;
  public readonly heightRatioProperty: Property<number>;

  // A reference to the currently selected Mass based on the shapeName (MassShape).
  public readonly shapeProperty: TReadOnlyProperty<Mass>;

  // Statically initialize all possible Mass instances to simplify phet-io. This is well within a good memory limit, see https://github.com/phetsims/buoyancy/issues/160
  private readonly shapeCacheMap = new Map<MassShape, Mass>();

  public constructor( massShape: MassShape, width: number, height: number, massTag: MassTag, createMass: BuoyancyShapesModel['createMass'], options: BuoyancyShapeModelOptions ) {

    this.shapeNameProperty = new EnumerationProperty( massShape, {
      tandem: options.tandem.createTandem( 'shapeNameProperty' ),
      phetioFeatured: true
    } );

    this.widthRatioProperty = new NumberProperty( width, {
      tandem: options.tandem.createTandem( 'widthRatioProperty' ),
      phetioFeatured: true,
      range: new Range( 0, 1 )
    } );

    this.heightRatioProperty = new NumberProperty( height, {
      tandem: options.tandem.createTandem( 'heightRatioProperty' ),
      phetioFeatured: true,
      range: new Range( 0, 1 )
    } );

    MassShape.enumeration.values.forEach( shape => {
      this.shapeCacheMap.set( shape, createMass(
        options.tandem.createTandem( 'shapes' ).createTandem( shape.tandemName ), shape,
        this.widthRatioProperty.value, this.heightRatioProperty.value, massTag
      ) );
    } );

    // Property doesn't need disposal, since everything here lives for the lifetime of the simulation.
    // Named like this for clarity with PhET-iO naming, do not confuse this with "KITE/Shape" or Mass.shapeProperty.
    // TODO: Why is this phet-io instrumented? see https://github.com/phetsims/density-buoyancy-common/issues/288
    this.shapeProperty = new DerivedProperty( [ this.shapeNameProperty ], shapeName => this.shapeCacheMap.get( shapeName )!, {
      tandem: options.tandem.createTandem( 'shapeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'A reference to the currently selected shape based on the shape name.',
      phetioValueType: ReferenceIO( Mass.MassIO ),
      phetioFeatured: true
    } );

    Multilink.lazyMultilink( [ this.shapeProperty, this.widthRatioProperty, this.heightRatioProperty ], ( mass, widthRatio, heightRatio ) => {
      mass.setRatios( widthRatio, heightRatio );
    } );

    this.shapeProperty.lazyLink( ( newMass, oldMass ) => {

      // Change the shape, keeping the bottom at the same y value
      // Triggering dimension change first
      const minYBefore = oldMass.getBounds().minY;
      this.widthRatioProperty.notifyListenersStatic(); // Triggering dimension change first
      const minYAfter = newMass.getBounds().minY;
      newMass.matrix.multiplyMatrix( Matrix3.translation( 0, minYBefore - minYAfter ) );
      newMass.writeData();
    } );
  }

  public getAllMasses(): Mass[] {
    return Array.from( this.shapeCacheMap.values() );
  }

  public reset(): void {
    this.shapeNameProperty.reset();
    this.heightRatioProperty.reset();
    this.widthRatioProperty.reset();
  }
}


densityBuoyancyCommon.register( 'BuoyancyShapeModel', BuoyancyShapeModel );