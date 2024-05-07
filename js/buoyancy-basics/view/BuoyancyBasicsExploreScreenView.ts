// Copyright 2019-2024, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Buoyancy: Basics simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { AlignBox, ManualConstraint, Node, RichText, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyBasicsExploreModel from '../model/BuoyancyBasicsExploreModel.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import BuoyancyDisplayOptionsNode from '../../common/view/BuoyancyDisplayOptionsNode.js';
import SubmergedAccordionBox from '../../buoyancy/view/SubmergedAccordionBox.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import BlocksRadioButtonGroup from '../../common/view/BlocksRadioButtonGroup.js';
import BuoyancyExploreScreenView from '../../buoyancy/view/BuoyancyExploreScreenView.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScaleHeightControl from '../../common/view/ScaleHeightControl.js';
import FluidSelectionPanel from '../../buoyancy/view/FluidSelectionPanel.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import DensityNumberLineNode from '../../density/view/DensityNumberLineNode.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyBasicsExploreScreenView extends DensityBuoyancyScreenView<BuoyancyBasicsExploreModel> {

  protected readonly rightBox: PrimarySecondaryControlsNode;
  private readonly scaleHeightControl: ScaleHeightControl;

  public constructor( model: BuoyancyBasicsExploreModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const buoyancyDisplayOptionsNode = new BuoyancyDisplayOptionsNode( model, {
      includeVectorScaleControl: false,
      tandem: tandem.createTandem( 'buoyancyDisplayOptionsNode' )
    } );

    this.addChild( new AlignBox( new Panel( buoyancyDisplayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS ), {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const displayedMysteryMaterials = [
      Material.DENSITY_A,
      Material.DENSITY_B
    ];

    const invisibleMaterials = [ ...DensityBuoyancyCommonConstants.BUOYANCY_FLUID_MYSTERY_MATERIALS ];
    displayedMysteryMaterials.forEach( displayed => arrayRemove( invisibleMaterials, displayed ) );

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      {
        tandem: tandem,
        minCustomMass: 0.1,
        maxCustomMass: 15,
        supportHiddenMaterial: true,
        mysteryMaterials: [ Material.MATERIAL_X ]
      }
    );

    const fluidSelectionPanel = new FluidSelectionPanel( model.liquidMaterialProperty, {
      tandem: options.tandem.createTandem( 'fluidSelectionPanel' )
    } );

    this.addChild( new AlignBox( fluidSelectionPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    [ model.primaryMass, model.secondaryMass ].forEach( mass => {
      mass.materialProperty.link( material => {
        if ( material === Material.MATERIAL_X ) {
          mass.volumeProperty.value = 0.003;
        }
      } );
    } );

    const submergedAccordionBox = new SubmergedAccordionBox( model.gravityProperty, model.liquidMaterialProperty, {
      expandedProperty: model.percentageSubmergedExpandedProperty,
      contentWidthMax: this.rightBox.content.width,
      tandem: tandem.createTandem( 'submergedAccordionBox' )
    } );

    const customExploreScreenFormatting = [ model.primaryMass, model.secondaryMass ].map( mass => {
      return {
        readoutNameProperty: new PatternStringProperty( DensityBuoyancyCommonStrings.blockPatternStringProperty, { tag: mass.nameProperty } ),
        readoutFormat: { font: DensityBuoyancyCommonConstants.ITEM_FONT, fill: mass.tag.colorProperty }
      };
    } );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.secondaryMass.visibleProperty.link( visible => {
      const masses = visible ? [ model.primaryMass, model.secondaryMass ] : [ model.primaryMass ];
      submergedAccordionBox.setReadoutItems( masses.map( ( mass, index ) => {
        return {
          readoutItem: mass,
          readoutNameProperty: customExploreScreenFormatting[ index ].readoutNameProperty,
          readoutFormat: customExploreScreenFormatting[ index ].readoutFormat
        };
      } ) );
    } );

    const rightSideVBox = new VBox( {
      spacing: 10,
      align: 'right',
      children: [
        this.rightBox,
        submergedAccordionBox
      ]
    } );

    this.addChild( new AlignBox( rightSideVBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );


    const accordionTandem = tandem.createTandem( 'densityAccordionBox' );
    const densityAccordionBox = new AccordionBox( new DensityNumberLineNode(
      {
        displayDensities: [
          // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
          {
            densityProperty: new DerivedProperty( [ model.liquidDensityProperty ], density => density ),
            color: DensityBuoyancyCommonColors.liquidLabelProperty,
            nameProperty: DensityBuoyancyCommonStrings.fluidStringProperty
          },
          {
            densityProperty: new DerivedProperty( [ model.primaryMass.materialProperty ], material => material.density ),
            color: DensityBuoyancyCommonColors.labelPrimaryProperty,
            nameProperty: model.primaryMass.tag.nameProperty
          },
          {
            densityProperty: new DerivedProperty( [ model.secondaryMass.materialProperty ], material => material.density ),
            color: DensityBuoyancyCommonColors.labelSecondaryProperty,
            visibleProperty: model.secondaryMass.visibleProperty,
            nameProperty: model.secondaryMass.tag.nameProperty
          }
        ],
        materials: [
          Material.HUMAN,
          Material.GLASS,
          Material.TITANIUM,
          Material.STEEL,
          Material.LEAD,
          Material.MERCURY
        ],
        showNumericValue: false,
        maxDensity: 15000,
        tandem: accordionTandem.createTandem( 'densityReadout' ),
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    ), combineOptions<AccordionBoxOptions>( {
      titleNode: new RichText( new DerivedProperty( [
        DensityBuoyancyCommonPreferences.volumeUnitsProperty,
        DensityBuoyancyCommonStrings.densityReadoutStringProperty,
        DensityBuoyancyCommonStrings.densityReadoutDecimetersCubedStringProperty
      ], ( units, litersReadout, decimetersCubedReadout ) => {
        return units === 'liters' ? litersReadout : decimetersCubedReadout;
      } ), {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200,
        visiblePropertyOptions: {
          phetioReadOnly: true
        },
        tandem: accordionTandem.createTandem( 'titleText' )
      } ),
      expandedProperty: model.densityExpandedProperty,
      buttonAlign: 'left' as const,
      tandem: accordionTandem
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( densityAccordionBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const blocksRadioButtonGroup = new BlocksRadioButtonGroup( model.modeProperty, {
      tandem: this.tandem.createTandem( 'blocksRadioButtonGroup' )
    } );

    ManualConstraint.create( this, [ rightSideVBox, fluidSelectionPanel, blocksRadioButtonGroup ],
      ( rightSideVBoxWrapper, fluidDensityControlPanelWrapper, blocksRadioButtonGroupWrapper ) => {
        blocksRadioButtonGroupWrapper.left = rightSideVBoxWrapper.left;
        blocksRadioButtonGroupWrapper.bottom = fluidDensityControlPanelWrapper.bottom;
      } );

    this.addChild( blocksRadioButtonGroup );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointPropertyProperty.value = new DerivedProperty( [ rightSideVBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    }, {
      strictAxonDependencies: false // This workaround is deemed acceptable for visibleBoundsProperty listening, https://github.com/phetsims/faradays-electromagnetic-lab/issues/65
    } );

    // Info button and associated dialog
    this.scaleHeightControl = new ScaleHeightControl( model.poolScale, model.poolScaleHeightProperty,
      model.poolBounds, model.pool.liquidYInterpolatedProperty, this, {
        tandem: options.tandem.createTandem( 'scaleHeightControl' )
      } );
    this.addChild( this.scaleHeightControl );


    this.addChild( this.popupLayer );
  }

  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // X margin should be based on the front of the pool
    this.scaleHeightControl.x = this.modelToViewPoint( new Vector3(
      this.model.poolBounds.maxX,
      this.model.poolBounds.minY,
      this.model.poolBounds.maxZ
    ) ).plusXY( DensityBuoyancyCommonConstants.MARGIN / 2, 0 ).x;

    // Y should be based on the bottom of the front of the scale (in the middle of the pool)
    this.scaleHeightControl.y = this.modelToViewPoint( new Vector3(
      this.model.poolBounds.maxX,
      this.model.poolBounds.minY,
      this.model.poolScale.getBounds().maxZ
    ) ).y;
  }

  public static getBuoyancyBasicsExploreIcon(): Node {
    return BuoyancyExploreScreenView.getBuoyancyExploreIcon();
  }
}

densityBuoyancyCommon.register( 'BuoyancyBasicsExploreScreenView', BuoyancyBasicsExploreScreenView );