// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const DensityBuoyancyCommonColorProfile = require( 'DENSITY_BUOYANCY_COMMON/common/view/DensityBuoyancyCommonColorProfile' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );

  // strings
  const kilogramsPerLiterPatternString = require( 'string!DENSITY_BUOYANCY_COMMON/kilogramsPerLiterPattern' );

  // constants
  const materials = [
    Material.HUMAN,
    Material.GLASS,
    Material.TITANIUM,
    Material.STEEL,
    Material.COPPER
  ];
  const WIDTH = 400;
  const HEIGHT = 22;
  const MAX_DENSITY = 10000;
  const LINE_PADDING = 2;
  const mvt = density => WIDTH * density / MAX_DENSITY;

  class DensityReadoutNode extends Node {

    /**
     * @param {Property.<number>} densityAProperty
     * @param {Property.<number>} densityBProperty
     * @param {Property.<boolean>} secondaryMassVisibleProperty
     */
    constructor( densityAProperty, densityBProperty, secondaryMassVisibleProperty ) {
      super();

      this.addChild( new Rectangle( 0, 0, WIDTH, HEIGHT, {
        stroke: 'black'
      } ) );

      const lineOptions = { stroke: 'black' };
      materials.forEach( material => {
        const x = mvt( material.density );
        const label = new Text( material.name, {
          font: new PhetFont( 10 ),
          centerX: x,
          centerY: HEIGHT / 2
        } );
        this.addChild( label );
        this.addChild( new Line( x, 0, x, label.top - LINE_PADDING, lineOptions ) );
        this.addChild( new Line( x, HEIGHT, x, label.bottom + LINE_PADDING, lineOptions ) );
      } );

      const arrowOptions = {
        headHeight: 4,
        headWidth: 5,
        tailWidth: 1,
        stroke: null
      };
      const labelOptions = {
        font: new PhetFont( { size: 10, weight: 'bold' } )
      };

      const primaryArrow = new ArrowNode( 0, -7, 0, 0, merge( {
        fill: DensityBuoyancyCommonColorProfile.labelAProperty
      }, arrowOptions ) );
      const primaryLabel = new Text( '', merge( {
        fill: DensityBuoyancyCommonColorProfile.labelAProperty
      }, labelOptions ) );
      const primaryMarker = new Node( {
        children: [
          primaryArrow,
          primaryLabel
        ]
      } );
      this.addChild( primaryMarker );

      const secondaryArrow = new ArrowNode( 0, 7, 0, 0, merge( {
        fill: DensityBuoyancyCommonColorProfile.labelBProperty
      }, arrowOptions ) );
      const secondaryLabel = new Text( '', merge( {
        fill: DensityBuoyancyCommonColorProfile.labelBProperty
      }, labelOptions ) );
      const secondaryMarker = new Node( {
        children: [
          secondaryArrow,
          secondaryLabel
        ],
        y: HEIGHT
      } );
      this.addChild( secondaryMarker );

      // TODO: maxWidth

      densityAProperty.link( density => {
        primaryMarker.x = mvt( density );
        primaryLabel.text = StringUtils.fillIn( kilogramsPerLiterPatternString, {
          value: Util.toFixed( density / 1000, 2 )
        } );
        primaryLabel.centerBottom = primaryArrow.centerTop;
      } );

      densityBProperty.link( density => {
        secondaryMarker.x = mvt( density );
        secondaryLabel.text = StringUtils.fillIn( kilogramsPerLiterPatternString, {
          value: Util.toFixed( density / 1000, 2 )
        } );
        secondaryLabel.centerTop = secondaryArrow.centerBottom;
      } );

      secondaryMassVisibleProperty.linkAttribute( secondaryMarker, 'visible' );
    }
  }

  return densityBuoyancyCommon.register( 'DensityReadoutNode', DensityReadoutNode );
} );
