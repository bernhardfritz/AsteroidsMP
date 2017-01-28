import * as THREE from 'three';
import Stats from 'stats.js';
import dat from 'dat-gui';

class Game {
  constructor() {
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    this.stats = new Stats();
    this.gui = new dat.GUI();
    this.settings = new Settings();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    // Create a WebGLRenderer and turn on shadows in the renderer
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    // Create a DirectionalLight and turn on shadows for the light
    let light = new THREE.DirectionalLight(0xffffff, 1, 100);
    light.position.set(1, 1, 1); // default; light shining from top
    light.castShadow = true; // default false
    this.scene.add(light);

    // TODO add support for more than one light source
    let lightFolder = this.gui.addFolder('light');
    lightFolder.add(light.position, 'x', -10, 10);
    lightFolder.add(light.position, 'y', -10, 10);
    lightFolder.add(light.position, 'z', -10, 10);

    // Set up shadow properties for the light
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default

    // Create a sphere that cast shadows (but does not receive them)
    let sphereGeometry = new THREE.SphereBufferGeometry(5, 32, 32);
    let sphereMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.gui.add(sphere.position, 'x', -5, 5);
    sphere.castShadow = true; // default is false
    sphere.receiveShadow = false; // default
    this.scene.add(sphere);

    // Create a plane that receives shadows (but does not cast them)
    let planeGeometry = new THREE.PlaneBufferGeometry(20, 20, 32, 32);
    let planeMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    this.scene.add(plane);

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
  }

  animate() {
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
    requestAnimationFrame(this.animate.bind(this));
  }
}

class Settings {
  constructor() {
    this.myString = 'helloworld';
    this.myNumber = 1.0;
    this.myBoolean = true;
    this.lightPositionX = 0.0;
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
