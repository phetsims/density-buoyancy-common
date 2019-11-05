// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Complex = require( 'DOT/Complex' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Mass = require( 'DENSITY_BUOYANCY_COMMON/common/model/Mass' );
  const merge = require( 'PHET_CORE/merge' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const BODY_CORNER_RADIUS = 0.03;
  const CAP_CORNER_RADIUS = 0.03;
  const LIP_CORNER_RADIUS = 0.02;
  const CAP_RADIUS = 0.23;
  const LIP_RADIUS = 0.285;
  const NECK_RADIUS = 0.187;
  const FULL_RADIUS = 0.85;
  const BODY_RADIUS = FULL_RADIUS - BODY_CORNER_RADIUS;
  // const BASE_TIP_RADIUS = 0.6;
  const CAP_LENGTH = 0.28;
  const GAP_LENGTH = 0.03;
  const LIP_LENGTH = LIP_CORNER_RADIUS * 2;
  const TAPER_LENGTH = 1.35;
  const BODY_LENGTH = 2.25;
  // const BASE_SADDLE_LENGTH = 0.7;
  // const BASE_TIP_LENGTH = 0.85;
  const CAP_BODY_LENGTH = CAP_LENGTH - CAP_CORNER_RADIUS;
  // const FULL_LENGTH = CAP_CORNER_RADIUS + CAP_BODY_LENGTH + GAP_LENGTH + LIP_LENGTH + TAPER_LENGTH + BODY_CORNER_RADIUS + BODY_LENGTH + BODY_CORNER_RADIUS + BASE_TIP_LENGTH;
  const CORNER_SEGMENTS = 8;
  const TAPER_SEGMENTS = 20;

  class Bottle extends Mass {
    /**
     * @param {Engine} engine
     * @param {Object} config
     */
    constructor( engine, config ) {
      const vertices = [];
      const volume = 0;

      // TODO
      config = merge( {
        body: engine.createBottle( vertices ),
        shape: Shape.polygon( vertices ),
        volume: volume,
        canRotate: false

        // material
      }, config );

      assert && assert( !config.canRotate );

      super( engine, config );

      // Step information
      this.stepArea = 0;
      this.stepMaximumVolume = 0;
    }

    updateStepInformation() {
      // this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

      // const xOffset = this.stepMatrix.m02();
      // const yOffset = this.stepMatrix.m12();

      // this.stepX = xOffset;
      // this.stepBottom = yOffset + this.sizeProperty.value.minY;
      // this.stepTop = yOffset + this.sizeProperty.value.maxY;

      // this.stepArea = this.sizeProperty.value.width * this.sizeProperty.value.depth;
      // this.stepMaximumVolume = this.stepArea * this.sizeProperty.value.height;
    }

    /**
     * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
     * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
     * if there is no intersection, null will be returned.
     * @public
     * @override
     *
     * @param {Ray3} ray
     * @param {boolean} isTouch
     * @returns {number|null}
     */
    intersect( ray, isTouch ) {

      // TODO
      return null;
    }

    /**
     * Returns the cumulative displaced volume of this object up to a given y level.
     * @public
     * @override
     *
     * Assumes step information was updated.
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getDisplacedArea( liquidLevel ) {
      const bottom = this.stepBottom;
      const top = this.stepTop;

      const ratio = ( liquidLevel - bottom ) / ( top - bottom );

      return 0 * ratio; // TODO
    }

    /**
     * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
     * @public
     * @override
     *
     * Assumes step information was updated.
     *
     * @param {number} liquidLevel
     * @returns {number}
     */
    getDisplacedVolume( liquidLevel ) {
      const bottom = this.stepBottom;
      const top = this.stepTop;

      const ratio = ( liquidLevel - bottom ) / ( top - bottom );

      return 0 * ratio; // TODO
    }

    reset() {
      super.reset();
    }

    static getParametricFrom0011( r ) {
      // from mathematica:
      // 1/2 - (1 - I Sqrt[3])/(4 (1 - 2 r + 2 Sqrt[-r + r^2])^(1/3)) - 1/4 (1 + I Sqrt[3]) (1 - 2 r + 2 Sqrt[-r + r^2])^(1/3)
      const body = new Complex( 1 - 2 * r, 2 * Math.sqrt( r - r * r ) ).powerByReal( 1 / 3 );
      const complex = new Complex( 0.5, 0 ).minus(
        new Complex( 1, -Math.sqrt( 3 ) ).dividedBy(
          body.times( new Complex( 4, 0 ) )
        )
      ).minus(
        new Complex( 1 / 4, Math.sqrt( 3 ) / 4 ).times( body )
      );

      return complex.real;
    }

    static getTaperParametricProfilePoint( t ) {
      const TAPER_START = CAP_CORNER_RADIUS + CAP_BODY_LENGTH + GAP_LENGTH + LIP_LENGTH;
      const TAPER_END = TAPER_START + TAPER_LENGTH;

      const mt = 1 - t;
      const mmm = mt * mt * mt;
      const mmt = 3 * mt * mt * t;
      const mtt = 3 * mt * t * t;
      const ttt = t * t * t;

      const x0 = TAPER_START;
      const x1 = TAPER_START + 0.4 * ( TAPER_END - TAPER_START );
      const x2 = TAPER_START + 0.2 * ( TAPER_END - TAPER_START );
      const x3 = TAPER_END;

      return new Vector2(
        x0 * mmm +
        x1 * mmt +
        x2 * mtt +
        x3 * ttt,
        NECK_RADIUS + ( t * t * ( 3 - 2 * t ) ) * ( FULL_RADIUS - NECK_RADIUS )
      );
    }

    /**
     * Returns a list of points in (x,r) that is the cross-section profile of the cap.
     * @public
     *
     * @returns {Array.<Vector2>}
     */
    static getCapProfile() {
      return [
        new Vector2( 0, 0 ),
        ..._.range( 0, CORNER_SEGMENTS ).map( i => {
          const theta = Math.PI / 2 * i / CORNER_SEGMENTS;
          return new Vector2(
            CAP_CORNER_RADIUS * ( 1 - Math.cos( theta ) ),
            CAP_RADIUS + CAP_CORNER_RADIUS * ( -1 + Math.sin( theta ) )
          );
        } ),
        new Vector2( CAP_CORNER_RADIUS, CAP_RADIUS ),
        new Vector2( CAP_CORNER_RADIUS + CAP_BODY_LENGTH, CAP_RADIUS ),
        new Vector2( CAP_CORNER_RADIUS + CAP_BODY_LENGTH, NECK_RADIUS )
      ];
    }

    /**
     * Returns a list of points in (x,r) that is the cross-section profile of the non-base portion of the bottle.
     * @public
     *
     * @returns {Array.<Vector2>}
     */
    static getMainBottleProfile() {
      const LIP_START = CAP_CORNER_RADIUS + CAP_BODY_LENGTH + GAP_LENGTH;
      const LIP_END = LIP_START + LIP_LENGTH;
      const TAPER_END = LIP_END + TAPER_LENGTH;
      const BODY_START = TAPER_END + BODY_CORNER_RADIUS;
      const BODY_END = BODY_START + BODY_LENGTH;
      return [
        new Vector2( CAP_CORNER_RADIUS, NECK_RADIUS ),
        new Vector2( CAP_CORNER_RADIUS + CAP_BODY_LENGTH + GAP_LENGTH, NECK_RADIUS ),
        ..._.range( 0, CORNER_SEGMENTS * 2 ).map( i => {
          const theta = Math.PI - Math.PI / 2 * i / CORNER_SEGMENTS;
          return new Vector2(
            LIP_START + LIP_CORNER_RADIUS * ( 1 + Math.cos( theta ) ),
            LIP_RADIUS + LIP_CORNER_RADIUS * ( -1 + Math.sin( theta ) )
          );
        } ),
        new Vector2( LIP_END, LIP_RADIUS - LIP_CORNER_RADIUS ),
        new Vector2( LIP_END, NECK_RADIUS ),
        ..._.range( 1, TAPER_SEGMENTS ).map( i => Bottle.getTaperParametricProfilePoint( i / TAPER_SEGMENTS ) ),
        ..._.range( 0, CORNER_SEGMENTS ).map( i => {
          const theta = Math.PI / 2 * ( 1 - i / CORNER_SEGMENTS );
          return new Vector2(
            TAPER_END + BODY_CORNER_RADIUS * Math.cos( theta ),
            BODY_RADIUS + BODY_CORNER_RADIUS * Math.sin( theta )
          );
        } ),
        new Vector2( BODY_START, BODY_RADIUS ),
        ..._.range( 0, CORNER_SEGMENTS ).map( i => {
          const theta = Math.PI / 2 * i / CORNER_SEGMENTS;
          return new Vector2(
            BODY_END + BODY_CORNER_RADIUS * ( 1 - Math.cos( theta ) ),
            BODY_RADIUS + BODY_CORNER_RADIUS * Math.sin( theta )
          );
        } ),
        new Vector2( BODY_END + BODY_CORNER_RADIUS, FULL_RADIUS )
      ];
    }

    static getDebugCanvas() {
      const canvas = document.createElement( 'canvas' );
      const context = canvas.getContext( '2d' );

      canvas.width = 800;
      canvas.height = 400;

      const scale = canvas.width / 5;

      const mapX = x => ( x + 0.07 ) * scale;
      const mapY = y => -y * scale + canvas.height / 2;

      // context.lineWidth = 0.5;

      context.strokeStyle = 'red';
      context.beginPath();
      const capProfile = Bottle.getCapProfile();
      capProfile.forEach( p => context.lineTo( mapX( p.x ), mapY( p.y ) ) );
      context.stroke();
      context.beginPath();
      capProfile.forEach( p => context.lineTo( mapX( p.x ), mapY( -p.y ) ) );
      context.stroke();

      context.strokeStyle = 'blue';
      context.beginPath();
      const mainBottleProfile = Bottle.getMainBottleProfile();
      mainBottleProfile.forEach( p => context.lineTo( mapX( p.x ), mapY( p.y ) ) );
      context.stroke();
      context.beginPath();
      mainBottleProfile.forEach( p => context.lineTo( mapX( p.x ), mapY( -p.y ) ) );
      context.stroke();

      while ( document.body.childNodes[ 0 ] ) {
        document.body.removeChild( document.body.childNodes[ 0 ] );
      }
      document.body.appendChild( canvas );
      document.body.style.background = 'white';

      return canvas;
    }
  }

  return densityBuoyancyCommon.register( 'Bottle', Bottle );
} );
