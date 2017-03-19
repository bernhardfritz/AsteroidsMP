import * as THREE from 'three';
global.THREE = THREE;
import Matter from 'matter-js';
import Stats from 'stats.js';
import dat from './dat.gui.js';
import OBJLoader from './OBJLoader';
import MTLLoader from './MTLLoader';
import GPUParticleSystem from './GPUParticleSystem.js';
import TrackballControls from './TrackballControls.js';
import TWEEN from 'tween.js';
import Spaceship from './Spaceship.js';
import Earth from './Earth.js';
import Asteroid from './Asteroid.js';

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Game {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.engine = Matter.Engine.create({render: {visible: false}});
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.particleSystem = new THREE.GPUParticleSystem({
      maxParticles: 250000
    });
    this.controls = {};
    this.clock = new THREE.Clock(true);
    this.stats = new Stats();
    this.gui = new dat.GUI();
    this.objLoader = new THREE.OBJLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.mtlLoader = new THREE.MTLLoader();
    this.tick = 0;
    this.spawnerOptions = {};
    this.spaceship = new Spaceship();
    this.earth = new Earth();
    this.asteroid = new Asteroid();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.engine.world.gravity.y = 0;

    this.camera.position.set(0, 0, 500);
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

		this.scene.add(new THREE.AmbientLight(0x101030));
    this.scene.add(new THREE.HemisphereLight(0x443333, 0x111122));

    // let directionalLight = new THREE.DirectionalLight(0xffeedd);
		// directionalLight.position.set(1, 1, 1);
    // directionalLight.intensity = 1.0; // 0.25
		// this.scene.add(directionalLight);

    let spotLight = new THREE.SpotLight(0xffffbb, 2);
    spotLight.position.set(1, 1, 1);
    spotLight.position.multiplyScalar(100000);
    this.scene.add(spotLight);

    // let axes = new THREE.AxisHelper(100);
    // this.scene.add(axes);

    this.spawnerOptions = {
      spawnRate: 15000,
      timeScale: 1
    };
    this.scene.add(this.particleSystem);

    this.spaceship.init(this.scene, this.objLoader, this.textureLoader, this.engine);

    this.earth.init(this.scene);

    this.asteroid.init(this.scene, this.objLoader, this.mtlLoader);

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

    Matter.Engine.run(this.engine);
  }

  initGui() {
    let cameraFolder = this.gui.addFolder('camera');
    let cameraPositionFolder = cameraFolder.addFolder('camera.position');
    cameraPositionFolder.add(this.camera.position, 'x', -500, 500);
    cameraPositionFolder.add(this.camera.position, 'y', -500, 500);
    cameraPositionFolder.add(this.camera.position, 'z', -500, 500);
    let cameraRotationFolder = cameraFolder.addFolder('camera.rotation');
    cameraRotationFolder.add(this.camera.rotation, 'x', 0, Math.PI).step(0.01);
    cameraRotationFolder.add(this.camera.rotation, 'y', 0, Math.PI).step(0.01);
    cameraRotationFolder.add(this.camera.rotation, 'z', 0, Math.PI).step(0.01);

    let spawnerOptionsFolder = this.gui.addFolder('spawnerOptions');
    spawnerOptionsFolder.add(this.spawnerOptions, 'spawnRate', 10, 30000);
    spawnerOptionsFolder.add(this.spawnerOptions, 'timeScale', -1, 1);

    this.spaceship.initGui(this.gui);

    window.addEventListener('resize', function() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.controls.handleResize();
    }.bind(this), false);

    let keyDown = {};
    document.addEventListener('keydown', function(event) {
      let keyCode = event.keyCode;
      if (keyDown[keyCode]) return;
      keyDown[keyCode] = true;
      this.spaceship.updateState(keyDown);
    }.bind(this));
    document.addEventListener('keyup', function(event) {
      let keyCode = event.keyCode;
      keyDown[keyCode] = false;
      this.spaceship.updateState(keyDown);
    }.bind(this));

    Matter.Events.on(this.engine, 'beforeUpdate', function(event) {
      this.spaceship.beforeUpdate();
    }.bind(this));
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
        this.spaceship.animate(this.particleSystem, this.engine);
			}
		}

		this.particleSystem.update(this.tick);

    this.earth.animate(this.clock.getDelta());

    this.asteroid.animate(this.clock.getDelta());

    this.controls.update();

    TWEEN.update();

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}

window.onload = function() {
  let game = new Game();
  game.init();
  game.animate();
};
