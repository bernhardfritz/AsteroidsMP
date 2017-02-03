import * as THREE from 'three';
global.THREE = THREE;
import Stats from 'stats.js';
import dat from './dat.gui.js';
import OBJLoader from './OBJLoader';
import GPUParticleSystem from './GPUParticleSystem.js';
import TrackballControls from './TrackballControls.js';
import Spaceship from './Spaceship.js';

class Game {
  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    this.particleSystem = new THREE.GPUParticleSystem({
      maxParticles: 250000
    });
    this.controls = {};
    this.clock = new THREE.Clock(true);
    this.stats = new Stats();
    this.gui = new dat.GUI();
    this.settings = new Settings();
    this.objLoader = new THREE.OBJLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.tick = 0;
    this.spawnerOptions = {};
    this.spaceship = new Spaceship();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    let urls = [
      'textures/Starscape.png',
      'textures/Starscape.png',
      'textures/Starscape.png',
      'textures/Starscape.png',
      'textures/Starscape.png',
      'textures/Starscape.png'
    ];
    let cubeTexture = new THREE.CubeTextureLoader().load(urls);
    cubeTexture.format = THREE.RGBFormat;
    this.scene.background = cubeTexture;

    let ambientLight = new THREE.AmbientLight(0x101030);
		this.scene.add(ambientLight);
		// let directionalLight = new THREE.DirectionalLight(0xffeedd);
		// directionalLight.position.set(0, 0, 1);
		// this.scene.add(directionalLight);

    this.spawnerOptions = {
      spawnRate: 15000,
      horizontalSpeed: 1.5,
      verticalSpeed: 1.33,
      timeScale: 1
    };
    this.scene.add(this.particleSystem);

    this.spaceship.init(this.scene, this.objLoader, this.textureLoader);

    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 1.0;
		this.controls.zoomSpeed = 1.2;
		this.controls.panSpeed = 0.8;
		this.controls.noZoom = false;
		this.controls.noPan = false;
		this.controls.staticMoving = true;
		this.controls.dynamicDampingFactor = 0.3;
		this.controls.keys = [65, 83, 68];

    this.initGui();
  }

  initGui() {
    this.gui.add(this.settings, 'myString');
    this.gui.add(this.settings, 'myNumber');
    this.gui.add(this.settings, 'myBoolean');
    this.gui.add(this.settings, 'myFunction');

    let cameraFolder = this.gui.addFolder('camera');
    let cameraPositionFolder = cameraFolder.addFolder('camera.position');
    cameraPositionFolder.add(this.camera.position, 'x', -100, 100);
    cameraPositionFolder.add(this.camera.position, 'y', -100, 100);
    cameraPositionFolder.add(this.camera.position, 'z', -100, 100);
    let cameraRotationFolder = cameraFolder.addFolder('camera.rotation');
    cameraRotationFolder.add(this.camera.rotation, 'x', -1, 1).step(0.01);
    cameraRotationFolder.add(this.camera.rotation, 'y', -1, 1).step(0.01);
    cameraRotationFolder.add(this.camera.rotation, 'z', -1, 1).step(0.01);
    // let particleSystemFolder = this.gui.addFolder('particleSystem');
    // particleSystemFolder.add(this.options, "velocityRandomness", 0, 3);
		// particleSystemFolder.add(this.options, "positionRandomness", 0, 3);
		// particleSystemFolder.add(this.options, "size", 1, 20);
		// particleSystemFolder.add(this.options, "sizeRandomness", 0, 25);
		// particleSystemFolder.add(this.options, "colorRandomness", 0, 1);
		// particleSystemFolder.add(this.options, "lifetime", 0.1, 10);
		// particleSystemFolder.add(this.options, "turbulence", 0, 1);
    // particleSystemFolder.add(this.options.position, 'x', -10, 10).step(0.01);
    // particleSystemFolder.add(this.options.position, 'y', -10, 10).step(0.01);
    // particleSystemFolder.add(this.options.position, 'z', -10, 10).step(0.01);
    // particleSystemFolder.addColor(this.options, "color").onChange(function(colorValue) {
    //   this.options.color = '0x'+colorValue.toString(16);
    // }.bind(this));
    //
		// particleSystemFolder.add(this.spawnerOptions, "spawnRate", 10, 30000);
		// particleSystemFolder.add(this.spawnerOptions, "timeScale", -1, 1);

    window.addEventListener('resize', function() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.controls.handleResize();
    }.bind(this), false);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.stats.begin();

    let delta = this.clock.getDelta() * this.spawnerOptions.timeScale;
		this.tick += delta;

    if (this.tick < 0) {
      this.tick = 0;
    }
		if (delta > 0) {
			for (var x = 0; x < this.spawnerOptions.spawnRate * delta; x++) {
        this.spaceship.animate(this.particleSystem);
			}
		}
		this.particleSystem.update(this.tick);

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}

class Settings {
  constructor() {
    this.myString = 'helloworld';
    this.myNumber = 1.0;
    this.myBoolean = true;
  }

  myFunction() {
    window.alert(this.myString);
  }
}

window.onload = function() {
  let game = new Game();
  game.init();
  game.animate();
};
