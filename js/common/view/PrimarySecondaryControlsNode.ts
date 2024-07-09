// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows mass/volume controls for a primary and secondary mass.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Node } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid from '../model/Cuboid.js';
import BlockControlNode, { BlockControlNodeOptions } from './BlockControlNode.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import PrimarySecondaryPanelsNode from './PrimarySecondaryPanelsNode.js';
import Material from '../model/Material.js';

type SelfOptions = {
  mysteryMaterials?: Material[];
};

export type PrimarySecondaryControlsNodeOptions = SelfOptions & BlockControlNodeOptions & { tandem: Tandem };

export default class PrimarySecondaryControlsNode extends PrimarySecondaryPanelsNode {

  // Controls for the primary and secondary masses. Public so they can be split up in the focus order,
  // see https://github.com/phetsims/density-buoyancy-common/issues/121
  public readonly primaryControlNode: BlockControlNode;
  public readonly secondaryControlNode: BlockControlNode;

  /**
   * @param primaryMass
   * @param secondaryMass
   * @param popupLayer
   * @param options - Applied to each BlockControlNode
   */
  public constructor( primaryMass: Cuboid, secondaryMass: Cuboid, popupLayer: Node, options: PrimarySecondaryControlsNodeOptions ) {

    const tandem = options.tandem;
    const omittedOptions = _.omit( options, [ 'tandem' ] );

    const primaryControlNode = new BlockControlNode( primaryMass, popupLayer, true, combineOptions<BlockControlNodeOptions>( {
      labelNode: PrimarySecondaryPanelsNode.getPrimaryTagLabelNode(),
      color: DensityBuoyancyCommonColors.labelPrimaryProperty,
      tandem: tandem.createTandem( 'blockAControlPanel' ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, omittedOptions ) );

    const secondaryControlNode = new BlockControlNode( secondaryMass, popupLayer, false, combineOptions<BlockControlNodeOptions>( {
      labelNode: PrimarySecondaryPanelsNode.getSecondaryTagLabelNode(),
      color: DensityBuoyancyCommonColors.labelSecondaryProperty,
      tandem: tandem.createTandem( 'blockBControlPanel' ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, omittedOptions ) );

    super(
      new Node( {
        children: [ primaryControlNode ],
        visibleProperty: DerivedProperty.and( [ primaryMass.visibleProperty, primaryControlNode.visibleProperty ] )
      } ),
      new Node( {
        children: [ secondaryControlNode ],
        visibleProperty: DerivedProperty.and( [ secondaryMass.visibleProperty, secondaryControlNode.visibleProperty ] )
      } )
    );

    this.primaryControlNode = primaryControlNode;
    this.secondaryControlNode = secondaryControlNode;
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );