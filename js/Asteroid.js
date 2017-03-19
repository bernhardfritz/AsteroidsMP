import Utils from './Utils.js';

const minSpawnRadius = 450;
const maxSpawnRadius = 500;
const minScale = 8;
const maxScale = 12;
const minDeltaRotation = 500;
const maxDeltaRotation = 1000;

module.exports = class Asteroid {
  constructor() {
    this.asteroidMesh = {};
    var deltaRotationX = (Utils.getRandomInt(0, 1) === 0 ? -1 : 1) * Utils.getRandomArbitrary(minDeltaRotation, maxDeltaRotation);
    var deltaRotationY = (Utils.getRandomInt(0, 1) === 0 ? -1 : 1) * Utils.getRandomArbitrary(minDeltaRotation, maxDeltaRotation);
    var deltaRotationZ = (Utils.getRandomInt(0, 1) === 0 ? -1 : 1) * Utils.getRandomArbitrary(minDeltaRotation, maxDeltaRotation);
    this.deltaRotation = new THREE.Vector3(deltaRotationX, deltaRotationY, deltaRotationZ);
    this.velocity = new THREE.Vector3();
  }

  init(scene, objLoader, mtlLoader) {
    mtlLoader.setPath('models/');
	  mtlLoader.setTexturePath('textures/');
    mtlLoader.load('stone1.mtl', function(materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.setPath('models/');
      objLoader.load('stone1.obj', function(object) {
        this.asteroidMesh = object;
        var randomScale = Utils.getRandomArbitrary(minScale, maxScale);
        this.asteroidMesh.scale.set(randomScale, randomScale, randomScale);
        var randomRadius = Utils.getRandomArbitrary(minSpawnRadius, maxSpawnRadius);
        var randomAngle = Utils.getRandomArbitrary(0, 2 * Math.PI);
        var spawnPoint = new THREE.Vector3(randomRadius * Math.cos(randomAngle), randomRadius * Math.sin(randomAngle), 0);
        this.velocity.copy(spawnPoint);
        this.velocity.normalize();
        this.velocity.negate();
        this.asteroidMesh.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);
        scene.add(this.asteroidMesh);
      }.bind(this));
    }.bind(this));
  }

  animate(delta) {
    this.asteroidMesh.rotation.x += this.deltaRotation.x * delta;
    this.asteroidMesh.rotation.y += this.deltaRotation.y * delta;
    this.asteroidMesh.rotation.z += this.deltaRotation.z * delta;
    this.asteroidMesh.position.x += this.velocity.x;
    this.asteroidMesh.position.y += this.velocity.y;
    this.asteroidMesh.position.z += this.velocity.z;
  }
};
