// Copyright 2024, University of Colorado Boulder

/**
 * The view code for the label for the name of the mass, often called the mass "tag" (see MassTag).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import { MASS_MIN_SHAPES_DIMENSION } from '../model/Mass.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import MassTag from '../model/MassTag.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';

// Constant for MassView subtypes to use to consistently offset their tag on their shape
export const TAG_OFFSET = MASS_MIN_SHAPES_DIMENSION / 20; // TODO: delete? https://github.com/phetsims/density-buoyancy-common/issues/113

// Calculated by comparing the original label rectangle size when providing primary/secondary tags
const horizontalMargin = 14;
const verticalMargin = 5;

// constants
const tagFont = new PhetFont( { size: 24, weight: 'bold' } );

export default class MassTagNode extends Node {

  public constructor( massTag: MassTag ) {

    assert && assert( massTag !== MassTag.NONE, 'MassTagNode must have a provided MassTag' );

    assert && assert( !massTag.nameProperty.isDisposed, 'do not dispose a nameProperty' );

    const visibleProperty = new DerivedProperty( [ massTag.nameProperty ], name => name.length > 0 );

    const label = new Text( massTag.nameProperty, {
      font: tagFont,
      maxWidth: 100,
      visibleProperty: visibleProperty
    } );

    const colorListener = ( color: Color ) => {
      label.fill = Color.getLuminance( color ) > ( 255 / 2 ) ? 'black' : 'white'; // best guess?
    };
    massTag.colorProperty.link( colorListener );

    const backgroundNode = new BackgroundNode( label, {
      xMargin: horizontalMargin / 2,
      yMargin: verticalMargin / 2,
      rectangleOptions: {
        cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
        fill: massTag.colorProperty,
        opacity: 1
      },
      scale: 0.54 // To match the sizing when rendered as a THREE Quad.
    } );
    backgroundNode.leftBottom = Vector2.ZERO;
    super( {
      children: [ backgroundNode ]
    } );
    this.disposeEmitter.addListener( () => {
      massTag.colorProperty.unlink( colorListener );
      label.dispose();
      visibleProperty.dispose();
      backgroundNode.dispose();
    } );

  }

  public static readonly PRIMARY_LABEL = new MassTagNode( MassTag.PRIMARY );
  public static readonly SECONDARY_LABEL = new MassTagNode( MassTag.SECONDARY );
}

densityBuoyancyCommon.register( 'MassTagNode', MassTagNode );