// Copyright 2019-2021, University of Colorado Boulder

/**
 * Provides factory methods for creating MaterialViews for various Materials.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import Bricks25AOImage from '../../../images/Bricks25_AO_jpg.js';
import Bricks25ColImage from '../../../images/Bricks25_col_jpg.js';
import Bricks25NrmImage from '../../../images/Bricks25_nrm_jpg.js';
import DiamondPlate01ColImage from '../../../images/DiamondPlate01_col_jpg.js';
import DiamondPlate01MetImage from '../../../images/DiamondPlate01_met_jpg.js';
import DiamondPlate01NrmImage from '../../../images/DiamondPlate01_nrm_jpg.js';
import DiamondPlate01RghImage from '../../../images/DiamondPlate01_rgh_jpg.js';
import Ice01AlphaImage from '../../../images/Ice01_alpha_jpg.js';
import Ice01ColImage from '../../../images/Ice01_col_jpg.js';
import Ice01NrmImage from '../../../images/Ice01_nrm_jpg.js';
import Metal08ColImage from '../../../images/Metal08_col_jpg.js';
import Metal08MetImage from '../../../images/Metal08_met_jpg.js';
import Metal08NrmImage from '../../../images/Metal08_nrm_jpg.js';
import Metal08RghImage from '../../../images/Metal08_rgh_jpg.js';
import Metal10ColBrightenedImage from '../../../images/Metal10_col_brightened_jpg.js';
import Metal10ColImage from '../../../images/Metal10_col_jpg.js';
import Metal10MetImage from '../../../images/Metal10_met_jpg.js';
import Metal10NrmImage from '../../../images/Metal10_nrm_jpg.js';
import Metal10RghImage from '../../../images/Metal10_rgh_jpg.js';
import Styrofoam001AOImage from '../../../images/Styrofoam_001_AO_jpg.js';
import Styrofoam001ColImage from '../../../images/Styrofoam_001_col_jpg.js';
import Styrofoam001NrmImage from '../../../images/Styrofoam_001_nrm_jpg.js';
import Styrofoam001RghImage from '../../../images/Styrofoam_001_rgh_jpg.js';
import Wood26ColImage from '../../../images/Wood26_col_jpg.js';
import Wood26NrmImage from '../../../images/Wood26_nrm_jpg.js';
import Wood26RghImage from '../../../images/Wood26_rgh_jpg.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Material from '../model/Material.js';
import MaterialView from './MaterialView.js';

// constants

function toWrappedTexture( image ) {
  const texture = ThreeUtils.imageToTexture( image, true );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Simplified environment map to give a nice reflective appearance. We compute it per-pixel
let envMapTexture = null;
function getEnvironmentTexture() {
  const size = 32;
  if ( !envMapTexture ) {
    const canvas = document.createElement( 'canvas' );
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext( '2d' );

    const imageData = context.getImageData( 0, 0, size, size );

    // For each pixel
    for ( let i = 0; i < 32 * 32; i++ ) {
      const index = i * 4;

      // Determine spherical coordinates for the equirectangular mapping
      const theta = ( i % size ) / size * Math.PI * 2;
      const phi = Math.PI * ( 0.5 - Math.floor( i / size ) / ( size - 1 ) );

      // Get a euclidean vector
      const v = new Vector3(
        -Math.cos( phi ) * Math.cos( theta ),
        Math.sin( phi ),
        Math.cos( phi ) * Math.sin( theta )
      );

      // Our light direction
      const light = new Vector3( -1 / 2, 1.5, 0.8 / 2 );

      // Front/top lighting + light
      const value = v.y > 0 || v.z < 0 ? 1 : v.dot( light ) / 2;

      imageData.data[ index + 0 ] = Utils.clamp( Math.floor( value * 255 + 127 ), 0, 255 );
      imageData.data[ index + 1 ] = Utils.clamp( Math.floor( value * 255 + 127 ), 0, 255 );
      imageData.data[ index + 2 ] = Utils.clamp( Math.floor( value * 255 + 127 ), 0, 255 );
      imageData.data[ index + 3 ] = 255;
    }

    context.putImageData( imageData, 0, 0 );

    envMapTexture = new THREE.CanvasTexture( canvas, THREE.EquirectangularReflectionMapping, THREE.RepeatWrapping, THREE.RepeatWrapping );
  }
  return envMapTexture;
}

// textures
const aluminumColorTexture = toWrappedTexture( Metal10ColImage );
const aluminumMetalnessTexture = toWrappedTexture( Metal10MetImage );
const aluminumNormalTexture = toWrappedTexture( Metal10NrmImage );
const aluminumRoughnessTexture = toWrappedTexture( Metal10RghImage );
const brickAmbientOcclusionTexture = toWrappedTexture( Bricks25AOImage );
const brickColorTexture = toWrappedTexture( Bricks25ColImage );
const brickNormalTexture = toWrappedTexture( Bricks25NrmImage );
const copperColorTexture = toWrappedTexture( Metal08ColImage );
const copperMetalnessTexture = toWrappedTexture( Metal08MetImage );
const copperNormalTexture = toWrappedTexture( Metal08NrmImage );
const copperRoughnessTexture = toWrappedTexture( Metal08RghImage );
const iceAlphaTexture = toWrappedTexture( Ice01AlphaImage );
const iceColorTexture = toWrappedTexture( Ice01ColImage );
const iceNormalTexture = toWrappedTexture( Ice01NrmImage );
const platinumColorTexture = toWrappedTexture( Metal10ColBrightenedImage );
const steelColorTexture = toWrappedTexture( DiamondPlate01ColImage );
const steelMetalnessTexture = toWrappedTexture( DiamondPlate01MetImage );
const steelNormalTexture = toWrappedTexture( DiamondPlate01NrmImage );
const steelRoughnessTexture = toWrappedTexture( DiamondPlate01RghImage );
const styrofoamAmbientOcclusionTexture = toWrappedTexture( Styrofoam001AOImage );
const styrofoamColorTexture = toWrappedTexture( Styrofoam001ColImage );
const styrofoamNormalTexture = toWrappedTexture( Styrofoam001NrmImage );
const styrofoamRoughnessTexture = toWrappedTexture( Styrofoam001RghImage );
const woodColorTexture = toWrappedTexture( Wood26ColImage );
const woodNormalTexture = toWrappedTexture( Wood26NrmImage );
const woodRoughnessTexture = toWrappedTexture( Wood26RghImage );

class AluminumMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: aluminumColorTexture,
      normalMap: aluminumNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: aluminumRoughnessTexture,
      metalnessMap: aluminumMetalnessTexture,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class BrickMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: brickColorTexture,
      aoMap: brickAmbientOcclusionTexture,
      normalMap: brickNormalTexture,
      normalScale: new THREE.Vector2( 0.5, -0.5 ),
      roughness: 1,
      metalness: 0,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class CopperMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: copperColorTexture,
      normalMap: copperNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: copperRoughnessTexture,
      metalnessMap: copperMetalnessTexture,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class IceMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshPhysicalMaterial( {
      map: iceColorTexture,
      alphaMap: iceAlphaTexture,
      normalMap: iceNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughness: 0.7,
      clearcoatRoughness: 0.7,
      refractionRatio: 1 / 1.309,
      metalness: 0.4,
      clearCoat: 1,
      reflectivity: 1,
      envMapIntensity: 2, // is this too much cheating?

      transparent: true,
      side: THREE.DoubleSide,

      envMap: getEnvironmentTexture()
    } ) );
  }
}

// We just use aluminum
class PlatinumMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: platinumColorTexture,
      normalMap: aluminumNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: aluminumRoughnessTexture,
      roughness: 4,
      metalnessMap: aluminumMetalnessTexture,
      envMapIntensity: 0.5,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class SteelMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: steelColorTexture,
      normalMap: steelNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: steelRoughnessTexture,
      metalnessMap: steelMetalnessTexture,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class StyrofoamMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: styrofoamColorTexture,
      aoMap: styrofoamAmbientOcclusionTexture,
      normalMap: styrofoamNormalTexture,
      normalScale: new THREE.Vector2( 1, 1 ),
      roughness: 1.5,
      roughnessMap: styrofoamRoughnessTexture,
      metalness: 0,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class WoodMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshStandardMaterial( {
      map: woodColorTexture,
      normalMap: woodNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughness: 0.8,
      roughnessMap: woodRoughnessTexture,
      metalness: 0,
      envMap: getEnvironmentTexture()
    } ) );
  }
}

class CustomMaterialView extends MaterialView {
  /**
   * @param {number} density
   */
  constructor( density ) {
    const lightness = Material.getCustomLightness( density );
    const color = lightness + lightness * 0x100 + lightness * 0x10000;

    super( new THREE.MeshLambertMaterial( {
      color: color
    } ) );
  }
}

class CustomColoredMaterialView extends MaterialView {
  /**
   * @param {Property.<Color>} colorProperty
   */
  constructor( colorProperty ) {
    super( new THREE.MeshLambertMaterial() );

    // @private
    this.colorProperty = colorProperty;

    // @private {function}
    this.listener = color => {
      this.material.color = ThreeUtils.colorToThree( color );
    };
    this.colorProperty.link( this.listener );
  }

  /**
   * Releases references
   * @public
   * @override
   */
  dispose() {
    this.colorProperty.unlink( this.listener );

    super.dispose();
  }
}

class DebugMaterialView extends MaterialView {
  constructor() {
    super( new THREE.MeshLambertMaterial( {
      color: 0xffaa44
    } ) );
  }
}

class DensityMaterials {
  /**
   * Returns a view for the given Material.
   * @public
   *
   * @param {Material} material
   * @returns {MaterialView}
   */
  static getMaterialView( material ) {
    if ( material === Material.ALUMINUM ) {
      return new AluminumMaterialView();
    }
    else if ( material === Material.BRICK ) {
      return new BrickMaterialView();
    }
    else if ( material === Material.COPPER ) {
      return new CopperMaterialView();
    }
    else if ( material === Material.ICE ) {
      return new IceMaterialView();
    }
    else if ( material === Material.PLATINUM ) {
      return new PlatinumMaterialView();
    }
    else if ( material === Material.STEEL ) {
      return new SteelMaterialView();
    }
    else if ( material === Material.STYROFOAM ) {
      return new StyrofoamMaterialView();
    }
    else if ( material === Material.WOOD ) {
      return new WoodMaterialView();
    }
    else if ( material.custom ) {
      if ( material.customColor === null ) {
        return new CustomMaterialView( material.density );
      }
      else {
        return new CustomColoredMaterialView( material.customColor );
      }
    }
    else {
      return new DebugMaterialView();
    }
  }
}

// @public {THREE.Texture}
DensityMaterials.woodColorTexture = woodColorTexture;
DensityMaterials.woodNormalTexture = woodNormalTexture;
DensityMaterials.woodRoughnessTexture = woodRoughnessTexture;

densityBuoyancyCommon.register( 'DensityMaterials', DensityMaterials );
export default DensityMaterials;