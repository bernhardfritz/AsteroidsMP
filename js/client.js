import * as THREE from 'three';
global.THREE = THREE;
import Stats from 'stats.js';
import dat from 'dat-gui';
require('./OBJLoader.js');
require('./GPUParticleSystem.js');

class Game {
  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    this.particleSystem = new THREE.GPUParticleSystem({
      maxParticles: 250000
    });
    this.clock = new THREE.Clock(true);
    this.stats = new Stats();
    this.gui = new dat.GUI();
    this.settings = new Settings();
    this.objLoader = new THREE.OBJLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.pointLight = new THREE.PointLight(0xffffff, 2, 100);
    this.tick = 0;
    this.options = {};
    this.spawnerOptions = {};
    this.spaceshipMaterial = new THREE.MeshPhongMaterial();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    this.scene.add(this.pointLight);

    let ambientLight = new THREE.AmbientLight(0x101030);
		this.scene.add(ambientLight);
		// let directionalLight = new THREE.DirectionalLight(0xffeedd);
		// directionalLight.position.set(0, 0, 1);
		// this.scene.add(directionalLight);

    // options passed during each spawned
    this.options = {
      position: new THREE.Vector3(),
      positionRandomness: 0.3,
      velocity: new THREE.Vector3(),
      velocityRandomness: 0.5,
      color: 0xaa88ff,
      colorRandomness: 0.2,
      turbulence: 0.5,
      lifetime: 2,
      size: 5,
      sizeRandomness: 1
    };
    this.spawnerOptions = {
      spawnRate: 15000,
      horizontalSpeed: 1.5,
      verticalSpeed: 1.33,
      timeScale: 1
    };
    this.scene.add(this.particleSystem);

    this.objLoader.load('models/Arc170.obj', function(group) {
      this.spaceshipMaterial.map = this.textureLoader.load("textures/ARC170_TXT_VERSION_4_D.png");
      this.spaceshipMaterial.specularMap = this.textureLoader.load("textures/ARC170_TXT_VERSION_4_S.png");
      this.spaceshipMaterial.normalMap = this.textureLoader.load("textures/ARC170_TXT_VERSION_4_N.png");

      group.traverse(function(child) {
				if (child instanceof THREE.Mesh) {
          child.material = this.spaceshipMaterial;
				}
      }.bind(this));
      group.rotation.x = - Math.PI / 2;
      group.rotation.z = Math.PI;
      group.position.set(0, 0, 0);
      group.scale.set(0.01, 0.01, 0.01);
      console.log(group);
      this.scene.add(group);
    }.bind(this));

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
    let particleSystemFolder = this.gui.addFolder('particleSystem');
    particleSystemFolder.add(this.options, "velocityRandomness", 0, 3);
		particleSystemFolder.add(this.options, "positionRandomness", 0, 3);
		particleSystemFolder.add(this.options, "size", 1, 20);
		particleSystemFolder.add(this.options, "sizeRandomness", 0, 25);
		particleSystemFolder.add(this.options, "colorRandomness", 0, 1);
		particleSystemFolder.add(this.options, "lifetime", 0.1, 10);
		particleSystemFolder.add(this.options, "turbulence", 0, 1);
		particleSystemFolder.add(this.spawnerOptions, "spawnRate", 10, 30000);
		particleSystemFolder.add(this.spawnerOptions, "timeScale", -1, 1);

    window.addEventListener('resize', function() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
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
			this.options.position.x = Math.sin(this.tick * this.spawnerOptions.horizontalSpeed) * 20;
			this.options.position.y = Math.sin(this.tick * this.spawnerOptions.verticalSpeed) * 10;
			this.options.position.z = Math.sin(this.tick * this.spawnerOptions.horizontalSpeed + this.spawnerOptions.verticalSpeed) * 5;
			for (var x = 0; x < this.spawnerOptions.spawnRate * delta; x++) {
				// Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
				// their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
				this.particleSystem.spawnParticle(this.options);
			}
      this.pointLight.position.set(this.options.position.x, this.options.position.y, this.options.position.z);
		}
		this.particleSystem.update(this.tick);

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
