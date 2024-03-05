// Copyright 2024, University of Colorado Boulder

/**
 * A model for the name of the Mass, storing name and color data for it.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Color, ColorProperty, ColorState } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColors from '../view/DensityBuoyancyCommonColors.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import stripEmbeddingMarks from '../../../../phet-core/js/stripEmbeddingMarks.js';
import TProperty from '../../../../axon/js/TProperty.js';

export type MassTagStateObject = {
  name: string;
  color: ColorState;
};

export default class MassTag {

  public readonly tandemName: string;

  public constructor( public readonly nameProperty: TProperty<string>,
                      public readonly colorProperty = new ColorProperty( Color.white ) ) {

    this.tandemName = stripEmbeddingMarks( nameProperty.value );
  }

  public withColorProperty( colorProperty: ColorProperty ): MassTag {
    return new MassTag( this.nameProperty, colorProperty );
  }

  public static readonly PRIMARY_COLOR_PROPERTY = DensityBuoyancyCommonColors.labelPrimaryProperty;
  public static readonly SECONDARY_COLOR_PROPERTY = DensityBuoyancyCommonColors.labelSecondaryProperty;

  public static readonly PRIMARY = new MassTag( DensityBuoyancyCommonStrings.massLabel.primaryStringProperty, MassTag.PRIMARY_COLOR_PROPERTY );
  public static readonly SECONDARY = new MassTag( DensityBuoyancyCommonStrings.massLabel.secondaryStringProperty, MassTag.SECONDARY_COLOR_PROPERTY );
  public static readonly NONE = new MassTag( new StringProperty( 'NONE' ) );
  public static readonly ONE_A = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1aStringProperty' ] );
  public static readonly ONE_B = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1bStringProperty' ] );
  public static readonly ONE_C = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1cStringProperty' ] );
  public static readonly ONE_D = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1dStringProperty' ] );
  public static readonly ONE_E = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1eStringProperty' ] );
  public static readonly TWO_A = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2aStringProperty' ] );
  public static readonly TWO_B = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2bStringProperty' ] );
  public static readonly TWO_C = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2cStringProperty' ] );
  public static readonly TWO_D = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2dStringProperty' ] );
  public static readonly TWO_E = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2eStringProperty' ] );
  public static readonly THREE_A = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3aStringProperty' ] );
  public static readonly THREE_B = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3bStringProperty' ] );
  public static readonly THREE_C = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3cStringProperty' ] );
  public static readonly THREE_D = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3dStringProperty' ] );
  public static readonly THREE_E = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3eStringProperty' ] );
  public static readonly A = new MassTag( DensityBuoyancyCommonStrings.massLabel.aStringProperty );
  public static readonly B = new MassTag( DensityBuoyancyCommonStrings.massLabel.bStringProperty );
  public static readonly C = new MassTag( DensityBuoyancyCommonStrings.massLabel.cStringProperty );
  public static readonly D = new MassTag( DensityBuoyancyCommonStrings.massLabel.dStringProperty );
  public static readonly E = new MassTag( DensityBuoyancyCommonStrings.massLabel.eStringProperty );

  public static MassTagIO = new IOType<MassTag, MassTagStateObject>( 'MassTagIO', {
    valueType: MassTag,
    documentation: 'The name and color for the label of a mass.',
    stateSchema: {
      name: StringIO,
      color: Color.ColorIO
    },
    toStateObject( massTag ) {
      return {
        name: massTag.nameProperty.value,
        color: Color.ColorIO.toStateObject( massTag.colorProperty.value )
      };
    },
    applyState( massTag, stateObject ) {
      if ( stateObject.name !== 'FROM_MIGRATION' ) {
        massTag.nameProperty.value = stateObject.name;
        massTag.colorProperty.value = Color.ColorIO.fromStateObject( stateObject.color );
      }
    }
  } );
}


densityBuoyancyCommon.register( 'MassTag', MassTag );
