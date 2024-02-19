// Copyright 2019-2024, University of Colorado Boulder

/**
 * The view code for the label for the name of the mass, often called the mass "tag" (see MassTag).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import TextureQuad from '../../../../mobius/js/TextureQuad.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { MASS_MIN_SHAPES_DIMENSION, MassTag } from '../model/Mass.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import LabelTexture from './LabelTexture.js';
import { Multilink, TinyProperty, UnknownMultilink } from '../../../../axon/js/imports.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';

// Constant for MassView subtypes to use to consistently offset their tag on their shape
export const TAG_OFFSET = MASS_MIN_SHAPES_DIMENSION / 20;
const TAG_SCALE_NEW = 0.00046875;

// Calculated by comparing the original label rectangle size when providing primary/secondary tags
const horizontalMargin = 14;
const verticalMargin = 5;

// constants
const tagFont = new PhetFont( { size: 24, weight: 'bold' } );

export default class MassTagView extends TextureQuad {

  private tagNodeTexture: NodeTexture;
  private readonly massTagMultilink: UnknownMultilink;

  // This is set upon construction and never changes. Although the text can update, it won't change the height
  public readonly tagHeight: number;
  public readonly tagOffsetProperty: TReadOnlyProperty<Vector3>;

  private readonly tagOffsetPropertyListener: ( offset: Vector3 ) => void;

  public constructor( mass: Mass, tagOffsetProperty: TReadOnlyProperty<Vector3> ) {

    assert && assert( mass.tag !== MassTag.NONE, 'MassTagView must have a provided MassTag' );

    const colorProperty = mass.tag === MassTag.PRIMARY ? DensityBuoyancyCommonColors.labelPrimaryProperty :
                          mass.tag === MassTag.SECONDARY ? DensityBuoyancyCommonColors.labelSecondaryProperty :
                          new TinyProperty( Color.white );
    const nameProperty = mass.tag === MassTag.PRIMARY ? DensityBuoyancyCommonStrings.massLabel.primaryStringProperty :
                         mass.tag === MassTag.SECONDARY ? DensityBuoyancyCommonStrings.massLabel.secondaryStringProperty :
                         mass.nameProperty;

    const tagNodeTexture = new LabelTexture( MassTagView.getTagNode( nameProperty, colorProperty ) );

    const tagWidth = TAG_SCALE_NEW * tagNodeTexture._width;
    const tagHeight = TAG_SCALE_NEW * tagNodeTexture._height;

    super( tagNodeTexture, tagWidth, tagHeight, {
      depthTest: true
    } );
    this.tagHeight = tagHeight;
    this.tagNodeTexture = tagNodeTexture;
    this.tagOffsetProperty = tagOffsetProperty;

    this.massTagMultilink = new Multilink( [ nameProperty, colorProperty ], string => {
      const texture = this.tagNodeTexture;
      texture.update();

      const tagWidth = TAG_SCALE_NEW * texture._width;

      this.updateTexture( texture, tagWidth, tagHeight );
      this.visible = string !== '';
    } );

    this.renderOrder = 1;

    this.tagOffsetPropertyListener = offset => {
      // Increase the z dimension just slightly to make sure it is always on top of the mass.
      this.position.set( offset.x, offset.y, offset.z + 0.0001 );
    };
    tagOffsetProperty.link( this.tagOffsetPropertyListener );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {

    if ( this.massTagMultilink ) {
      this.massTagMultilink.dispose();
    }

    this.tagOffsetProperty.unlink( this.tagOffsetPropertyListener );

    this.tagNodeTexture && this.tagNodeTexture.dispose();

    super.dispose();
  }

  private static getTagNode( string: TReadOnlyProperty<string>, fill: TReadOnlyProperty<Color | string> ): Node {
    const label = new Text( string, {
      font: tagFont,
      fill: Color.getLuminance( fill.value ) > ( 255 / 2 ) ? 'black' : 'white', // best guess?
      maxWidth: 30
    } );

    return new BackgroundNode( label, {
      xMargin: horizontalMargin / 2,
      yMargin: verticalMargin / 2,
      rectangleOptions: {
        cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
        fill: fill,
        opacity: 1
      }
    } );
  }

  public static readonly PRIMARY_LABEL = MassTagView.getTagNode( DensityBuoyancyCommonStrings.massLabel.primaryStringProperty, DensityBuoyancyCommonColors.labelPrimaryProperty );
  public static readonly SECONDARY_LABEL = MassTagView.getTagNode( DensityBuoyancyCommonStrings.massLabel.secondaryStringProperty, DensityBuoyancyCommonColors.labelSecondaryProperty );
}

densityBuoyancyCommon.register( 'MassTagView', MassTagView );
