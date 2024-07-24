// Copyright 2019-2024, University of Colorado Boulder

/**
 * Shows mass/volume controls for a primary and secondary mass, called A and B.
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
import ABPanelsNode from './ABPanelsNode.js';
import Material from '../model/Material.js';

type SelfOptions = {
  mysteryMaterials?: Material[]; // TODO: delete, https://github.com/phetsims/density-buoyancy-common/issues/270
};

export type ABControlsNodeOptions = SelfOptions & BlockControlNodeOptions & { tandem: Tandem };

export default class ABControlsNode extends ABPanelsNode {

  // Controls for the primary and secondary masses. Public so they can be split up in the focus order,
  // see https://github.com/phetsims/density-buoyancy-common/issues/121
  public readonly controlANode: BlockControlNode;
  public readonly controlBNode: BlockControlNode;

  /**
   * @param massA
   * @param massB
   * @param popupLayer
   * @param options - Applied to each BlockControlNode
   */
  public constructor( massA: Cuboid, massB: Cuboid, popupLayer: Node, options: ABControlsNodeOptions ) {

    const tandem = options.tandem;
    const omittedOptions = _.omit( options, [ 'tandem' ] );

    const controlANode = new BlockControlNode( massA, popupLayer, true, combineOptions<BlockControlNodeOptions>( {
      labelNode: ABPanelsNode.getTagALabelNode(),
      color: DensityBuoyancyCommonColors.tagAProperty,
      tandem: tandem.createTandem( 'blockAPanel' ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, omittedOptions ) );

    const controlBNode = new BlockControlNode( massB, popupLayer, false, combineOptions<BlockControlNodeOptions>( {
      labelNode: ABPanelsNode.getTagBLabelNode(),
      color: DensityBuoyancyCommonColors.tagBProperty,
      tandem: tandem.createTandem( 'blockBPanel' ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, omittedOptions ) );

    super(
      new Node( {
        children: [ controlANode ],
        visibleProperty: DerivedProperty.and( [ massA.visibleProperty, controlANode.visibleProperty ] )
      } ),
      new Node( {
        children: [ controlBNode ],
        visibleProperty: DerivedProperty.and( [ massB.visibleProperty, controlBNode.visibleProperty ] )
      } )
    );

    this.controlANode = controlANode;
    this.controlBNode = controlBNode;
  }
}

densityBuoyancyCommon.register( 'ABControlsNode', ABControlsNode );