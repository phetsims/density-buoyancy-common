// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import AlignPropertyBox from '../../../../scenery/js/layout/AlignPropertyBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import DensityIntroModel from '../model/DensityIntroModel.js';
import ComparisonNumberControl from './ComparisonNumberControl.js';

// constants
const modeStringMap = {
  [ DensityIntroModel.Mode.SAME_MASS.name ]: densityBuoyancyCommonStrings.mode.sameMass,
  [ DensityIntroModel.Mode.SAME_VOLUME.name ]: densityBuoyancyCommonStrings.mode.sameVolume,
  [ DensityIntroModel.Mode.SAME_DENSITY.name ]: densityBuoyancyCommonStrings.mode.sameDensity
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class DensityIntroScreenView extends DensityBuoyancyScreenView {
  /**
   * @param {DensityIntroModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    const tandem = options.tandem;

    super( model, merge( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    // Don't create the majority of the view if three.js isn't usable (e.g. no WebGL)
    if ( !this.enabled ) {
      return;
    }

    const modeTandemMap = {
      [ DensityIntroModel.Mode.SAME_MASS ]: 'sameMass',
      [ DensityIntroModel.Mode.SAME_VOLUME ]: 'sameVolume',
      [ DensityIntroModel.Mode.SAME_DENSITY ]: 'sameDensity'
    };

    const modePanel = new Panel( new VBox( {
      children: [
        new Text( densityBuoyancyCommonStrings.blocks, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        new VerticalAquaRadioButtonGroup( model.modeProperty, DensityIntroModel.Mode.VALUES.map( mode => {
          return {
            node: new Text( modeStringMap[ mode.name ], {
              font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
              maxWidth: 160
            } ),
            value: mode,
            tandemName: `${modeTandemMap[ mode ]}RadioButton`
          };
        } ), {
          spacing: 8,
          tandem: tandem.createTandem( 'modeRadioButtonGroup' )
        } )
      ],
      spacing: 10,
      align: 'left'
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignPropertyBox( modePanel, this.visibleBoundsProperty, {
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // For unit conversion
    const volumeProperty = new DynamicProperty( new Property( model.volumeProperty ), {
      map: cubicMeters => 1000 * cubicMeters,
      inverseMap: liters => liters / 1000,
      bidirectional: true
    } );
    volumeProperty.range = new Range( model.volumeProperty.range.min * 1000, model.volumeProperty.range.max * 1000 );

    // For unit conversion
    const densityProperty = new DynamicProperty( new Property( model.densityProperty ), {
      map: kilogramsPerCubicMeter => kilogramsPerCubicMeter / 1000,
      inverseMap: kilogramsPerLiter => kilogramsPerLiter * 1000,
      bidirectional: true
    } );
    densityProperty.range = new Range( model.densityProperty.range.min / 1000, model.densityProperty.range.max / 1000 );

    const massNumberControl = new ComparisonNumberControl(
      model.massProperty,
      densityBuoyancyCommonStrings.mass,
      densityBuoyancyCommonStrings.kilogramsPattern,
      'kilograms',
      {
        tandem: tandem.createTandem( 'massNumberControl' ),
        sliderOptions: {
          phetioLinkedProperty: model.massProperty
        }
      }
    );
    const volumeNumberControl = new ComparisonNumberControl(
      volumeProperty,
      densityBuoyancyCommonStrings.volume,
      densityBuoyancyCommonStrings.litersPattern,
      'liters',
      {
        tandem: tandem.createTandem( 'volumeNumberControl' ),
        sliderOptions: {
          phetioLinkedProperty: model.volumeProperty
        }
      }
    );
    const densityNumberControl = new ComparisonNumberControl(
      densityProperty,
      densityBuoyancyCommonStrings.density,
      densityBuoyancyCommonStrings.kilogramsPerLiterPattern,
      'value',
      {
        tandem: tandem.createTandem( 'densityNumberControl' ),
        sliderOptions: {
          phetioLinkedProperty: model.densityProperty
        }
      }
    );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.modeProperty.link( mode => {
      massNumberControl.visible = mode === DensityIntroModel.Mode.SAME_MASS;
      volumeNumberControl.visible = mode === DensityIntroModel.Mode.SAME_VOLUME;
      densityNumberControl.visible = mode === DensityIntroModel.Mode.SAME_DENSITY;
    } );

    const numberControlPanel = new Panel( new Node( {
      children: [
        massNumberControl,
        volumeNumberControl,
        densityNumberControl
      ]
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );
    this.addChild( numberControlPanel );

    // @private {function()}
    this.positionPanel = () => {
      // We should be MARGIN below where the edge of the ground exists
      const groundFrontPoint = this.modelToViewPoint( new Vector3( 0, 0, model.groundBounds.maxZ ) );
      numberControlPanel.top = groundFrontPoint.y + MARGIN;
      numberControlPanel.right = this.visibleBoundsProperty.value.maxX - 10;
    };

    this.positionPanel();
    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    this.transformEmitter.addListener( this.positionPanel );
    this.visibleBoundsProperty.lazyLink( this.positionPanel );

    this.addChild( this.popupLayer );
  }

  /**
   * @public
   * @override
   * @param {Bounds2} viewBounds
   */
  layout( viewBounds ) {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.positionPanel();
  }
}

densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );
export default DensityIntroScreenView;