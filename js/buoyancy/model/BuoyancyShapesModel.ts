// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main model for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Cone from '../../common/model/Cone.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../common/model/DensityBuoyancyModel.js';
import Ellipsoid from '../../common/model/Ellipsoid.js';
import HorizontalCylinder from '../../common/model/HorizontalCylinder.js';
import Mass from '../../common/model/Mass.js';
import Material from '../../common/model/Material.js';
import Scale, { DisplayType } from '../../common/model/Scale.js';
import TwoBlockMode from '../../common/model/TwoBlockMode.js';
import VerticalCylinder from '../../common/model/VerticalCylinder.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export class MassShape extends EnumerationValue {
  static BLOCK = new MassShape();
  static ELLIPSOID = new MassShape();
  static VERTICAL_CYLINDER = new MassShape();
  static HORIZONTAL_CYLINDER = new MassShape();
  static CONE = new MassShape();
  static INVERTED_CONE = new MassShape();

  static enumeration = new Enumeration( MassShape, {
    phetioDocumentation: 'Shape of the mass'
  } );
}
const MATERIAL = Material.WOOD;
export type BuoyancyShapesModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyShapesModel extends DensityBuoyancyModel {

  modeProperty: Property<TwoBlockMode>;
  secondaryMassVisibleProperty: Property<boolean>;
  densityExpandedProperty: Property<boolean>;
  leftScale: Scale;
  poolScale: Scale;
  primaryShapeProperty: Property<MassShape>;
  secondaryShapeProperty: Property<MassShape>;
  primaryWidthRatioProperty: Property<number>;
  secondaryWidthRatioProperty: Property<number>;
  primaryHeightRatioProperty: Property<number>;
  secondaryHeightRatioProperty: Property<number>;

  primaryMassProperty: Property<Mass>;
  secondaryMassProperty: Property<Mass>;

  constructor( providedOptions: BuoyancyShapesModelOptions ) {
    const options = optionize<DensityBuoyancyModelOptions, {}>()( {
      initialForceScale: 1 / 4
    }, providedOptions );

    const tandem = options.tandem;

    super( options );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: tandem.createTandem( 'modeProperty' )
    } );

    this.secondaryMassVisibleProperty = new BooleanProperty( false );
    this.densityExpandedProperty = new BooleanProperty( false );

    this.leftScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.7, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'leftScale' ),
      canMove: true
    } );
    this.availableMasses.push( this.leftScale );

    this.poolScale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( 0.3, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'poolScale' ),
      canMove: true
    } );
    this.availableMasses.push( this.poolScale );

    // Adjust pool volume so that it's at the desired value WITH the pool scale inside.
    this.pool.liquidVolumeProperty.value -= this.poolScale.volumeProperty.value;
    this.pool.liquidVolumeProperty.setInitialValue( this.pool.liquidVolumeProperty.value );

    this.primaryShapeProperty = new EnumerationProperty( MassShape.BLOCK );
    this.secondaryShapeProperty = new EnumerationProperty( MassShape.INVERTED_CONE );

    this.primaryWidthRatioProperty = new NumberProperty( 0.25 );
    this.secondaryWidthRatioProperty = new NumberProperty( 0.25 );

    this.primaryHeightRatioProperty = new NumberProperty( 0.75 );
    this.secondaryHeightRatioProperty = new NumberProperty( 0.75 );

    const createMass = ( shape: MassShape, widthRatio: number, heightRatio: number, tandem: Tandem ): Mass => {
      switch( shape ) {
        case MassShape.BLOCK:
          return new Cuboid( this.engine, Cuboid.getSizeFromRatios( widthRatio, heightRatio ), {
            material: MATERIAL, tandem: tandem
          } );
        case MassShape.ELLIPSOID:
          return new Ellipsoid( this.engine, Ellipsoid.getSizeFromRatios( widthRatio, heightRatio ), {
            material: MATERIAL, tandem: tandem
          } );
        case MassShape.VERTICAL_CYLINDER:
          return new VerticalCylinder(
            this.engine,
            VerticalCylinder.getRadiusFromRatio( widthRatio ),
            VerticalCylinder.getHeightFromRatio( heightRatio ),
            { material: MATERIAL, tandem: tandem }
          );
        case MassShape.HORIZONTAL_CYLINDER:
          return new HorizontalCylinder(
            this.engine,
            HorizontalCylinder.getRadiusFromRatio( heightRatio ),
            HorizontalCylinder.getLengthFromRatio( widthRatio ),
            { material: MATERIAL, tandem: tandem }
          );
        case MassShape.CONE:
          return new Cone(
            this.engine,
            Cone.getRadiusFromRatio( widthRatio ),
            Cone.getHeightFromRatio( heightRatio ),
            true,
            { material: MATERIAL, tandem: tandem }
          );
        case MassShape.INVERTED_CONE:
          return new Cone(
            this.engine,
            Cone.getRadiusFromRatio( widthRatio ),
            Cone.getHeightFromRatio( heightRatio ),
            false,
            { material: MATERIAL, tandem: tandem }
          );
        default:
          throw new Error( `shape not recognized: ${shape}` );
      }
    };

    const primaryMassTandem = tandem.createTandem( 'primaryMass' );
    const secondaryMassTandem = tandem.createTandem( 'secondaryMass' );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.primaryMassProperty = new DerivedProperty( [ this.primaryShapeProperty ], shape => {
      return createMass( shape, this.primaryWidthRatioProperty.value, this.primaryHeightRatioProperty.value, primaryMassTandem );
    } );
    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.secondaryMassProperty = new DerivedProperty( [ this.secondaryShapeProperty ], shape => {
      return createMass( shape, this.secondaryWidthRatioProperty.value, this.secondaryHeightRatioProperty.value, secondaryMassTandem );
    } );

    Property.lazyMultilink( [ this.primaryWidthRatioProperty, this.primaryHeightRatioProperty ], ( widthRatio, heightRatio ) => {
      this.primaryMassProperty.value.setRatios( widthRatio, heightRatio );
    } );
    Property.lazyMultilink( [ this.secondaryWidthRatioProperty, this.secondaryHeightRatioProperty ], ( widthRatio, heightRatio ) => {
      this.secondaryMassProperty.value.setRatios( widthRatio, heightRatio );
    } );

    // When a new mass is created, set up its position to be that of the old mass
    [ this.primaryMassProperty, this.secondaryMassProperty ].forEach( massProperty => {
      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      massProperty.lazyLink( ( newMass, oldMass ) => {
        newMass.matrix.set( oldMass.matrix );
        newMass.writeData();
        newMass.transformedEmitter.emit();

        if ( this.masses.includes( oldMass ) ) {
          this.masses.remove( oldMass );
          this.masses.add( newMass );
        }

        oldMass.dispose();
      } );
    } );

    this.masses.add( this.primaryMassProperty.value );

    this.modeProperty.link( mode => {
      this.secondaryMassProperty.value.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

    this.setInitialPositions();
  }

  /**
   * Sets up the initial positions of the masses (since some resets may not change the mass).
   */
  private setInitialPositions(): void {
    this.primaryMassProperty.value.matrix.setToTranslation( -0.3, 0 );
    this.primaryMassProperty.value.writeData();
    this.primaryMassProperty.value.transformedEmitter.emit();

    this.secondaryMassProperty.value.matrix.setToTranslation( 0.3, 0 );
    this.secondaryMassProperty.value.writeData();
    this.secondaryMassProperty.value.transformedEmitter.emit();
  }

  /**
   * Resets things to their original values.
   */
  override reset(): void {
    this.modeProperty.reset();

    this.secondaryMassVisibleProperty.reset();
    this.densityExpandedProperty.reset();

    this.primaryShapeProperty.reset();
    this.secondaryShapeProperty.reset();
    this.primaryHeightRatioProperty.reset();
    this.secondaryHeightRatioProperty.reset();
    this.primaryWidthRatioProperty.reset();
    this.secondaryWidthRatioProperty.reset();

    this.setInitialPositions();

    super.reset();
  }
}

densityBuoyancyCommon.register( 'BuoyancyShapesModel', BuoyancyShapesModel );
