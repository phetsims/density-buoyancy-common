// Copyright 2024, University of Colorado Boulder

/**
 * This is a subset of the possible Materials that can be used to set the material in Density.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export default class MaterialEnumeration extends EnumerationValue {
  public static readonly ALUMINUM = new MaterialEnumeration();
  public static readonly BRICK = new MaterialEnumeration();
  public static readonly COPPER = new MaterialEnumeration();
  public static readonly ICE = new MaterialEnumeration();
  public static readonly PLATINUM = new MaterialEnumeration();
  public static readonly STEEL = new MaterialEnumeration();
  public static readonly STYROFOAM = new MaterialEnumeration();
  public static readonly WOOD = new MaterialEnumeration();
  public static readonly PVC = new MaterialEnumeration();
  public static readonly CUSTOM = new MaterialEnumeration();

  public static readonly enumeration = new Enumeration( MaterialEnumeration, {
    phetioDocumentation: 'Material values'
  } );
}

densityBuoyancyCommon.register( 'MaterialEnumeration', MaterialEnumeration );