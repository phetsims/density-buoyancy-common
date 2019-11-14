// Copyright 2019, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const CameraMaterialView = require( 'DENSITY_BUOYANCY_COMMON/common/view/CameraMaterialView' );
  const densityBuoyancyCommon = require( 'DENSITY_BUOYANCY_COMMON/densityBuoyancyCommon' );
  const Material = require( 'DENSITY_BUOYANCY_COMMON/common/model/Material' );
  const MaterialView = require( 'DENSITY_BUOYANCY_COMMON/common/view/MaterialView' );
  const ThreeUtil = require( 'MOBIUS/ThreeUtil' );
  const Util = require( 'DOT/Util' );

  // constants
  const Bricks25AOImage = require( 'image!DENSITY_BUOYANCY_COMMON/Bricks25_AO.jpg' );
  const Bricks25ColImage = require( 'image!DENSITY_BUOYANCY_COMMON/Bricks25_col.jpg' );
  const Bricks25NrmImage = require( 'image!DENSITY_BUOYANCY_COMMON/Bricks25_nrm.jpg' );
  const DiamondPlate01ColImage = require( 'image!DENSITY_BUOYANCY_COMMON/DiamondPlate01_col.jpg' );
  const DiamondPlate01MetImage = require( 'image!DENSITY_BUOYANCY_COMMON/DiamondPlate01_met.jpg' );
  const DiamondPlate01NrmImage = require( 'image!DENSITY_BUOYANCY_COMMON/DiamondPlate01_nrm.jpg' );
  const DiamondPlate01RghImage = require( 'image!DENSITY_BUOYANCY_COMMON/DiamondPlate01_rgh.jpg' );
  const Ice01AlphaImage = require( 'image!DENSITY_BUOYANCY_COMMON/Ice01_alpha.jpg' );
  const Ice01ColImage = require( 'image!DENSITY_BUOYANCY_COMMON/Ice01_col.jpg' );
  const Ice01NrmImage = require( 'image!DENSITY_BUOYANCY_COMMON/Ice01_nrm.jpg' );
  const Metal08ColImage = require( 'image!DENSITY_BUOYANCY_COMMON/Metal08_col.jpg' );
  const Metal08MetImage = require( 'image!DENSITY_BUOYANCY_COMMON/Metal08_met.jpg' );
  const Metal08NrmImage = require( 'image!DENSITY_BUOYANCY_COMMON/Metal08_nrm.jpg' );
  const Metal08RghImage = require( 'image!DENSITY_BUOYANCY_COMMON/Metal08_rgh.jpg' );
  const Metal10ColImage = require( 'image!DENSITY_BUOYANCY_COMMON/Metal10_col.jpg' );
  const Metal10MetImage = require( 'image!DENSITY_BUOYANCY_COMMON/Metal10_met.jpg' );
  const Metal10NrmImage = require( 'image!DENSITY_BUOYANCY_COMMON/Metal10_nrm.jpg' );
  const Metal10RghImage = require( 'image!DENSITY_BUOYANCY_COMMON/Metal10_rgh.jpg' );
  const Styrofoam001AOImage = require( 'image!DENSITY_BUOYANCY_COMMON/Styrofoam_001_AO.jpg' );
  const Styrofoam001colImage = require( 'image!DENSITY_BUOYANCY_COMMON/Styrofoam_001_col.jpg' );
  const Styrofoam001nrmImage = require( 'image!DENSITY_BUOYANCY_COMMON/Styrofoam_001_nrm.jpg' );
  const Styrofoam001rghImage = require( 'image!DENSITY_BUOYANCY_COMMON/Styrofoam_001_rgh.jpg' );
  const Wood26ColImage = require( 'image!DENSITY_BUOYANCY_COMMON/Wood26_col.jpg' );
  const Wood26NrmImage = require( 'image!DENSITY_BUOYANCY_COMMON/Wood26_nrm.jpg' );
  const Wood26RghImage = require( 'image!DENSITY_BUOYANCY_COMMON/Wood26_rgh.jpg' );

  function toWrappedTexture( image ) {
    const texture = ThreeUtil.imageToTexture( image );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set( 4, 4 ); // TODO: any performance or quality due to this?
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
  const steelColorTexture = toWrappedTexture( DiamondPlate01ColImage );
  const steelMetalnessTexture = toWrappedTexture( DiamondPlate01MetImage );
  const steelNormalTexture = toWrappedTexture( DiamondPlate01NrmImage );
  const steelRoughnessTexture = toWrappedTexture( DiamondPlate01RghImage );
  const styrofoamAmbientOcclusionTexture = toWrappedTexture( Styrofoam001AOImage );
  const styrofoamColorTexture = toWrappedTexture( Styrofoam001colImage );
  const styrofoamNormalTexture = toWrappedTexture( Styrofoam001nrmImage );
  const styrofoamRoughnessTexture = toWrappedTexture( Styrofoam001rghImage );
  const woodColorTexture = toWrappedTexture( Wood26ColImage );
  const woodNormalTexture = toWrappedTexture( Wood26NrmImage );
  const woodRoughnessTexture = toWrappedTexture( Wood26RghImage );

  class AluminumMaterialView extends CameraMaterialView {
    constructor() {
      super();

      this.material = new THREE.MeshStandardMaterial( {
        map: aluminumColorTexture,
        normalMap: aluminumNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: aluminumRoughnessTexture,
        metalnessMap: aluminumMetalnessTexture,
        envMap: this.getTexture()
      } );
    }
  }

  class BrickMaterialView extends CameraMaterialView {
    constructor() {
      super();

      this.material = new THREE.MeshStandardMaterial( {
        map: brickColorTexture,
        aoMap: brickAmbientOcclusionTexture,
        normalMap: brickNormalTexture,
        normalScale: new THREE.Vector2( 0.5, -0.5 ),
        roughness: 1,
        metalness: 0,
        envMap: this.getTexture()
      } );
    }
  }

  class CopperMaterialView extends CameraMaterialView {
    constructor() {
      super();

      this.material = new THREE.MeshStandardMaterial( {
        map: copperColorTexture,
        normalMap: copperNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: copperRoughnessTexture,
        metalnessMap: copperMetalnessTexture,
        envMap: this.getTexture()
      } );
    }
  }

  class IceMaterialView extends CameraMaterialView {
    constructor() {
      super();

      const texture = this.getTexture();

      texture.mapping = THREE.CubeRefractionMapping;
      texture.needsUpdate = true;

      this.material = new THREE.MeshPhysicalMaterial( {
        map: iceColorTexture,
        alphaMap: iceAlphaTexture,
        normalMap: iceNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughness: 0.1,
        refractionRatio: 1 / 1.309,
        metalness: 0.4,
        clearCoat: 1,
        reflectivity: 1,
        envMap: texture,
        envMapIntensity: 2, // is this too much cheating?

        transparent: true,
        side: THREE.DoubleSide
      } );
    }
  }

  class PlasticMaterialView extends CameraMaterialView {
    constructor() {
      super();

      const texture = this.getTexture();

      texture.mapping = THREE.CubeRefractionMapping;
      texture.needsUpdate = true;

      this.material = new THREE.MeshPhysicalMaterial( {
        color: 0xff0000,
        opacity: 0.5,
        roughness: 0.1,
        refractionRatio: 1 / 1.309,
        metalness: 0.1,
        clearCoat: 1,
        reflectivity: 1,
        envMap: texture,
        envMapIntensity: 2, // is this too much cheating?

        transparent: true,
        side: THREE.DoubleSide
      } );
    }
  }

  // We just use aluminum
  class PlatinumMaterialView extends CameraMaterialView {
    constructor() {
      super();

      this.material = new THREE.MeshStandardMaterial( {
        map: aluminumColorTexture,
        normalMap: aluminumNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: aluminumRoughnessTexture,
        metalnessMap: aluminumMetalnessTexture,
        envMap: this.getTexture()
      } );
    }
  }

  class SteelMaterialView extends CameraMaterialView {
    constructor() {
      super();

      this.material = new THREE.MeshStandardMaterial( {
        map: steelColorTexture,
        normalMap: steelNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: steelRoughnessTexture,
        metalnessMap: steelMetalnessTexture,
        envMap: this.getTexture()
      } );
    }
  }

  class StyrofoamMaterialView extends CameraMaterialView {
    constructor() {
      super();

      this.material = new THREE.MeshStandardMaterial( {
        map: styrofoamColorTexture,
        aoMap: styrofoamAmbientOcclusionTexture,
        normalMap: styrofoamNormalTexture,
        normalScale: new THREE.Vector2( 1, 1 ),
        roughnessMap: styrofoamRoughnessTexture,
        metalness: 0,
        envMap: this.getTexture()
      } );
    }
  }

  class WoodMaterialView extends CameraMaterialView {
    constructor() {
      super();

      this.material = new THREE.MeshStandardMaterial( {
        map: woodColorTexture,
        normalMap: woodNormalTexture,
        normalScale: new THREE.Vector2( 1, -1 ),
        roughnessMap: woodRoughnessTexture,
        metalness: 0,
        envMap: this.getTexture()
      } );
    }
  }

  class CustomMaterialView extends MaterialView {
    constructor( density ) {
      super();

      const lightness = Util.roundSymmetric( Util.clamp( Util.linear( 1, -2, 0, 255, Util.log10( density / 1000 ) ), 0, 255 ) );
      const color = lightness + lightness * 0x100 + lightness * 0x10000;

      this.material = new THREE.MeshLambertMaterial( {
        color: color
      } );
    }
  }

  class CustomColoredMaterialView extends MaterialView {
    constructor( colorProperty ) {
      super();

      this.material = new THREE.MeshLambertMaterial();

      colorProperty.link( color => {
        this.material.color = ThreeUtil.colorToThree( color );
      } );
    }
  }

  class DebugMaterialView extends MaterialView {
    constructor() {
      super();

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

    static getBottleMaterialView() {
      return new PlasticMaterialView();
    }
  }

  return densityBuoyancyCommon.register( 'DensityMaterials', DensityMaterials );
} );
