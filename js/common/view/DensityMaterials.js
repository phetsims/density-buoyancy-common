// Copyright 2019-2020, University of Colorado Boulder

/**
 * Provides factory methods for creating MaterialViews for various Materials.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

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
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshStandardMaterial( {
      map: aluminumColorTexture,
      normalMap: aluminumNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: aluminumRoughnessTexture,
      metalnessMap: aluminumMetalnessTexture,
      envMap: reflectedTexture
    } );
  }
}

class BrickMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshStandardMaterial( {
      map: brickColorTexture,
      aoMap: brickAmbientOcclusionTexture,
      normalMap: brickNormalTexture,
      normalScale: new THREE.Vector2( 0.5, -0.5 ),
      roughness: 1,
      metalness: 0,
      envMap: reflectedTexture
    } );
  }
}

class CopperMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshStandardMaterial( {
      map: copperColorTexture,
      normalMap: copperNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: copperRoughnessTexture,
      metalnessMap: copperMetalnessTexture,
      envMap: reflectedTexture
    } );
  }
}

class IceMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshPhysicalMaterial( {
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

      envMap: refractedTexture
    } );
  }
}

// We just use aluminum
class PlatinumMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshStandardMaterial( {
      map: platinumColorTexture,
      normalMap: aluminumNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: aluminumRoughnessTexture,
      roughness: 4,
      metalnessMap: aluminumMetalnessTexture,
      envMapIntensity: 0.5,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
      envMap: reflectedTexture
    } );
  }
}

class SteelMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshStandardMaterial( {
      map: steelColorTexture,
      normalMap: steelNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughnessMap: steelRoughnessTexture,
      metalnessMap: steelMetalnessTexture,
      envMap: reflectedTexture
    } );
  }
}

class StyrofoamMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshStandardMaterial( {
      map: styrofoamColorTexture,
      aoMap: styrofoamAmbientOcclusionTexture,
      normalMap: styrofoamNormalTexture,
      normalScale: new THREE.Vector2( 1, 1 ),
      roughness: 1.5,
      roughnessMap: styrofoamRoughnessTexture,
      metalness: 0,
      envMap: reflectedTexture
    } );
  }
}

class WoodMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshStandardMaterial( {
      map: woodColorTexture,
      normalMap: woodNormalTexture,
      normalScale: new THREE.Vector2( 1, -1 ),
      roughness: 0.8,
      roughnessMap: woodRoughnessTexture,
      metalness: 0,
      envMap: reflectedTexture
    } );
  }
}

class CustomMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   * @param {number} density
   */
  constructor( reflectedTexture, refractedTexture, density ) {
    super( reflectedTexture, refractedTexture );

    const lightness = Material.getCustomLightness( density );
    const color = lightness + lightness * 0x100 + lightness * 0x10000;

    this.material = new THREE.MeshLambertMaterial( {
      color: color
    } );
  }
}

class CustomColoredMaterialView extends MaterialView {
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   * @param {Property.<Color>} colorProperty
   */
  constructor( reflectedTexture, refractedTexture, colorProperty ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshLambertMaterial();

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
  /**
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   */
  constructor( reflectedTexture, refractedTexture ) {
    super( reflectedTexture, refractedTexture );

    this.material = new THREE.MeshLambertMaterial( {
      color: 0xffaa44
    } );
  }
}

class DensityMaterials {
  /**
   * Returns a view for the given Material.
   * @public
   *
   * @param {THREE.Texture} reflectedTexture
   * @param {THREE.Texture} refractedTexture
   * @param {Material} material
   * @returns {MaterialView}
   */
  static getMaterialView( reflectedTexture, refractedTexture, material ) {
    if ( material === Material.ALUMINUM ) {
      return new AluminumMaterialView( reflectedTexture, refractedTexture );
    }
    else if ( material === Material.BRICK ) {
      return new BrickMaterialView( reflectedTexture, refractedTexture );
    }
    else if ( material === Material.COPPER ) {
      return new CopperMaterialView( reflectedTexture, refractedTexture );
    }
    else if ( material === Material.ICE ) {
      return new IceMaterialView( reflectedTexture, refractedTexture );
    }
    else if ( material === Material.PLATINUM ) {
      return new PlatinumMaterialView( reflectedTexture, refractedTexture );
    }
    else if ( material === Material.STEEL ) {
      return new SteelMaterialView( reflectedTexture, refractedTexture );
    }
    else if ( material === Material.STYROFOAM ) {
      return new StyrofoamMaterialView( reflectedTexture, refractedTexture );
    }
    else if ( material === Material.WOOD ) {
      return new WoodMaterialView( reflectedTexture, refractedTexture );
    }
    else if ( material.custom ) {
      if ( material.customColor === null ) {
        return new CustomMaterialView( reflectedTexture, refractedTexture, material.density );
      }
      else {
        return new CustomColoredMaterialView( reflectedTexture, refractedTexture, material.customColor );
      }
    }
    else {
      return new DebugMaterialView( reflectedTexture, refractedTexture );
    }
  }
}

// @public {THREE.Texture}
DensityMaterials.woodColorTexture = woodColorTexture;
DensityMaterials.woodNormalTexture = woodNormalTexture;
DensityMaterials.woodRoughnessTexture = woodRoughnessTexture;

densityBuoyancyCommon.register( 'DensityMaterials', DensityMaterials );
export default DensityMaterials;