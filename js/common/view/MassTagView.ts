// Copyright 2024, University of Colorado Boulder

/**
 * The view code for the label for the name of the mass, often called the mass "tag" (see MassTag).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import TextureQuad from '../../../../mobius/js/TextureQuad.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { MASS_MIN_SHAPES_DIMENSION } from '../model/Mass.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import LabelTexture from './LabelTexture.js';
import { Multilink } from '../../../../axon/js/imports.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import MassTag from '../model/MassTag.js';

// Constant for MassView subtypes to use to consistently offset their tag on their shape
export const TAG_OFFSET = MASS_MIN_SHAPES_DIMENSION / 20;
const TAG_SCALE_NEW = 0.00046875;

// Calculated by comparing the original label rectangle size when providing primary/secondary tags
const horizontalMargin = 14;
const verticalMargin = 5;

// constants
const tagFont = new PhetFont( { size: 24, weight: 'bold' } );

export default class MassTagView extends TextureQuad {


  // This is set upon construction and never changes. Although the text can update, it won't change the height
  public readonly tagHeight: number;
  public readonly tagOffsetProperty: TReadOnlyProperty<Vector3>;

  public constructor( mass: Mass, tagOffsetProperty: TReadOnlyProperty<Vector3> ) {

    assert && assert( mass.tag !== MassTag.NONE, 'MassTagView must have a provided MassTag' );

    assert && assert( !mass.tag.nameProperty.isDisposed, 'do not dispose a nameProperty' );

    const tagNode = MassTagView.getTagNode( mass.tag );
    const tagNodeTexture = new LabelTexture( tagNode );

    const tagWidth = TAG_SCALE_NEW * tagNodeTexture._width;
    const tagHeight = TAG_SCALE_NEW * tagNodeTexture._height;

    super( tagNodeTexture, tagWidth, tagHeight, {
      depthTest: true
    } );
    this.tagHeight = tagHeight;
    this.tagOffsetProperty = tagOffsetProperty;

    const massTagMultilink = new Multilink( [ mass.tag.nameProperty, mass.tag.colorProperty ], string => {
      tagNodeTexture.update();

      const tagWidth = TAG_SCALE_NEW * tagNodeTexture._width;

      this.updateTexture( tagNodeTexture, tagWidth, tagHeight );
      this.visible = string !== '';
    } );

    this.renderOrder = 1;

    const tagOffsetPropertyListener = ( offset: Vector3 ) => {
      // Increase the z dimension just slightly to make sure it is always on top of the mass.
      this.position.set( offset.x, offset.y, offset.z + 0.0001 );
    };
    tagOffsetProperty.link( tagOffsetPropertyListener );

    this.disposeEmitter.addListener( () => {
      tagOffsetProperty.unlink( tagOffsetPropertyListener );
      tagNodeTexture.dispose();
      tagNode.dispose;
      massTagMultilink.dispose();
    } );
  }

  private static getTagNode( massTag: MassTag ): Node {
    const label = new Text( massTag.nameProperty, {
      font: tagFont,
      maxWidth: 100
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
      }
    } );
    backgroundNode.disposeEmitter.addListener( () => {
      massTag.colorProperty.unlink( colorListener );
      label.dispose();
    } );
    return backgroundNode;
  }

  public static readonly PRIMARY_LABEL = MassTagView.getTagNode( MassTag.PRIMARY );
  public static readonly SECONDARY_LABEL = MassTagView.getTagNode( MassTag.SECONDARY );
}

densityBuoyancyCommon.register( 'MassTagView', MassTagView );
