// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import Cone from '../../../common/model/Cone.js';
import Cuboid from '../../../common/model/Cuboid.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../../common/model/DensityBuoyancyModel.js';
import Ellipsoid from '../../../common/model/Ellipsoid.js';
import HorizontalCylinder from '../../../common/model/HorizontalCylinder.js';
import Mass from '../../../common/model/Mass.js';
import Material from '../../../common/model/Material.js';
import Scale, { DisplayType } from '../../../common/model/Scale.js';
import TwoBlockMode from '../../../common/model/TwoBlockMode.js';
import VerticalCylinder from '../../../common/model/VerticalCylinder.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import { MassShape } from '../../../common/model/MassShape.js';
import TProperty from '../../../../../axon/js/TProperty.js';
import isSettingPhetioStateProperty from '../../../../../tandem/js/isSettingPhetioStateProperty.js';
import MassTag from '../../../common/model/MassTag.js';
import Duck from './Duck.js';

export type BuoyancyShapesModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyShapesModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  private readonly scale: Scale;

  // REVIEW: Add a structure like primary:{shapeProperty, widthRatioProperty, heightRatioProperty, massProperty}?
  // REVIEW: This will also help with the studio tree
  public readonly primaryShapeProperty: Property<MassShape>;
  public readonly primaryWidthRatioProperty: Property<number>;
  public readonly primaryHeightRatioProperty: Property<number>;
  public readonly primaryMassProperty: TProperty<Mass>;

  public readonly secondaryShapeProperty: Property<MassShape>;
  public readonly secondaryWidthRatioProperty: Property<number>;
  public readonly secondaryHeightRatioProperty: Property<number>;
  public readonly secondaryMassProperty: TProperty<Mass>;

  public readonly materialProperty: Property<Material>;

  public constructor( options: BuoyancyShapesModelOptions ) {

    super( options );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: options.tandem.createTandem( 'modeProperty' ),
      phetioFeatured: true
    } );

    this.materialProperty = new Property( Material.WOOD, {
      tandem: options.tandem.createTandem( 'materialProperty' ),
      phetioValueType: Material.MaterialIO
    } );

    this.scale = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.7, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: options.tandem.createTandem( 'scale' ),
      canMove: true,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } );
    this.availableMasses.push( this.scale );

    this.primaryShapeProperty = new EnumerationProperty( MassShape.BLOCK, {
      tandem: options.tandem.createTandem( 'primaryShapeProperty' )
    } );
    this.secondaryShapeProperty = new EnumerationProperty( MassShape.INVERTED_CONE, {
      tandem: options.tandem.createTandem( 'secondaryShapeProperty' )
    } );

    this.primaryWidthRatioProperty = new NumberProperty( 0.25, {
      tandem: options.tandem.createTandem( 'primaryWidthRatioProperty' )
    } );
    this.secondaryWidthRatioProperty = new NumberProperty( 0.25, {
      tandem: options.tandem.createTandem( 'secondaryWidthRatioProperty' )
    } );

    this.primaryHeightRatioProperty = new NumberProperty( 0.75, {
      tandem: options.tandem.createTandem( 'primaryHeightRatioProperty' )
    } );
    this.secondaryHeightRatioProperty = new NumberProperty( 0.75, {
      tandem: options.tandem.createTandem( 'secondaryHeightRatioProperty' )
    } );

    const createMass = ( tandem: Tandem, shape: MassShape, widthRatio: number, heightRatio: number, tag: MassTag ): Mass => {
      const massOptions = {
        material: this.materialProperty.value,
        minVolume: 0.0002, // Cones have a smaller volume at min height/width
        maxVolume: Cuboid.MAX_VOLUME, // Cubes are the highest volume object in this screen
        tandem: tandem,
        tag: tag
      };

      let mass: Mass;
      switch( shape ) {
        case MassShape.BLOCK:
          mass = new Cuboid( this.engine, Cuboid.getSizeFromRatios( widthRatio, heightRatio ), massOptions );
          break;
        case MassShape.ELLIPSOID:
          mass = new Ellipsoid( this.engine, Ellipsoid.getSizeFromRatios( widthRatio, heightRatio ), massOptions );
          break;
        case MassShape.VERTICAL_CYLINDER:
          mass = new VerticalCylinder(
            this.engine,
            VerticalCylinder.getRadiusFromRatio( widthRatio ),
            VerticalCylinder.getHeightFromRatio( heightRatio ),
            massOptions
          );
          break;
        case MassShape.HORIZONTAL_CYLINDER:
          mass = new HorizontalCylinder(
            this.engine,
            HorizontalCylinder.getRadiusFromRatio( heightRatio ),
            HorizontalCylinder.getLengthFromRatio( widthRatio ),
            massOptions
          );
          break;
        case MassShape.CONE:
          mass = new Cone(
            this.engine,
            Cone.getRadiusFromRatio( widthRatio ),
            Cone.getHeightFromRatio( heightRatio ),
            true,
            massOptions
          );
          break;
        case MassShape.INVERTED_CONE:
          mass = new Cone(
            this.engine,
            Cone.getRadiusFromRatio( widthRatio ),
            Cone.getHeightFromRatio( heightRatio ),
            false,
            massOptions
          );
          break;
        case MassShape.DUCK:
          mass = new Duck( this.engine, Duck.getSizeFromRatios( widthRatio, heightRatio ), massOptions );
          break;
        default:
          throw new Error( `shape not recognized: ${shape}` );
      }

      this.materialProperty.lazyLink( material => {
        mass.materialProperty.value = material;
      } );
      return mass;
    };

    const objectsTandem = options.tandem.createTandem( 'objects' );

    // Statically initialize all possible Mass instances to simplify phet-io. This is well within a good memory limit, see https://github.com/phetsims/buoyancy/issues/160
    const aMap = new Map<MassShape, Mass>();
    const bMap = new Map<MassShape, Mass>();

    MassShape.enumeration.values.forEach( shape => {

      aMap.set( shape, createMass(
        objectsTandem.createTandem( 'groupA' ).createTandem( shape.tandemName ), shape,
        this.primaryWidthRatioProperty.value, this.primaryHeightRatioProperty.value, MassTag.PRIMARY
      ) );

      bMap.set( shape, createMass(
        objectsTandem.createTandem( 'groupB' ).createTandem( shape.tandemName ), shape,
        this.secondaryWidthRatioProperty.value, this.secondaryHeightRatioProperty.value, MassTag.SECONDARY
      ) );
    } );

    const changeShape = ( massProperty: TProperty<Mass>, shapeMap: Map<MassShape, Mass>, massShape: MassShape, widthProperty: Property<number> ) => { // Triggering dimension change first
      const minYBefore = massProperty.value.getBounds().minY;
      massProperty.value = shapeMap.get( massShape )!;
      widthProperty.notifyListenersStatic(); // Triggering dimension change first
      const minYAfter = massProperty.value.getBounds().minY;
      massProperty.value.matrix.multiplyMatrix( Matrix3.translation( 0, minYBefore - minYAfter ) );
      massProperty.value.writeData();
      massProperty.value.transformedEmitter.emit();
    };

    // Property doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.primaryMassProperty = new Property( aMap.get( this.primaryShapeProperty.value )! );
    this.primaryShapeProperty.link( massShape => {
      changeShape( this.primaryMassProperty, aMap, massShape, this.primaryWidthRatioProperty );
    } );

    // Property doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.secondaryMassProperty = new Property( bMap.get( this.secondaryShapeProperty.value )! );
    this.secondaryShapeProperty.link( massShape => {
      changeShape( this.secondaryMassProperty, bMap, massShape, this.primaryWidthRatioProperty );
    } );

    Multilink.lazyMultilink( [ this.primaryWidthRatioProperty, this.primaryHeightRatioProperty ], ( widthRatio, heightRatio ) => {
      this.primaryMassProperty.value.setRatios( widthRatio, heightRatio );
    } );
    Multilink.lazyMultilink( [ this.secondaryWidthRatioProperty, this.secondaryHeightRatioProperty ], ( widthRatio, heightRatio ) => {
      this.secondaryMassProperty.value.setRatios( widthRatio, heightRatio );
    } );

    // When a new mass is created, set up its position to be that of the old mass
    [ this.primaryMassProperty, this.secondaryMassProperty ].forEach( massProperty => {

      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      massProperty.lazyLink( ( newMass, oldMass ) => {
        if ( !isSettingPhetioStateProperty.value ) {
          newMass.matrix.set( oldMass.matrix );
        }
        newMass.writeData();
        newMass.transformedEmitter.emit();

        if ( this.availableMasses.includes( oldMass ) ) {
          this.availableMasses.remove( oldMass );
          this.availableMasses.add( newMass );
        }
      } );
    } );

    this.availableMasses.add( this.primaryMassProperty.value );
    this.availableMasses.add( this.secondaryMassProperty.value );

    this.modeProperty.link( mode => {
      this.secondaryMassProperty.value.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

    this.setInitialPositions();
  }

  /**
   * Sets up the initial positions of the masses (since some resets may not change the mass).
   */
  private setInitialPositions(): void {
    this.primaryMassProperty.value.matrix.setToTranslation( -0.225, 0 );
    this.primaryMassProperty.value.writeData();
    this.primaryMassProperty.value.transformedEmitter.emit();

    this.secondaryMassProperty.value.matrix.setToTranslation( 0.075, 0 );
    this.secondaryMassProperty.value.writeData();
    this.secondaryMassProperty.value.transformedEmitter.emit();
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {

    this.primaryShapeProperty.reset();
    this.secondaryShapeProperty.reset();
    this.primaryHeightRatioProperty.reset();
    this.secondaryHeightRatioProperty.reset();
    this.primaryWidthRatioProperty.reset();
    this.secondaryWidthRatioProperty.reset();

    // Reset the mode after resetting the secondaryShapeProperty, otherwise the secondary mass will become visible
    // if it changes, see https://github.com/phetsims/density-buoyancy-common/issues/221
    this.modeProperty.reset();

    this.materialProperty.reset();

    super.reset();

    this.setInitialPositions();
  }
}

densityBuoyancyCommon.register( 'BuoyancyShapesModel', BuoyancyShapesModel );