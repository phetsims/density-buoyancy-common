// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import PhetioCapsule from '../../../../tandem/js/PhetioCapsule.js';
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
import { MassShape } from '../../common/model/MassShape.js';
import TProperty from '../../../../axon/js/TProperty.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import MassTag from '../../common/model/MassTag.js';
import Duck from './Duck.js';

export type BuoyancyShapesModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyShapesModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  public readonly densityExpandedProperty: Property<boolean>;
  public readonly scale1: Scale;
  public readonly primaryShapeProperty: Property<MassShape>;
  public readonly secondaryShapeProperty: Property<MassShape>;
  public readonly primaryWidthRatioProperty: Property<number>;
  public readonly secondaryWidthRatioProperty: Property<number>;
  public readonly primaryHeightRatioProperty: Property<number>;
  public readonly secondaryHeightRatioProperty: Property<number>;

  public readonly materialProperty: Property<Material>;

  public readonly primaryMassProperty: TProperty<Mass>;
  public readonly secondaryMassProperty: TProperty<Mass>;

  public constructor( providedOptions: BuoyancyShapesModelOptions ) {
    const options = optionize<DensityBuoyancyModelOptions, EmptySelfOptions, DensityBuoyancyModelOptions>()( {
      initialForceScale: 1 / 4,
      usePoolScale: true
    }, providedOptions );

    const tandem = options.tandem;

    super( options );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: tandem.createTandem( 'modeProperty' )
    } );

    this.materialProperty = new Property( Material.WOOD, {
      tandem: tandem.createTandem( 'materialProperty' ),
      phetioValueType: Material.MaterialIO
    } );

    this.densityExpandedProperty = new BooleanProperty( false );

    this.scale1 = new Scale( this.engine, this.gravityProperty, {
      matrix: Matrix3.translation( -0.7, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: DisplayType.NEWTONS,
      tandem: tandem.createTandem( 'scale1' ),
      canMove: true,
      inputEnabledPropertyOptions: {
        phetioReadOnly: false
      }
    } );
    this.availableMasses.push( this.scale1 );

    this.primaryShapeProperty = new EnumerationProperty( MassShape.BLOCK, {
      tandem: tandem.createTandem( 'primaryShapeProperty' )
    } );
    this.secondaryShapeProperty = new EnumerationProperty( MassShape.INVERTED_CONE, {
      tandem: tandem.createTandem( 'secondaryShapeProperty' )
    } );

    this.primaryWidthRatioProperty = new NumberProperty( 0.25 );
    this.secondaryWidthRatioProperty = new NumberProperty( 0.25 );

    this.primaryHeightRatioProperty = new NumberProperty( 0.75 );
    this.secondaryHeightRatioProperty = new NumberProperty( 0.75 );

    const createMass = ( tandem: Tandem, shape: MassShape, widthRatio: number, heightRatio: number, tag: MassTag ): Mass => {
      const massOptions = {
        material: this.materialProperty.value,
        tandem: tandem,
        tag: tag,
        phetioDynamicElement: true
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

    const objectsTandem = tandem.createTandem( 'objects' );

    const objectACapsule = new PhetioCapsule(
      ( tandem: Tandem, shape: MassShape ) => createMass( tandem, shape, this.primaryWidthRatioProperty.value, this.primaryHeightRatioProperty.value, MassTag.PRIMARY ),
      [ this.primaryShapeProperty.initialValue ], {
        disposeCreatedOnStateSet: true,
        tandem: objectsTandem.createTandem( 'objectACapsule' ),
        phetioType: PhetioCapsule.PhetioCapsuleIO( Mass.MassIO )
      } );

    const objectBCapsule = new PhetioCapsule(
      ( tandem: Tandem, shape: MassShape ) => createMass( tandem, shape, this.secondaryWidthRatioProperty.value, this.secondaryHeightRatioProperty.value, MassTag.SECONDARY ),
      [ this.secondaryShapeProperty.initialValue ], {
        disposeCreatedOnStateSet: true,
        tandem: objectsTandem.createTandem( 'objectBCapsule' ),
        phetioType: PhetioCapsule.PhetioCapsuleIO( Mass.MassIO )
      } );

    // Property doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.primaryMassProperty = new Property( objectACapsule.getElement( this.primaryShapeProperty.value ) );
    this.primaryShapeProperty.lazyLink( ( massShape: MassShape ) => {
      if ( objectACapsule.hasElement() && !isSettingPhetioStateProperty.value ) {
        objectACapsule.disposeElement();
      }
      this.primaryMassProperty.value = objectACapsule.getElement( massShape );
    } );
    objectACapsule.elementCreatedEmitter.addListener( element => {
      this.primaryMassProperty.value = element;
    } );

    // Property doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.secondaryMassProperty = new Property( objectBCapsule.getElement( this.secondaryShapeProperty.value ) );
    this.secondaryShapeProperty.lazyLink( ( massShape: MassShape ) => {
      if ( objectBCapsule.hasElement() && !isSettingPhetioStateProperty.value ) {
        objectBCapsule.disposeElement();
      }
      this.secondaryMassProperty.value = objectBCapsule.getElement( massShape );
    } );
    objectBCapsule.elementCreatedEmitter.addListener( element => {
      this.secondaryMassProperty.value = element;
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
  public override reset(): void {
    this.modeProperty.reset();

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