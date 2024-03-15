// Copyright 2024, University of Colorado Boulder

/**
 * A display to show the excess pool liquid that has been displaced.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MultiSectionPanelsNode, { MultiSectionPanelsNodeOptions } from '../../common/view/MultiSectionPanelsNode.js';
import BeakerNode from '../../../../scenery-phet/js/BeakerNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

type SelfOptions = EmptySelfOptions;

type FluidDisplacedPanelOptions = SelfOptions & MultiSectionPanelsNodeOptions;

export default class FluidDisplacedPanel extends MultiSectionPanelsNode {

  // TODO: base "100" off of something from the model. https://github.com/phetsims/buoyancy/issues/113
  public constructor( poolVolumeProperty: TReadOnlyProperty<number>, providedOptions?: FluidDisplacedPanelOptions ) {

    const beakerVolumeProperty = new NumberProperty( 0.2, { range: new Range( 0, 1 ) } );
    const beakerNode = new BeakerNode( beakerVolumeProperty, {
      lineWidth: 1,
      beakerHeight: 100,
      beakerWidth: 100,
      yRadiusOfEnds: 12,
      ticksVisible: true,
      numberOfTicks: 10
    } );

    super( [ beakerNode ], providedOptions );
  }
}

densityBuoyancyCommon.register( 'FluidDisplacedPanel', FluidDisplacedPanel );
