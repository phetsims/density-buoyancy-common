// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows a force diagram for an individual mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import Mass from '../model/Mass.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import InterpolatedProperty from '../model/InterpolatedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { chooseDecimalPlaces } from '../DensityBuoyancyCommonConstants.js';
import BlendedVector2Property from '../model/BlendedVector2Property.js';

// constants
const arrowOptions = {
  stroke: null,
  tailWidth: 4,
  headWidth: 15,
  headHeight: 12
};
const arrowSpacing = arrowOptions.headWidth + 3;
const labelFont = new PhetFont( { size: 12, weight: 'bold' } );

export default class ForceDiagramNode extends Node {

  public readonly mass: Mass;
  private readonly showGravityForceProperty: TReadOnlyProperty<boolean>;
  private readonly showBuoyancyForceProperty: TReadOnlyProperty<boolean>;
  private readonly showContactForceProperty: TReadOnlyProperty<boolean>;
  private readonly showForceValuesProperty: TReadOnlyProperty<boolean>;
  private readonly forceScaleProperty: TReadOnlyProperty<number>;

  private readonly gravityArrowNode: ArrowNode;
  private readonly buoyancyArrowNode: ArrowNode;
  private readonly contactArrowNode: ArrowNode;

  private readonly gravityLabelText: Text;
  private readonly buoyancyLabelText: Text;
  private readonly contactLabelText: Text;

  private readonly gravityLabelNode: Node;
  private readonly buoyancyLabelNode: Node;
  private readonly contactLabelNode: Node;

  private readonly arrowMap: Map<ArrowNode, Node>;

  private readonly axisNode: Line;

  public constructor(
    mass: Mass,
    showGravityForceProperty: TReadOnlyProperty<boolean>,
    showBuoyancyForceProperty: TReadOnlyProperty<boolean>,
    showContactForceProperty: TReadOnlyProperty<boolean>,
    showForceValuesProperty: TReadOnlyProperty<boolean>,
    forceScaleProperty: TReadOnlyProperty<number>
  ) {
    super();

    this.mass = mass;

    this.showGravityForceProperty = showGravityForceProperty;
    this.showBuoyancyForceProperty = showBuoyancyForceProperty;
    this.showContactForceProperty = showContactForceProperty;
    this.showForceValuesProperty = showForceValuesProperty;
    this.forceScaleProperty = forceScaleProperty;

    this.gravityArrowNode = new ArrowNode( 0, 0, 0, 0, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.gravityForceProperty
    }, arrowOptions ) );
    this.buoyancyArrowNode = new ArrowNode( 0, 0, 0, 0, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.buoyancyForceProperty
    }, arrowOptions ) );
    this.contactArrowNode = new ArrowNode( 0, 0, 0, 0, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.contactForceProperty
    }, arrowOptions ) );

    const textMaxWidth = 150;

    this.gravityLabelText = new Text( '', {
      font: labelFont,
      fill: DensityBuoyancyCommonColors.gravityForceProperty,
      maxWidth: textMaxWidth
    } );
    this.buoyancyLabelText = new Text( '', {
      font: labelFont,
      fill: DensityBuoyancyCommonColors.buoyancyForceProperty,
      maxWidth: textMaxWidth
    } );
    this.contactLabelText = new Text( '', {
      font: labelFont,
      fill: DensityBuoyancyCommonColors.contactForceProperty,
      maxWidth: textMaxWidth
    } );

    const panelOptions = {
      stroke: null,
      fill: DensityBuoyancyCommonColors.massLabelBackgroundProperty,
      cornerRadius: 0,
      xMargin: 2,
      yMargin: 1
    };

    this.gravityLabelNode = new Panel( this.gravityLabelText, panelOptions );
    this.buoyancyLabelNode = new Panel( this.buoyancyLabelText, panelOptions );
    this.contactLabelNode = new Panel( this.contactLabelText, panelOptions );

    this.arrowMap = new Map();
    this.arrowMap.set( this.gravityArrowNode, this.gravityLabelNode );
    this.arrowMap.set( this.buoyancyArrowNode, this.buoyancyLabelNode );
    this.arrowMap.set( this.contactArrowNode, this.contactLabelNode );

    this.axisNode = new Line( {
      stroke: 'black'
    } );

    const newtonsPatternProperty = DensityBuoyancyCommonStrings.newtonsPatternStringProperty;

    const stringListener = this.update.bind( this );
    newtonsPatternProperty.lazyLink( stringListener );
    this.disposeEmitter.addListener( () => newtonsPatternProperty.unlink( stringListener ) );
  }

  /**
   * Updates the displayed view.
   */
  public update(): void {
    const upwardArrows: ArrowNode[] = [];
    const downwardArrows: ArrowNode[] = [];
    const labels: Node[] = [];

    const updateArrow = ( forceProperty: InterpolatedProperty<Vector2> | BlendedVector2Property, showForceProperty: TReadOnlyProperty<boolean>, arrowNode: ArrowNode, textNode: Text, labelNode: Node ) => {
      const y = forceProperty.value.y;
      if ( showForceProperty.value && Math.abs( y ) > 1e-5 ) {
        arrowNode.setTip( 0, -y * this.forceScaleProperty.value * 20 ); // Default zoom is 20 units per Newton
        ( y > 0 ? upwardArrows : downwardArrows ).push( arrowNode );

        if ( this.showForceValuesProperty.value ) {
          // We have a listener to the string that will call update
          textNode.string = StringUtils.fillIn( DensityBuoyancyCommonStrings.newtonsPatternStringProperty, {
            newtons: Utils.toFixed( forceProperty.value.magnitude, chooseDecimalPlaces( forceProperty.value.magnitude ) )
          } );
          labels.push( labelNode );
        }
      }
    };

    // Documentation specifies that contact force should always be on the left if there are conflicts
    updateArrow( this.mass.contactForceBlendedProperty, this.showContactForceProperty, this.contactArrowNode, this.contactLabelText, this.contactLabelNode );
    updateArrow( this.mass.gravityForceInterpolatedProperty, this.showGravityForceProperty, this.gravityArrowNode, this.gravityLabelText, this.gravityLabelNode );
    updateArrow( this.mass.buoyancyForceInterpolatedProperty, this.showBuoyancyForceProperty, this.buoyancyArrowNode, this.buoyancyLabelText, this.buoyancyLabelNode );

    this.children = [
      ...upwardArrows,
      ...downwardArrows,
      ...( upwardArrows.length + downwardArrows.length > 0 ? [ this.axisNode ] : [] ),
      ...labels
    ];

    const positionArrow = ( array: ArrowNode[], index: number, isUp: boolean ) => {
      const arrow = array[ index ];
      arrow.x = ( index - ( array.length - 1 ) / 2 ) * arrowSpacing;
      if ( this.showForceValuesProperty.value ) {
        const label = this.arrowMap.get( arrow )!;
        if ( isUp ) {
          label.bottom = -2;
        }
        else {
          label.top = 2;
        }
        if ( index + 1 < array.length ) {
          label.right = arrow.left - 2;
        }
        else {
          label.left = arrow.right + 2;
        }
      }
    };

    // Layout arrows with spacing
    for ( let i = 0; i < upwardArrows.length; i++ ) {
      positionArrow( upwardArrows, i, true );
    }
    for ( let i = 0; i < downwardArrows.length; i++ ) {
      positionArrow( downwardArrows, i, false );
    }

    const axisHalfWidth = Math.max( upwardArrows.length, downwardArrows.length ) * 10 - 5;
    this.axisNode.x1 = -axisHalfWidth;
    this.axisNode.x2 = axisHalfWidth;
  }

  public static getExploreIcon(): Node {
    const arrowLength = 120;

    const arrowIconOptions = {
      tailWidth: arrowLength / 8,
      headWidth: arrowLength / 4,
      headHeight: arrowLength / 5
    };

    const gravityArrowNode = new ArrowNode( 0, 0, 0, arrowLength, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.gravityForceProperty
    }, arrowOptions, arrowIconOptions ) );

    const buoyancyArrowNode = new ArrowNode( 0, 0, 0, arrowLength, combineOptions<ArrowNodeOptions>( {
      fill: DensityBuoyancyCommonColors.buoyancyForceProperty
    }, arrowOptions, arrowIconOptions ) );

    buoyancyArrowNode.setTip( 0, -arrowLength );
    gravityArrowNode.setTip( 0, arrowLength );
    return new VBox( {
      children: [
        buoyancyArrowNode,
        gravityArrowNode
      ]
    } );
  }
}

densityBuoyancyCommon.register( 'ForceDiagramNode', ForceDiagramNode );