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
import isSettingPhetioStateProperty from '../../../../../tandem/js/isSettingPhetioStateProperty.js';
import MassTag from '../../../common/model/MassTag.js';
import Duck from './Duck.js';
import BuoyancyShapeModel from './BuoyancyShapeModel.js';

export type BuoyancyShapesModelOptions = DensityBuoyancyModelOptions;

export default class BuoyancyShapesModel extends DensityBuoyancyModel {

  public readonly modeProperty: Property<TwoBlockMode>;
  private readonly scale: Scale;

  public readonly primaryShapeModel: BuoyancyShapeModel;
  public readonly secondaryShapeModel: BuoyancyShapeModel;

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

    const boundCreateMass = this.createMass.bind( this );

    // TODO: solve this, https://github.com/phetsims/density-buoyancy-common/issues/182
    // eslint-disable-next-line tandem-name-should-match
    this.primaryShapeModel = new BuoyancyShapeModel( MassShape.BLOCK, 0.25, 0.75, MassTag.PRIMARY, boundCreateMass, {
      tandem: options.tandem.createTandem( 'objectA' )
    } );

    // TODO: solve this, https://github.com/phetsims/density-buoyancy-common/issues/182
    // eslint-disable-next-line tandem-name-should-match
    this.secondaryShapeModel = new BuoyancyShapeModel( MassShape.BLOCK, 0.25, 0.75, MassTag.SECONDARY, boundCreateMass, {
      tandem: options.tandem.createTandem( 'objectB' )
    } );


    // When a new mass is created, set up its position to be that of the old mass
    [ this.primaryShapeModel, this.secondaryShapeModel ].forEach( ( shapeModel: BuoyancyShapeModel ) => {

      // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
      shapeModel.massProperty.lazyLink( ( newMass, oldMass ) => {
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

    this.availableMasses.add( this.primaryShapeModel.massProperty.value );
    this.availableMasses.add( this.secondaryShapeModel.massProperty.value );

    this.modeProperty.link( mode => {
      this.secondaryShapeModel.massProperty.value.internalVisibleProperty.value = mode === TwoBlockMode.TWO_BLOCKS;
    } );

    this.setInitialPositions();
  }

  private createMass( tandem: Tandem, shape: MassShape, widthRatio: number, heightRatio: number, tag: MassTag ): Mass {
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
  }

  /**
   * Sets up the initial positions of the masses (since some resets may not change the mass).
   */
  private setInitialPositions(): void {
    this.primaryShapeModel.massProperty.value.setPosition( -0.225, 0 );
    this.secondaryShapeModel.massProperty.value.setPosition( 0.075, 0 );
  }

  /**
   * Resets things to their original values.
   */
  public override reset(): void {

    this.primaryShapeModel.reset();
    this.secondaryShapeModel.reset();

    // Reset the mode after resetting the secondaryShapeProperty, otherwise the secondary mass will become visible
    // if it changes, see https://github.com/phetsims/density-buoyancy-common/issues/221
    this.modeProperty.reset();

    this.materialProperty.reset();

    super.reset();

    this.setInitialPositions();
  }
}

densityBuoyancyCommon.register( 'BuoyancyShapesModel', BuoyancyShapesModel );