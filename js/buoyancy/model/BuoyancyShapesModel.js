// Copyright 2019-2020, University of Colorado Boulder

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
import Cone from '../../common/model/Cone.js';
import Cuboid from '../../common/model/Cuboid.js';
import DensityBuoyancyModel from '../../common/model/DensityBuoyancyModel.js';
import Ellipsoid from '../../common/model/Ellipsoid.js';
import HorizontalCylinder from '../../common/model/HorizontalCylinder.js';
import Material from '../../common/model/Material.js';
import Scale from '../../common/model/Scale.js';
import VerticalCylinder from '../../common/model/VerticalCylinder.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

// constants
const MassShape = Enumeration.byKeys( [
  'BLOCK',
  'ELLIPSOID',
  'VERTICAL_CYLINDER',
  'HORIZONTAL_CYLINDER',
  'CONE',
  'INVERTED_CONE'
] );
const MATERIAL = Material.WOOD;

class BuoyancyShapesModel extends DensityBuoyancyModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public {Property.<boolean>}
    this.secondaryMassVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>}
    this.densityReadoutExpandedProperty = new BooleanProperty( false );

    // @public {Scale}
    this.leftScale = new Scale( this.engine, {
      matrix: Matrix3.translation( -0.7, -Scale.SCALE_BASE_BOUNDS.minY ),
      displayType: Scale.DisplayType.NEWTONS
    } );
    this.masses.push( this.leftScale );

    // @public {Scale}
    this.poolScale = new Scale( this.engine, {
      matrix: Matrix3.translation( 0.25, -Scale.SCALE_BASE_BOUNDS.minY + this.poolBounds.minY ),
      displayType: Scale.DisplayType.NEWTONS
    } );
    this.masses.push( this.poolScale );

    // @public {Property.<MassShape>}
    this.primaryShapeProperty = new EnumerationProperty( MassShape, MassShape.BLOCK );
    this.secondaryShapeProperty = new EnumerationProperty( MassShape, MassShape.INVERTED_CONE );

    // @public {Property.<number>}
    this.primaryWidthRatioProperty = new NumberProperty( 0.25 );
    this.secondaryWidthRatioProperty = new NumberProperty( 0.25 );

    // @public {Property.<number>}
    this.primaryHeightRatioProperty = new NumberProperty( 0.75 );
    this.secondaryHeightRatioProperty = new NumberProperty( 0.75 );

    const createMass = ( shape, widthRatio, heightRatio ) => {
      switch( shape ) {
        case MassShape.BLOCK:
          return new Cuboid( this.engine, Cuboid.getSizeFromRatios( widthRatio, heightRatio ), {
            material: MATERIAL
          } );
        case MassShape.ELLIPSOID:
          return new Ellipsoid( this.engine, Ellipsoid.getSizeFromRatios( widthRatio, heightRatio ), {
            material: MATERIAL
          } );
        case MassShape.VERTICAL_CYLINDER:
          return new VerticalCylinder(
            this.engine,
            VerticalCylinder.getRadiusFromRatio( widthRatio ),
            VerticalCylinder.getHeightFromRatio( heightRatio ),
            { material: MATERIAL }
          );
        case MassShape.HORIZONTAL_CYLINDER:
          return new HorizontalCylinder(
            this.engine,
            HorizontalCylinder.getRadiusFromRatio( heightRatio ),
            HorizontalCylinder.getLengthFromRatio( widthRatio ),
            { material: MATERIAL }
          );
        case MassShape.CONE:
          return new Cone(
            this.engine,
            Cone.getRadiusFromRatio( widthRatio ),
            Cone.getHeightFromRatio( heightRatio ),
            true,
            { material: MATERIAL }
          );
        case MassShape.INVERTED_CONE:
          return new Cone(
            this.engine,
            Cone.getRadiusFromRatio( widthRatio ),
            Cone.getHeightFromRatio( heightRatio ),
            false,
            { material: MATERIAL }
          );
        default:
          throw new Error( `shape not recognized: ${shape}` );
      }
    };

    // @public {Property.<Mass>}
    this.primaryMassProperty = new DerivedProperty( [ this.primaryShapeProperty ], shape => {
      return createMass( shape, this.primaryWidthRatioProperty.value, this.primaryHeightRatioProperty.value );
    } );
    this.secondaryMassProperty = new DerivedProperty( [ this.secondaryShapeProperty ], shape => {
      return createMass( shape, this.secondaryWidthRatioProperty.value, this.secondaryHeightRatioProperty.value );
    } );

    Property.lazyMultilink( [ this.primaryWidthRatioProperty, this.primaryHeightRatioProperty ], ( widthRatio, heightRatio ) => {
      this.primaryMassProperty.value.setRatios( widthRatio, heightRatio );
    } );
    Property.lazyMultilink( [ this.secondaryWidthRatioProperty, this.secondaryHeightRatioProperty ], ( widthRatio, heightRatio ) => {
      this.secondaryMassProperty.value.setRatios( widthRatio, heightRatio );
    } );

    // When a new mass is created, set up its position to be that of the old mass
    [ this.primaryMassProperty, this.secondaryMassProperty ].forEach( massProperty => {
      massProperty.lazyLink( ( newMass, oldMass ) => {
        newMass.matrix.set( oldMass.matrix );
        newMass.writeData();

        if ( this.masses.contains( oldMass ) ) {
          this.masses.remove( oldMass );
          this.masses.add( newMass );
        }
      } );
    } );

    this.masses.add( this.primaryMassProperty.value );

    this.secondaryMassVisibleProperty.lazyLink( secondaryMassVisible => {
      if ( secondaryMassVisible ) {
        this.masses.push( this.secondaryMassProperty.value );
      }
      else {
        this.masses.remove( this.secondaryMassProperty.value );
      }
    } );

    this.setInitialPositions();
  }

  /**
   * Sets up the initial positions of the masses (since some resets may not change the mass).
   * @private
   */
  setInitialPositions() {
    this.primaryMassProperty.value.matrix.setToTranslation( -0.3, 0 );
    this.primaryMassProperty.value.writeData();

    this.secondaryMassProperty.value.matrix.setToTranslation( 0.3, 0 );
    this.secondaryMassProperty.value.writeData();
  }

  /**
   * Resets things to their original values.
   * @public
   * @override
   */
  reset() {
    this.secondaryMassVisibleProperty.reset();
    this.densityReadoutExpandedProperty.reset();

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

// @public {Enumeration}
BuoyancyShapesModel.MassShape = MassShape;

densityBuoyancyCommon.register( 'BuoyancyShapesModel', BuoyancyShapesModel );
export default BuoyancyShapesModel;
