module.exports = class Spaceship {
  constructor() {
    this.material = new THREE.MeshPhongMaterial();
    this.commonThrusterOptions = {};
    this.leftThrusterOptions = {};
    this.leftThrusterLight = new THREE.PointLight(0xfc7b21, 2, 100);
    this.rightThrusterOptions = {};
    this.rightThrusterLight = new THREE.PointLight(0xfc7b21, 2, 100);
  }

  init(scene, objLoader, textureLoader) {
    objLoader.load('models/Arc170.obj', function(group) {
      this.material.map = textureLoader.load("textures/ARC170_TXT_VERSION_4_D.png");
      this.material.specularMap = textureLoader.load("textures/ARC170_TXT_VERSION_4_S.png");
      this.material.normalMap = textureLoader.load("textures/ARC170_TXT_VERSION_4_N.png");

      group.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          child.material = this.material;
        }
      }.bind(this));
      group.rotation.x = - Math.PI / 2;
      group.rotation.z = Math.PI;
      let box = new THREE.Box3().setFromObject(group);
      let factor = 10.0 / box.max.x;
      group.scale.set(factor, factor, factor);
      scene.add(group);

      // box helper - doesn't have diagonals
      var boxHelper = new THREE.BoxHelper(group);
      scene.add(boxHelper);
    }.bind(this));

    this.commonThrusterOptions.positionRandomness = 0.1;
    this.commonThrusterOptions.velocity = new THREE.Vector3();
    this.commonThrusterOptions.velocityRandomness = 0.25;
    this.commonThrusterOptions.color = 0xfc7b21;
    this.commonThrusterOptions.colorRandomness = 0.15;
    this.commonThrusterOptions.turbulence = 0.25;
    this.commonThrusterOptions.lifetime = 2;
    this.commonThrusterOptions.size = 5;
    this.commonThrusterOptions.sizeRandomness = 1;

    for (var k in this.commonThrusterOptions) {
      this.leftThrusterOptions[k] = this.commonThrusterOptions[k];
      this.rightThrusterOptions[k] = this.commonThrusterOptions[k];
    }
    this.leftThrusterOptions.position = new THREE.Vector3(-1.97, -4.77, 2.06);
    this.rightThrusterOptions.position = new THREE.Vector3(1.97, -4.77, 2.06);

    scene.add(this.leftThrusterLight);
    scene.add(this.rightThrusterLight);
  }

  animate(particleSystem) {
    particleSystem.spawnParticle(this.leftThrusterOptions);
    this.leftThrusterLight.position.set(this.leftThrusterOptions.position.x, this.leftThrusterOptions.position.y, this.leftThrusterOptions.position.z);
    particleSystem.spawnParticle(this.rightThrusterOptions);
    this.rightThrusterLight.position.set(this.rightThrusterOptions.position.x, this.rightThrusterOptions.position.y, this.rightThrusterOptions.position.z);
  }
};
