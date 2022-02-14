// Copyright 2019-2021, University of Colorado Boulder

/**
 * The main view for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignPropertyBox, Node, PhetioControlledVisibilityProperty, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import densityBuoyancyCommonStrings from '../../densityBuoyancyCommonStrings.js';
import { BlockSet } from '../model/DensityCompareModel.js';
import ComparisonNumberControl from './ComparisonNumberControl.js';

// constants
const blockSetStringMap = {
  [ BlockSet.SAME_MASS.name ]: densityBuoyancyCommonStrings.blockSet.sameMass,
  [ BlockSet.SAME_VOLUME.name ]: densityBuoyancyCommonStrings.blockSet.sameVolume,
  [ BlockSet.SAME_DENSITY.name ]: densityBuoyancyCommonStrings.blockSet.sameDensity
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

class DensityCompareScreenView extends DensityBuoyancyScreenView {
  /**
   * @param {DensityCompareModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    const tandem = options.tandem;

    super( model, merge( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    const blockSetTandemMap = {
      [ BlockSet.SAME_MASS ]: 'sameMass',
      [ BlockSet.SAME_VOLUME ]: 'sameVolume',
      [ BlockSet.SAME_DENSITY ]: 'sameDensity'
    };

    const blocksPanelTandem = tandem.createTandem( 'blocksPanel' );
    const blocksPanel = new Panel( new VBox( {
      children: [
        new Text( densityBuoyancyCommonStrings.blocks, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160
        } ),
        new VerticalAquaRadioButtonGroup( model.blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
          return {
            node: new Text( blockSetStringMap[ blockSet.name ], {
              font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
              maxWidth: 160
            } ),
            value: blockSet,
            tandemName: `${blockSetTandemMap[ blockSet ]}RadioButton`
          };
        } ), {
          spacing: 8,
          tandem: blocksPanelTandem.createTandem( 'blocksRadioButtonGroup' )
        } )
      ],
      spacing: 10,
      align: 'left'
    } ), merge( {
      tandem: blocksPanelTandem
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );

    this.addChild( new AlignPropertyBox( blocksPanel, this.visibleBoundsProperty, {
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

    const massNumberControlTandem = tandem.createTandem( 'massNumberControl' );
    const massNumberControl = new ComparisonNumberControl(
      model.massProperty,
      densityBuoyancyCommonStrings.mass,
      densityBuoyancyCommonStrings.kilogramsPattern,
      'kilograms',
      {
        tandem: massNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ model.blockSetProperty ], blockSet => blockSet === BlockSet.SAME_MASS, {
          nodeTandem: massNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: model.massProperty
        }
      }
    );

    const volumeNumberControlTandem = tandem.createTandem( 'volumeNumberControl' );
    const volumeNumberControl = new ComparisonNumberControl(
      volumeProperty,
      densityBuoyancyCommonStrings.volume,
      densityBuoyancyCommonStrings.litersPattern,
      'liters',
      {
        tandem: volumeNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ model.blockSetProperty ], blockSet => blockSet === BlockSet.SAME_VOLUME, {
          nodeTandem: volumeNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: model.volumeProperty
        }
      }
    );

    const densityNumberControlTandem = tandem.createTandem( 'densityNumberControl' );
    const densityNumberControl = new ComparisonNumberControl(
      densityProperty,
      densityBuoyancyCommonStrings.density,
      densityBuoyancyCommonStrings.kilogramsPerLiterPattern,
      'value',
      {
        tandem: densityNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ model.blockSetProperty ], blockSet => blockSet === BlockSet.SAME_DENSITY, {
          nodeTandem: densityNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: model.densityProperty
        }
      }
    );

    const numberControlPanel = new Panel( new Node( {
      children: [
        massNumberControl,
        volumeNumberControl,
        densityNumberControl
      ],
      excludeInvisibleChildrenFromBounds: true
    } ), merge( {
      visibleProperty: DerivedProperty.or( [ massNumberControl.visibleProperty, volumeNumberControl.visibleProperty, densityNumberControl.visibleProperty ] )
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );
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

densityBuoyancyCommon.register( 'DensityCompareScreenView', DensityCompareScreenView );
export default DensityCompareScreenView;