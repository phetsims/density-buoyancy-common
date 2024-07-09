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
import TProperty from '../../../../../axon/js/TProperty.js';
import MassTag from '../../../common/model/MassTag.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../../tandem/js/PhetioObject.js';
import BuoyancyShapesModel from './BuoyancyShapesModel.js';

export type BuoyancyShapeModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default class BuoyancyShapeModel {
  public readonly shapeProperty: Property<MassShape>;
  public readonly widthRatioProperty: Property<number>;
  public readonly heightRatioProperty: Property<number>;
  public readonly massProperty: TProperty<Mass>;

  // Statically initialize all possible Mass instances to simplify phet-io. This is well within a good memory limit, see https://github.com/phetsims/buoyancy/issues/160
  private readonly shapeCacheMap = new Map<MassShape, Mass>();

  public constructor( massShape: MassShape, width: number, height: number, massTag: MassTag, createMass: BuoyancyShapesModel['createMass'], options: BuoyancyShapeModelOptions ) {

    this.shapeProperty = new EnumerationProperty( massShape, {
      tandem: options.tandem.createTandem( 'shapeProperty' )
    } );

    this.widthRatioProperty = new NumberProperty( width, {
      tandem: options.tandem.createTandem( 'widthRatioProperty' )
    } );

    this.heightRatioProperty = new NumberProperty( height, {
      tandem: options.tandem.createTandem( 'heightRatioProperty' )
    } );

    MassShape.enumeration.values.forEach( shape => {
      this.shapeCacheMap.set( shape, createMass(
        options.tandem.createTandem( 'shapes' ).createTandem( shape.tandemName ), shape,
        this.widthRatioProperty.value, this.heightRatioProperty.value, massTag
      ) );
    } );

    // Property doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.massProperty = new Property( this.shapeCacheMap.get( this.shapeProperty.value )! );
    this.shapeProperty.link( () => this.changeShape() );

    Multilink.lazyMultilink( [ this.widthRatioProperty, this.heightRatioProperty ], ( widthRatio, heightRatio ) => {
      this.massProperty.value.setRatios( widthRatio, heightRatio );
    } );
  }

  private changeShape(): void {

    // Triggering dimension change first
    const minYBefore = this.massProperty.value.getBounds().minY;
    this.massProperty.value = this.shapeCacheMap.get( this.shapeProperty.value )!;
    this.widthRatioProperty.notifyListenersStatic(); // Triggering dimension change first
    const minYAfter = this.massProperty.value.getBounds().minY;
    this.massProperty.value.matrix.multiplyMatrix( Matrix3.translation( 0, minYBefore - minYAfter ) );
    this.massProperty.value.writeData();
    this.massProperty.value.transformedEmitter.emit();
  }

  public reset(): void {
    this.shapeProperty.reset();
    this.heightRatioProperty.reset();
    this.widthRatioProperty.reset();
  }
}


densityBuoyancyCommon.register( 'BuoyancyShapeModel', BuoyancyShapeModel );