// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main model for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../../axon/js/Property.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import Cuboid from '../../../common/model/Cuboid.js';
import DensityBuoyancyModel, { DensityBuoyancyModelOptions } from '../../../common/model/DensityBuoyancyModel.js';
import HorizontalCylinder from './HorizontalCylinder.js';
import Mass from '../../../common/model/Mass.js';
import Material from '../../../common/model/Material.js';
import Scale, { DisplayType } from '../../../common/model/Scale.js';
import TwoBlockMode from '../../../common/model/TwoBlockMode.js';
import VerticalCylinder from './VerticalCylinder.js';
import densityBuoyancyCommon from '../../../densityBuoyancyCommon.js';
import { MassShape } from '../../../common/model/MassShape.js';
import isSettingPhetioStateProperty from '../../../../../tandem/js/isSettingPhetioStateProperty.js';
import MassTag from '../../../common/model/MassTag.js';
import Duck from './Duck.js';
import BuoyancyShapeModel from './BuoyancyShapeModel.js';
import MaterialProperty from '../../../common/model/MaterialProperty.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import Ellipsoid from './Ellipsoid.js';
import Cone from './Cone.js';

export type BuoyancyShapesModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyShapesModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  private readonly scale: Scale;

  public readonly objectA: BuoyancyShapeModel;
  public readonly objectB: BuoyancyShapeModel;

  public readonly materialProperty: MaterialProperty;
  private readonly availableMaterials: Material[];

  public constructor( providedOptions: BuoyancyShapesModelOptions ) {

    const options = optionize<BuoyancyShapesModelOptions, EmptySelfOptions, DensityBuoyancyModelOptions>()( {
      fluidSelectionType: 'all'
    }, providedOptions );

    super( options );

    const objectsTandem = options.tandem.createTandem( 'objects' );

    this.modeProperty = new EnumerationProperty( TwoBlockMode.ONE_BLOCK, {
      tandem: objectsTandem.createTandem( 'modeProperty' ),
      phetioFeatured: true
    } );

    this.availableMaterials = Material.SIMPLE_MASS_MATERIALS;

    this.materialProperty = new MaterialProperty( Material.WOOD,

      // This hack is a way of saying, we do not create or support a custom material in this case.
      Material.WOOD,
      this.availableMaterials, {
        tandem: objectsTandem.createTandem( 'materialProperty' )
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

    const boundCreateMass = this.createMass.bind( this );

    this.objectA = new BuoyancyShapeModel( MassShape.BLOCK, 0.25, 0.75, MassTag.OBJECT_A, boundCreateMass, {
      tandem: objectsTandem.createTandem( 'objectA' )
    } );

    this.objectB = new BuoyancyShapeModel( MassShape.BLOCK, 0.25, 0.75, MassTag.OBJECT_B, boundCreateMass, {
      tandem: objectsTandem.createTandem( 'objectB' )
    } );

    // When the shape changes, update the location, then update the availableMasses
    [ this.objectA, this.objectB ].forEach( shapeModel => {

      shapeModel.getAllMasses().forEach( mass => {
        this.availableMasses.push( mass );

        // Initially selected one made visible below in link()
        mass.internalVisibleProperty.value = false;
      } );

      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      shapeModel.shapeProperty.link( ( newMass, oldMass ) => {
        if ( oldMass && !isSettingPhetioStateProperty.value ) {
          newMass.matrix.set( oldMass.matrix );
          newMass.writeData();
        }

        if ( oldMass ) {
          oldMass.internalVisibleProperty.value = false;
        }

        newMass.internalVisibleProperty.value = true;
      } );
    } );

    this.availableMasses.add( this.objectA.shapeProperty.value );
    this.availableMasses.add( this.objectB.shapeProperty.value );

    this.modeProperty.link( mode => {
      this.objectB.shapeProperty.value.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

    this.setInitialPositions();
  }

  private createMass( tandem: Tandem, shape: MassShape, widthRatio: number, heightRatio: number, tag: MassTag ): Mass {
    const massOptions = {
      material: this.materialProperty.value,
      availableMassMaterials: this.availableMaterials,
      materialPropertyOptions: {
        phetioReadOnly: true
      },
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

    // When the main material selector changes, propagate that through to the mass.
    this.materialProperty.lazyLink( material => {
      mass.materialProperty.value = material;
    } );
    return mass;
  }

  /**
   * Sets up the initial positions of the masses (since some resets may not change the mass).
   */
  private setInitialPositions(): void {
    this.objectA.shapeProperty.value.setPosition( -0.225, 0 );
    this.objectB.shapeProperty.value.setPosition( 0.075, 0 );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {

    this.objectA.reset();
    this.objectB.reset();

    // Reset the mode after resetting the shapeBProperty, otherwise the secondary mass will become visible
    // if it changes, see https://github.com/phetsims/density-buoyancy-common/issues/221
    this.modeProperty.reset();

    this.materialProperty.reset();

    super.reset();

    this.setInitialPositions();
  }
}

densityBuoyancyCommon.register( 'BuoyancyShapesModel', BuoyancyShapesModel );