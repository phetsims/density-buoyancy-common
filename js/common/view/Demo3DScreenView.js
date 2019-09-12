// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const arrayRemove = require( 'PHET_CORE/arrayRemove' );
  const Boat = require( 'DENSITY_BUOYANCY_COMMON/common/model/Boat' );
  const BoatView = require( 'DENSITY_BUOYANCY_COMMON/common/view/BoatView' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Color = require( 'SCENERY/util/Color' );
  const Cone = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cone' );
  const ConeView = require( 'DENSITY_BUOYANCY_COMMON/common/view/ConeView' );
  const Cuboid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Cuboid' );
  const CuboidView = require( 'DENSITY_BUOYANCY_COMMON/common/view/CuboidView' );
  const DebugEditNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DebugEditNode' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const DensityBuoyancyScreenView = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyScreenView' );
  const DensityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityControlNode' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DisplayOptionsNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/DisplayOptionsNode' );
  const Ellipsoid = require( 'DENSITY_BUOYANCY_COMMON/common/model/Ellipsoid' );
  const EllipsoidView = require( 'DENSITY_BUOYANCY_COMMON/common/view/EllipsoidView' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const ForceDiagramNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/ForceDiagramNode' );
  const GravityControlNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/GravityControlNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HorizontalCylinder = require( 'DENSITY_BUOYANCY_COMMON/common/model/HorizontalCylinder' );
  const HorizontalCylinderView = require( 'DENSITY_BUOYANCY_COMMON/common/view/HorizontalCylinderView' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const MassLabelNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/MassLabelNode' );
  const MobiusSceneNode = require( 'MOBIUS/MobiusSceneNode' );
  const Mouse = require( 'SCENERY/input/Mouse' );
  const Node = require( 'SCENERY/nodes/Node' );
  const openPopup = require( 'PHET_CORE/openPopup' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Plane3 = require( 'DOT/Plane3' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const Scale = require( 'DENSITY_BUOYANCY_COMMON/common/model/Scale' );
  const ScaleReadoutNode = require( 'DENSITY_BUOYANCY_COMMON/common/view/ScaleReadoutNode' );
  const ScaleView = require( 'DENSITY_BUOYANCY_COMMON/common/view/ScaleView' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Text = require( 'SCENERY/nodes/Text' );
  const ThreeUtil = require( 'MOBIUS/ThreeUtil' );
  const Util = require( 'SCENERY/util/Util' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector3 = require( 'DOT/Vector3' );
  const VerticalCylinder = require( 'DENSITY_BUOYANCY_COMMON/common/model/VerticalCylinder' );
  const VerticalCylinderView = require( 'DENSITY_BUOYANCY_COMMON/common/view/VerticalCylinderView' );
  const WaterLevelIndicator = require( 'DENSITY_BUOYANCY_COMMON/common/view/WaterLevelIndicator' );

  // constants
  const MARGIN = 10;
  const scratchVector2 = new Vector2( 0, 0 );

  class Demo3DScreenView extends DensityBuoyancyScreenView {

    /**
     * @param {DensityBuoyancyModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem );

      if ( !this.enabled ) {
        return this;
      }

      this.addChild( new Panel( new DisplayOptionsNode( model ), {
        xMargin: 10,
        yMargin: 10,
        left: this.layoutBounds.left + MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( new Panel( new DensityControlNode( model.liquidMaterialProperty, this.popupLayer ), {
        xMargin: 10,
        yMargin: 10,
        right: this.layoutBounds.centerX - MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      this.addChild( new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer ), {
        xMargin: 10,
        yMargin: 10,
        left: this.layoutBounds.centerX + MARGIN,
        bottom: this.layoutBounds.bottom - MARGIN
      } ) );

      // private {Property.<Mass>}
      this.currentMassProperty = new Property( model.masses.get( 0 ) );
      this.addChild( new AlignBox( new Panel( new DebugEditNode( this.currentMassProperty, this.popupLayer ) ), {
        alignBounds: this.layoutBounds,
        xAlign: 'right',
        yAlign: 'bottom',
        xMargin: 10,
        yMargin: 70
      } ) );

      this.addChild( this.popupLayer );
    }
  }

  return densityBuoyancyCommon.register( 'Demo3DScreenView', Demo3DScreenView );
} );
