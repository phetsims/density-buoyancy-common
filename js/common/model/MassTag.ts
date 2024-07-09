// Copyright 2024, University of Colorado Boulder

/**
 * A model for the name of the Mass, storing name and color data for it.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import { Color, ColorProperty, ColorState } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColors from '../view/DensityBuoyancyCommonColors.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import TProperty from '../../../../axon/js/TProperty.js';

export type MassTagStateObject = {
  name: string;
  color: ColorState;
};

export default class MassTag {

  private readonly _tandemName: string | null;

  public constructor( public readonly nameProperty: TProperty<string>,
                      tandemName: string | null = null,
                      public readonly colorProperty = new ColorProperty( Color.white ) ) {

    this._tandemName = tandemName;
  }

  public get tandemName(): string {
    assert && assert( this._tandemName, 'no tandemName provided for this MassTag' );
    return this._tandemName!;
  }

  public withColorProperty( colorProperty: ColorProperty ): MassTag {
    return new MassTag( this.nameProperty, this._tandemName, colorProperty );
  }

  // TODO Remember these colors https://github.com/phetsims/density-buoyancy-common/issues/182
  public static readonly OBJECT_A_COLOR_PROPERTY = DensityBuoyancyCommonColors.tagAProperty;
  public static readonly OBJECT_B_COLOR_PROPERTY = DensityBuoyancyCommonColors.tagBProperty;

  // TODO How to rename these tags? https://github.com/phetsims/density-buoyancy-common/issues/182
  public static readonly OBJECT_A = new MassTag( DensityBuoyancyCommonStrings.massLabel.primaryStringProperty, null, MassTag.OBJECT_A_COLOR_PROPERTY );
  public static readonly OBJECT_B = new MassTag( DensityBuoyancyCommonStrings.massLabel.secondaryStringProperty, null, MassTag.OBJECT_B_COLOR_PROPERTY );
  public static readonly NONE = new MassTag( new StringProperty( 'NONE' ) );
  public static readonly ONE_A = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1aStringProperty' ], '1A' );
  public static readonly ONE_B = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1bStringProperty' ], '1B' );
  public static readonly ONE_C = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1cStringProperty' ], '1C' );
  public static readonly ONE_D = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1dStringProperty' ], '1D' );
  public static readonly ONE_E = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '1eStringProperty' ], '1E' );
  public static readonly TWO_A = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2aStringProperty' ], '2A' );
  public static readonly TWO_B = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2bStringProperty' ], '2B' );
  public static readonly TWO_C = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2cStringProperty' ], '2C' );
  public static readonly TWO_D = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2dStringProperty' ], '2D' );
  public static readonly TWO_E = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '2eStringProperty' ], '2E' );
  public static readonly THREE_A = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3aStringProperty' ], '3A' );
  public static readonly THREE_B = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3bStringProperty' ], '3B' );
  public static readonly THREE_C = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3cStringProperty' ], '3C' );
  public static readonly THREE_D = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3dStringProperty' ], '3D' );
  public static readonly THREE_E = new MassTag( DensityBuoyancyCommonStrings.massLabel[ '3eStringProperty' ], '3E' );
  public static readonly A = new MassTag( DensityBuoyancyCommonStrings.massLabel.aStringProperty, 'A' );
  public static readonly B = new MassTag( DensityBuoyancyCommonStrings.massLabel.bStringProperty, 'B' );
  public static readonly C = new MassTag( DensityBuoyancyCommonStrings.massLabel.cStringProperty, 'C' );
  public static readonly D = new MassTag( DensityBuoyancyCommonStrings.massLabel.dStringProperty, 'D' );
  public static readonly E = new MassTag( DensityBuoyancyCommonStrings.massLabel.eStringProperty, 'E' );

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